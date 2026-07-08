/*
 * patternSync — the id-bridge + diff state machine that keeps a <z-pattern-roll>
 * element in sync with Convex, extracted from PatternEditor so it can be unit
 * tested in isolation (it has no DOM / Convex / framework dependencies — the
 * caller injects the three mutation I/O functions).
 *
 * The element is authoritative: it owns editing and emits its full signal list
 * on every mutation. This module maps the element's numeric ids + beats to
 * Convex string _ids + ticks, remembers the last-known Convex shape per signal,
 * and turns each emitted list into the minimal add / update / remove calls —
 * including the awkward cases: collision splits (an existing signal keeps its id
 * as the trimmed piece while a new fragment id appears), full removal, and edits
 * that land while an addSignal is still in flight.
 */

import type { PatternSignalT } from '@amore/music/types'

const TICKS_PER_BEAT = 480
const beatsToTicks = (beats: number): number => Math.round(beats * TICKS_PER_BEAT)
const ticksToBeats = (ticks: number): number => ticks / TICKS_PER_BEAT

// The Convex-facing shape of a signal (minus its _id), used for diffing.
export type SignalShapeT = {
	chordToneIndex: number
	octaveModifier: number
	startTicks: number
	durationTicks: number
	velocity: number
	probability: number
	isEnabled: boolean
}

// The element's signal shape (numeric id, beats).
export type ElementSignalT = {
	id: number
	tone: number
	octave: number
	start: number
	duration: number
	velocity: number
	probability: number
	enabled: boolean
}

// addSignal only accepts the core fields (see convex/patterns.ts); probability /
// isEnabled are applied as a follow-up updateSignal.
export type AddCoreT = Pick<SignalShapeT, 'chordToneIndex' | 'octaveModifier' | 'startTicks' | 'durationTicks' | 'velocity'>

export type PatternSyncDepsT = {
	add: (core: AddCoreT) => Promise<string>
	update: (convexId: string, patch: Partial<SignalShapeT>) => void
	remove: (convexId: string) => void
}

const shapeFromServer = (s: PatternSignalT): SignalShapeT => ({
	chordToneIndex: s.chordToneIndex,
	octaveModifier: s.octaveModifier,
	startTicks: s.startTicks,
	durationTicks: s.durationTicks,
	velocity: s.velocity,
	probability: s.probability ?? 1,
	isEnabled: s.isEnabled !== false
})

const shapeFromElement = (s: ElementSignalT): SignalShapeT => ({
	chordToneIndex: s.tone,
	octaveModifier: s.octave,
	startTicks: beatsToTicks(s.start),
	durationTicks: beatsToTicks(s.duration),
	velocity: s.velocity,
	probability: s.probability,
	isEnabled: s.enabled
})

const coreOf = (shape: SignalShapeT): AddCoreT => ({
	chordToneIndex: shape.chordToneIndex,
	octaveModifier: shape.octaveModifier,
	startTicks: shape.startTicks,
	durationTicks: shape.durationTicks,
	velocity: shape.velocity
})

const diffShapes = (before: SignalShapeT | undefined, after: SignalShapeT): Partial<SignalShapeT> | null => {
	if (before === undefined) return { ...after }
	const patch: Partial<SignalShapeT> = {}
	for (const key of Object.keys(after) as (keyof SignalShapeT)[]) {
		if (before[key] !== after[key]) (patch as any)[key] = after[key]
	}
	return Object.keys(patch).length > 0 ? patch : null
}

export type PatternSyncT = {
	/** Reset all id maps and convert a Convex snapshot to element signals. */
	seed: (serverSignals: PatternSignalT[]) => ElementSignalT[]
	/** Diff the element's emitted signal list into Convex mutations. */
	applyChange: (list: ElementSignalT[]) => void
}

export const createPatternSync = (deps: PatternSyncDepsT): PatternSyncT => {
	const idToConvex = new Map<number, string>() // element id -> convex _id (once saved)
	const convexToId = new Map<string, number>()
	const prev = new Map<number, SignalShapeT>() // element id -> last-known Convex shape
	const pending = new Set<number>() // element ids whose addSignal is in flight
	const removedWhilePending = new Set<number>()
	let idCounter = 0

	const seed = (serverSignals: PatternSignalT[]): ElementSignalT[] => {
		idToConvex.clear()
		convexToId.clear()
		prev.clear()
		pending.clear()
		removedWhilePending.clear()
		idCounter = 0
		return serverSignals.map((s) => {
			const eid = ++idCounter
			convexToId.set(s._id, eid)
			idToConvex.set(eid, s._id)
			prev.set(eid, shapeFromServer(s))
			return {
				id: eid,
				tone: s.chordToneIndex,
				octave: s.octaveModifier,
				start: ticksToBeats(s.startTicks),
				duration: ticksToBeats(s.durationTicks),
				velocity: s.velocity,
				probability: s.probability ?? 1,
				enabled: s.isEnabled !== false
			}
		})
	}

	const add = async (elementId: number, shape: SignalShapeT): Promise<void> => {
		pending.add(elementId)
		try {
			const convexId = await deps.add(coreOf(shape))
			pending.delete(elementId)
			if (removedWhilePending.delete(elementId)) {
				deps.remove(convexId)
				return
			}
			idToConvex.set(elementId, convexId)
			convexToId.set(convexId, elementId)
			// addSignal starts probability=1 / isEnabled=true; sync anything the add
			// couldn't carry, plus any edits made while it was in flight.
			const added: SignalShapeT = { ...shape, probability: 1, isEnabled: true }
			const latest = prev.get(elementId) ?? shape
			const patch = diffShapes(added, latest)
			if (patch !== null) deps.update(convexId, patch)
		} catch (error) {
			pending.delete(elementId)
			prev.delete(elementId)
			throw error
		}
	}

	const applyChange = (list: ElementSignalT[]): void => {
		const seen = new Set(list.map((s) => s.id))

		// removals: any element id we tracked that's no longer present
		for (const eid of [...prev.keys()]) {
			if (seen.has(eid)) continue
			const convexId = idToConvex.get(eid)
			if (convexId !== undefined) {
				deps.remove(convexId)
				idToConvex.delete(eid)
				convexToId.delete(convexId)
			} else if (pending.has(eid)) {
				removedWhilePending.add(eid)
			}
			prev.delete(eid)
		}

		// adds + updates
		for (const s of list) {
			const shape = shapeFromElement(s)
			const convexId = idToConvex.get(s.id)
			if (convexId !== undefined) {
				const patch = diffShapes(prev.get(s.id), shape)
				if (patch !== null) deps.update(convexId, patch)
				prev.set(s.id, shape)
			} else if (pending.has(s.id)) {
				prev.set(s.id, shape) // reconciled once the add resolves
			} else {
				prev.set(s.id, shape)
				void add(s.id, shape).catch((error) => console.error('[amore] failed to add signal', error))
			}
		}
	}

	return { seed, applyChange }
}
