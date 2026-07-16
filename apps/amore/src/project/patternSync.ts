/*
 * patternSync — the id-bridge + diff state machine that keeps a <z-pattern-roll>
 * element in sync with Convex, extracted from PatternEditor so it can be unit
 * tested in isolation (it has no DOM / Convex / framework dependencies — the
 * caller injects the three mutation I/O functions).
 *
 * The element is authoritative: it owns editing and emits its full signal list
 * on every mutation. This module maps the element's numeric ids + beats to
 * stable string ids (a real Convex `_id` once saved, or a client-minted id
 * beforehand — mirroring `clientItemId` on progression.addItem) and ticks, and
 * keeps two snapshots of each signal's Convex-facing shape: `saved` (as of the
 * last successful flush) and `current` (as of the last recorded change). Edits
 * only ever touch local state; `flush` is the one place that talks to Convex,
 * diffing `current` against `saved` into the minimal add / update / remove calls.
 */

import type { PatternSignalT } from '@amore/music/types'

const TICKS_PER_BEAT = 480
const beatsToTicks = (beats: number): number => Math.round(beats * TICKS_PER_BEAT)
const ticksToBeats = (ticks: number): number => ticks / TICKS_PER_BEAT
const makeLocalId = (): string => `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

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
	add: (clientSignalId: string, core: AddCoreT) => Promise<void>
	update: (convexId: string, patch: Partial<SignalShapeT>) => Promise<void>
	remove: (convexId: string) => Promise<void>
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

const toPatternSignal = (id: string, shape: SignalShapeT): PatternSignalT =>
	({ _id: id, ...shape }) as unknown as PatternSignalT

export type PatternSyncT = {
	/** Reset all id maps and convert a Convex snapshot to element signals. */
	seed: (serverSignals: PatternSignalT[]) => ElementSignalT[]
	/** Record the element's emitted signal list into local state (no network). */
	recordChange: (list: ElementSignalT[]) => PatternSignalT[]
	/** Diff `current` against the last-saved baseline and push the minimal Convex mutations. */
	flush: (deps: PatternSyncDepsT) => Promise<void>
}

export const createPatternSync = (): PatternSyncT => {
	const idToAssigned = new Map<number, string>() // element id -> assigned id (real or client-minted)
	const current = new Map<string, SignalShapeT>() // assigned id -> latest local shape
	let saved = new Map<string, SignalShapeT>() // assigned id -> shape as of last flush

	const seed = (serverSignals: PatternSignalT[]): ElementSignalT[] => {
		idToAssigned.clear()
		current.clear()
		saved = new Map()
		let idCounter = 0
		return serverSignals.map((s) => {
			const eid = ++idCounter
			idToAssigned.set(eid, s._id)
			const shape = shapeFromServer(s)
			current.set(s._id, shape)
			saved.set(s._id, shape)
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

	const recordChange = (list: ElementSignalT[]): PatternSignalT[] => {
		const seen = new Set(list.map((s) => s.id))

		for (const [eid, assignedId] of [...idToAssigned.entries()]) {
			if (seen.has(eid)) continue
			idToAssigned.delete(eid)
			current.delete(assignedId)
		}

		const result: PatternSignalT[] = []
		for (const s of list) {
			let assignedId = idToAssigned.get(s.id)
			if (assignedId === undefined) {
				assignedId = makeLocalId()
				idToAssigned.set(s.id, assignedId)
			}
			const shape = shapeFromElement(s)
			current.set(assignedId, shape)
			result.push(toPatternSignal(assignedId, shape))
		}
		return result
	}

	const flush = async (flushDeps: PatternSyncDepsT): Promise<void> => {
		const removedIds = [...saved.keys()].filter((id) => !current.has(id))
		const addedIds = [...current.keys()].filter((id) => !saved.has(id))
		const changedIds = [...current.keys()].filter((id) => saved.has(id))

		await Promise.all([
			...removedIds.map((id) => flushDeps.remove(id)),
			...addedIds.map(async (id) => {
				const shape = current.get(id)!
				await flushDeps.add(id, coreOf(shape))
				const patch = diffShapes({ ...shape, probability: 1, isEnabled: true }, shape)
				if (patch !== null) await flushDeps.update(id, patch)
			}),
			...changedIds.map(async (id) => {
				const patch = diffShapes(saved.get(id), current.get(id)!)
				if (patch !== null) await flushDeps.update(id, patch)
			})
		])

		saved = new Map(current)
	}

	return { seed, recordChange, flush }
}
