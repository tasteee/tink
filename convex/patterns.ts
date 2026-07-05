import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { requireOwnedPattern, requireOwnedProject } from './projectAuthz'

const TAKE_LIMIT = 1000
const TICKS_PER_BEAT = 480
const MIN_DURATION_TICKS = TICKS_PER_BEAT / 8
const MIN_PATTERN_DURATION_TICKS = TICKS_PER_BEAT

type PatternSignalT = {
	_id: string
	chordToneIndex: number
	octaveModifier: number
	startTicks: number
	durationTicks: number
	velocity: number
	probability?: number
	isEnabled?: boolean
}

const makeLocalId = (): string => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
const normalizeVelocity = (value: number): number => Math.min(127, Math.max(1, Math.round(value)))
const normalizeProbability = (value: number): number => Math.min(1, Math.max(0, value))
const normalizeSignals = (signals: PatternSignalT[] = []): PatternSignalT[] => {
	return [...signals].sort((a, b) => a.startTicks - b.startTicks || a.chordToneIndex - b.chordToneIndex)
}

const findSignalIndex = (signals: PatternSignalT[], signalId: string): number => {
	const index = signals.findIndex((signal) => signal._id === signalId)
	if (index === -1) throw new Error('Pattern signal not found')
	return index
}

export const get = query({
	args: { id: v.id('patterns') },
	handler: async (ctx, args) => {
		const pattern = await requireOwnedPattern(ctx, args.id)
		return { ...pattern, signals: normalizeSignals((pattern.signals ?? []) as PatternSignalT[]) }
	}
})

export const listForProject = query({
	args: { projectId: v.id('projects') },
	handler: async (ctx, args) => {
		await requireOwnedProject(ctx, args.projectId)
		const patterns = await ctx.db
			.query('patterns')
			.withIndex('by_project', (q) => q.eq('projectId', args.projectId))
			.take(TAKE_LIMIT)
		return patterns.map((pattern) => ({
			...pattern,
			signals: normalizeSignals((pattern.signals ?? []) as PatternSignalT[])
		}))
	}
})

export const listSignals = query({
	args: { patternId: v.id('patterns') },
	handler: async (ctx, args) => {
		const pattern = await requireOwnedPattern(ctx, args.patternId)
		return normalizeSignals((pattern.signals ?? []) as PatternSignalT[])
	}
})

export const update = mutation({
	args: {
		id: v.id('patterns'),
		name: v.optional(v.string()),
		durationTicks: v.optional(v.number()),
		gridTicks: v.optional(v.number()),
		loopMode: v.optional(v.union(v.literal('loopAcrossProgression'), v.literal('restartOnChord'))),
		description: v.optional(v.string()),
		visibility: v.optional(v.union(v.literal('private'), v.literal('unlisted'), v.literal('public')))
	},
	handler: async (ctx, args) => {
		await requireOwnedPattern(ctx, args.id)

		const patch: {
			name?: string
			durationTicks?: number
			gridTicks?: number
			loopMode?: 'loopAcrossProgression' | 'restartOnChord'
			description?: string
			visibility?: 'private' | 'unlisted' | 'public'
			updatedAt: number
		} = { updatedAt: Date.now() }

		if (args.name !== undefined) patch.name = args.name.trim() || 'Pattern'
		if (args.durationTicks !== undefined) patch.durationTicks = Math.max(MIN_PATTERN_DURATION_TICKS, Math.round(args.durationTicks))
		if (args.gridTicks !== undefined) patch.gridTicks = Math.max(MIN_DURATION_TICKS, Math.round(args.gridTicks))
		if (args.loopMode !== undefined) patch.loopMode = args.loopMode
		if (args.description !== undefined) patch.description = args.description
		if (args.visibility !== undefined) patch.visibility = args.visibility

		await ctx.db.patch(args.id, patch)
	}
})

export const addSignal = mutation({
	args: {
		patternId: v.id('patterns'),
		chordToneIndex: v.number(),
		octaveModifier: v.number(),
		startTicks: v.number(),
		durationTicks: v.number(),
		velocity: v.number()
	},
	handler: async (ctx, args): Promise<string> => {
		const pattern = await requireOwnedPattern(ctx, args.patternId)
		const signals = normalizeSignals((pattern.signals ?? []) as PatternSignalT[])
		const signal: PatternSignalT = {
			_id: makeLocalId(),
			chordToneIndex: Math.max(1, Math.round(args.chordToneIndex)),
			octaveModifier: Math.round(args.octaveModifier),
			startTicks: Math.max(0, Math.round(args.startTicks)),
			durationTicks: Math.max(MIN_DURATION_TICKS, Math.round(args.durationTicks)),
			velocity: normalizeVelocity(args.velocity),
			probability: 1
		}
		await ctx.db.patch(args.patternId, { signals: normalizeSignals([...signals, signal]), updatedAt: Date.now() })
		return signal._id
	}
})

export const updateSignal = mutation({
	args: {
		patternId: v.id('patterns'),
		id: v.string(),
		chordToneIndex: v.optional(v.number()),
		octaveModifier: v.optional(v.number()),
		startTicks: v.optional(v.number()),
		durationTicks: v.optional(v.number()),
		velocity: v.optional(v.number()),
		probability: v.optional(v.number()),
		isEnabled: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const pattern = await requireOwnedPattern(ctx, args.patternId)
		const signals = normalizeSignals((pattern.signals ?? []) as PatternSignalT[])
		const index = findSignalIndex(signals, args.id)
		const signal = { ...signals[index] }

		if (args.chordToneIndex !== undefined) signal.chordToneIndex = Math.max(1, Math.round(args.chordToneIndex))
		if (args.octaveModifier !== undefined) signal.octaveModifier = Math.round(args.octaveModifier)
		if (args.startTicks !== undefined) signal.startTicks = Math.max(0, Math.round(args.startTicks))
		if (args.durationTicks !== undefined) signal.durationTicks = Math.max(MIN_DURATION_TICKS, Math.round(args.durationTicks))
		if (args.velocity !== undefined) signal.velocity = normalizeVelocity(args.velocity)
		if (args.probability !== undefined) signal.probability = normalizeProbability(args.probability)
		if (args.isEnabled !== undefined) signal.isEnabled = args.isEnabled

		signals[index] = signal
		await ctx.db.patch(args.patternId, { signals: normalizeSignals(signals), updatedAt: Date.now() })
	}
})

export const duplicateSignal = mutation({
	args: { patternId: v.id('patterns'), id: v.string() },
	handler: async (ctx, args): Promise<string> => {
		const pattern = await requireOwnedPattern(ctx, args.patternId)
		const signals = normalizeSignals((pattern.signals ?? []) as PatternSignalT[])
		const index = findSignalIndex(signals, args.id)
		const signal = signals[index]
		const maxStartTicks = Math.max(0, pattern.durationTicks - MIN_DURATION_TICKS)
		const startTicks = Math.min(signal.startTicks + signal.durationTicks, maxStartTicks)
		const clone: PatternSignalT = {
			...signal,
			_id: makeLocalId(),
			startTicks,
			durationTicks: Math.min(signal.durationTicks, pattern.durationTicks - startTicks)
		}
		await ctx.db.patch(args.patternId, { signals: normalizeSignals([...signals, clone]), updatedAt: Date.now() })
		return clone._id
	}
})

export const removeSignal = mutation({
	args: { patternId: v.id('patterns'), id: v.string() },
	handler: async (ctx, args) => {
		const pattern = await requireOwnedPattern(ctx, args.patternId)
		const signals = normalizeSignals((pattern.signals ?? []) as PatternSignalT[])
		await ctx.db.patch(args.patternId, {
			signals: signals.filter((signal) => signal._id !== args.id),
			updatedAt: Date.now()
		})
	}
})
