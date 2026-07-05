import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Id } from './_generated/dataModel'
import { requireOwnedPattern, requireOwnedProgression, requireOwnedProject, requireUserId } from './projectAuthz'

const LIST_LIMIT = 200
const TICKS_PER_BEAT = 480
const DEFAULT_PATTERN_LENGTH_TICKS = TICKS_PER_BEAT * 4
const DEFAULT_GRID_TICKS = TICKS_PER_BEAT / 4

export const list = query({
	args: {},
	handler: async (ctx) => {
		const ownerId = await requireUserId(ctx)
		return await ctx.db
			.query('projects')
			.withIndex('by_owner', (q) => q.eq('ownerId', ownerId))
			.order('desc')
			.take(LIST_LIMIT)
	}
})

export const get = query({
	args: { id: v.id('projects') },
	handler: async (ctx, args) => {
		return await requireOwnedProject(ctx, args.id)
	}
})

export const create = mutation({
	args: { name: v.string() },
	handler: async (ctx, args): Promise<Id<'projects'>> => {
		const ownerId = await requireUserId(ctx)
		const now = Date.now()
		const name = args.name.trim() || 'Untitled project'

		const projectId = await ctx.db.insert('projects', {
			ownerId,
			name,
			key: 'C',
			scale: 'major',
			bpm: 120,
			visibility: 'private',
			rootOctave: 4,
			createdAt: now,
			updatedAt: now
		})

		const progressionId = await ctx.db.insert('progressions', {
			ownerId,
			projectId,
			name: 'Progression',
			items: [],
			visibility: 'private',
			createdAt: now,
			updatedAt: now
		})

		const patternId = await ctx.db.insert('patterns', {
			ownerId,
			projectId,
			name: 'Pattern',
			durationTicks: DEFAULT_PATTERN_LENGTH_TICKS,
			gridTicks: DEFAULT_GRID_TICKS,
			loopMode: 'loopAcrossProgression',
			signals: [],
			visibility: 'private',
			createdAt: now,
			updatedAt: now
		})

		await ctx.db.patch('projects', projectId, { activeProgressionId: progressionId, activePatternId: patternId })
		return projectId
	}
})

export const update = mutation({
	args: {
		id: v.id('projects'),
		name: v.optional(v.string()),
		key: v.optional(v.string()),
		scale: v.optional(v.string()),
		bpm: v.optional(v.number()),
		activeProgressionId: v.optional(v.id('progressions')),
		activePatternId: v.optional(v.id('patterns')),
		description: v.optional(v.string()),
		visibility: v.optional(v.union(v.literal('private'), v.literal('unlisted'), v.literal('public'))),
		rootOctave: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		await requireOwnedProject(ctx, args.id)
		if (args.activeProgressionId !== undefined) await requireOwnedProgression(ctx, args.activeProgressionId)
		if (args.activePatternId !== undefined) await requireOwnedPattern(ctx, args.activePatternId)

		const { id, ...rest } = args
		await ctx.db.patch('projects', id, { ...rest, updatedAt: Date.now() })
	}
})

export const remove = mutation({
	args: { id: v.id('projects') },
	handler: async (ctx, args) => {
		await requireOwnedProject(ctx, args.id)

		const progressions = await ctx.db
			.query('progressions')
			.withIndex('by_project', (q) => q.eq('projectId', args.id))
			.take(LIST_LIMIT)
		for (const progression of progressions) {
			await ctx.db.delete('progressions', progression._id)
		}

		const patterns = await ctx.db
			.query('patterns')
			.withIndex('by_project', (q) => q.eq('projectId', args.id))
			.take(LIST_LIMIT)
		for (const pattern of patterns) {
			await ctx.db.delete('patterns', pattern._id)
		}

		await ctx.db.delete('projects', args.id)
	}
})
