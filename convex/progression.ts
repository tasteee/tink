import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { requireOwnedProgression, requireOwnedProject } from './projectAuthz'

const TAKE_LIMIT = 500
const TICKS_PER_BEAT = 480
const MIN_DURATION_TICKS = TICKS_PER_BEAT / 4

const chordRoot = v.union(
	v.object({ kind: v.literal('scaleDegree'), degree: v.number() }),
	v.object({ kind: v.literal('pitchClass'), pitchClass: v.number() })
)
const voicing = v.union(v.literal('closed'), v.literal('open'), v.literal('drop2'), v.literal('spread'))

type ChordRootT =
	| { kind: 'scaleDegree'; degree: number }
	| { kind: 'pitchClass'; pitchClass: number }
type ChordVoicingT = 'closed' | 'open' | 'drop2' | 'spread'
type ProgressionChordItemT = {
	_id: string
	order: number
	type: 'chord'
	root: ChordRootT
	qualityId: string
	inversion: number
	durationTicks: number
	isEnabled?: boolean
	octaveOffset?: number
	voicing?: ChordVoicingT
	velocityMode?: 'relative' | 'absolute'
	velocityMin?: number
	velocityMax?: number
}
type ProgressionRestItemT = {
	_id: string
	order: number
	type: 'rest'
	durationTicks: number
	isEnabled?: boolean
}
type ProgressionItemT = ProgressionChordItemT | ProgressionRestItemT

const makeLocalId = (): string => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
const normalizeVelocity = (value: number): number => Math.min(127, Math.max(1, Math.round(value)))

const normalizeItems = (items: ProgressionItemT[] = []): ProgressionItemT[] => {
	return [...items]
		.sort((a, b) => a.order - b.order)
		.map((item, order) => ({ ...item, order }))
}

const findItemIndex = (items: ProgressionItemT[], itemId: string): number => {
	const index = items.findIndex((item) => item._id === itemId)
	if (index === -1) throw new Error('Progression item not found')
	return index
}

export const get = query({
	args: { id: v.id('progressions') },
	handler: async (ctx, args) => {
		const progression = await requireOwnedProgression(ctx, args.id)
		return { ...progression, items: normalizeItems((progression.items ?? []) as ProgressionItemT[]) }
	}
})

export const listForProject = query({
	args: { projectId: v.id('projects') },
	handler: async (ctx, args) => {
		await requireOwnedProject(ctx, args.projectId)
		const progressions = await ctx.db
			.query('progressions')
			.withIndex('by_project', (q) => q.eq('projectId', args.projectId))
			.take(TAKE_LIMIT)
		return progressions.map((progression) => ({
			...progression,
			items: normalizeItems((progression.items ?? []) as ProgressionItemT[])
		}))
	}
})

export const listItems = query({
	args: { progressionId: v.id('progressions') },
	handler: async (ctx, args) => {
		const progression = await requireOwnedProgression(ctx, args.progressionId)
		return normalizeItems((progression.items ?? []) as ProgressionItemT[])
	}
})

export const addItem = mutation({
	args: {
		progressionId: v.id('progressions'),
		clientItemId: v.optional(v.string()),
		root: chordRoot,
		qualityId: v.string(),
		durationTicks: v.number(),
		inversion: v.optional(v.number()),
		octaveOffset: v.optional(v.number()),
		voicing: v.optional(voicing),
		velocityMin: v.optional(v.number()),
		velocityMax: v.optional(v.number()),
		insertIndex: v.optional(v.number())
	},
	handler: async (ctx, args): Promise<string> => {
		const progression = await requireOwnedProgression(ctx, args.progressionId)
		const items = normalizeItems((progression.items ?? []) as ProgressionItemT[])
		const insertIndex = Math.min(items.length, Math.max(0, Math.round(args.insertIndex ?? items.length)))
		const velocityMin = args.velocityMin === undefined ? undefined : normalizeVelocity(args.velocityMin)
		const velocityMax = args.velocityMax === undefined ? undefined : normalizeVelocity(args.velocityMax)
		const item: ProgressionChordItemT = {
			_id: args.clientItemId ?? makeLocalId(),
			order: insertIndex,
			type: 'chord',
			root: args.root,
			qualityId: args.qualityId,
			inversion: Math.max(0, Math.round(args.inversion ?? 0)),
			durationTicks: Math.max(MIN_DURATION_TICKS, Math.round(args.durationTicks))
		}
		if (args.octaveOffset !== undefined) item.octaveOffset = Math.round(args.octaveOffset)
		if (args.voicing !== undefined) item.voicing = args.voicing
		if (velocityMin !== undefined || velocityMax !== undefined) item.velocityMode = 'absolute'
		if (velocityMin !== undefined) item.velocityMin = velocityMin
		if (velocityMax !== undefined) item.velocityMax = velocityMax

		const nextItems = normalizeItems([...items.slice(0, insertIndex), item, ...items.slice(insertIndex)])
		await ctx.db.patch(args.progressionId, { items: nextItems, updatedAt: Date.now() })
		return item._id
	}
})

export const updateDuration = mutation({
	args: { progressionId: v.id('progressions'), itemId: v.string(), durationTicks: v.number() },
	handler: async (ctx, args) => {
		const progression = await requireOwnedProgression(ctx, args.progressionId)
		const items = normalizeItems((progression.items ?? []) as ProgressionItemT[])
		const index = findItemIndex(items, args.itemId)
		items[index] = {
			...items[index],
			durationTicks: Math.max(MIN_DURATION_TICKS, Math.round(args.durationTicks))
		}
		await ctx.db.patch(args.progressionId, { items, updatedAt: Date.now() })
	}
})

export const updateInversion = mutation({
	args: { progressionId: v.id('progressions'), itemId: v.string(), inversion: v.number() },
	handler: async (ctx, args) => {
		const progression = await requireOwnedProgression(ctx, args.progressionId)
		const items = normalizeItems((progression.items ?? []) as ProgressionItemT[])
		const index = findItemIndex(items, args.itemId)
		const item = items[index]
		if (item.type !== 'chord') throw new Error('Only chord items can be inverted')
		items[index] = { ...item, inversion: Math.max(0, Math.round(args.inversion)) }
		await ctx.db.patch(args.progressionId, { items, updatedAt: Date.now() })
	}
})

export const updateChordModifiers = mutation({
	args: {
		progressionId: v.id('progressions'),
		itemId: v.string(),
		inversion: v.optional(v.number()),
		octaveOffset: v.optional(v.number()),
		voicing: v.optional(voicing),
		velocityMin: v.optional(v.number()),
		velocityMax: v.optional(v.number()),
		isEnabled: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const progression = await requireOwnedProgression(ctx, args.progressionId)
		const items = normalizeItems((progression.items ?? []) as ProgressionItemT[])
		const index = findItemIndex(items, args.itemId)
		const item = items[index]
		if (item.type !== 'chord') throw new Error('Only chord items have chord modifiers')

		const next: ProgressionChordItemT = { ...item }
		if (args.inversion !== undefined) next.inversion = Math.max(0, Math.round(args.inversion))
		if (args.octaveOffset !== undefined) next.octaveOffset = Math.round(args.octaveOffset)
		if (args.voicing !== undefined) next.voicing = args.voicing
		if (args.velocityMin !== undefined) {
			next.velocityMode = 'absolute'
			next.velocityMin = normalizeVelocity(args.velocityMin)
		}
		if (args.velocityMax !== undefined) {
			next.velocityMode = 'absolute'
			next.velocityMax = normalizeVelocity(args.velocityMax)
		}
		if (args.isEnabled !== undefined) next.isEnabled = args.isEnabled

		items[index] = next
		await ctx.db.patch(args.progressionId, { items, updatedAt: Date.now() })
	}
})

export const reorderItems = mutation({
	args: { progressionId: v.id('progressions'), orderedIds: v.array(v.string()) },
	handler: async (ctx, args) => {
		const progression = await requireOwnedProgression(ctx, args.progressionId)
		const items = normalizeItems((progression.items ?? []) as ProgressionItemT[])
		const byId = new Map(items.map((item) => [item._id, item]))
		const reordered: ProgressionItemT[] = []
		for (const id of args.orderedIds) {
			const item = byId.get(id)
			if (item === undefined) throw new Error('Progression item not found')
			reordered.push(item)
		}
		if (reordered.length !== items.length) throw new Error('Progression reorder length mismatch')
		await ctx.db.patch(args.progressionId, { items: normalizeItems(reordered), updatedAt: Date.now() })
	}
})

export const duplicateItem = mutation({
	args: { progressionId: v.id('progressions'), itemId: v.string(), clientItemId: v.optional(v.string()) },
	handler: async (ctx, args): Promise<string> => {
		const progression = await requireOwnedProgression(ctx, args.progressionId)
		const items = normalizeItems((progression.items ?? []) as ProgressionItemT[])
		const index = findItemIndex(items, args.itemId)
		const source = items[index]
		const clone = { ...source, _id: args.clientItemId ?? makeLocalId(), order: source.order + 1 } as ProgressionItemT
		const next = [...items.slice(0, index + 1), clone, ...items.slice(index + 1)]
		await ctx.db.patch(args.progressionId, { items: normalizeItems(next), updatedAt: Date.now() })
		return clone._id
	}
})

export const removeItem = mutation({
	args: { progressionId: v.id('progressions'), itemId: v.string() },
	handler: async (ctx, args) => {
		const progression = await requireOwnedProgression(ctx, args.progressionId)
		const items = normalizeItems((progression.items ?? []) as ProgressionItemT[])
		await ctx.db.patch(args.progressionId, {
			items: normalizeItems(items.filter((item) => item._id !== args.itemId)),
			updatedAt: Date.now()
		})
	}
})
