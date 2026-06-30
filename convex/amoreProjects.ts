import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Id } from './_generated/dataModel'
import { requireUserId, requireOwnedProject } from './amoreAuthz'

const LIST_LIMIT = 200
const CLEANUP_LIMIT = 1000
const DEFAULT_PATTERN_LENGTH_BEATS = 4

export const list = query({
	args: {},
	handler: async (ctx) => {
		const userId = await requireUserId(ctx)
		return await ctx.db
			.query('amoreProjects')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.order('desc')
			.take(LIST_LIMIT)
	}
})

export const get = query({
	args: { id: v.id('amoreProjects') },
	handler: async (ctx, args) => {
		return await requireOwnedProject(ctx, args.id)
	}
})

export const create = mutation({
	args: { name: v.string() },
	handler: async (ctx, args): Promise<Id<'amoreProjects'>> => {
		const userId = await requireUserId(ctx)
		const now = Date.now()
		const name = args.name.trim() || 'Untitled project'
		return await ctx.db.insert('amoreProjects', {
			userId,
			name,
			key: 'C',
			scale: 'major',
			bpm: 120,
			patternLengthBeats: DEFAULT_PATTERN_LENGTH_BEATS,
			createdAt: now,
			updatedAt: now
		})
	}
})

export const update = mutation({
	args: {
		id: v.id('amoreProjects'),
		name: v.optional(v.string()),
		key: v.optional(v.string()),
		scale: v.optional(v.string()),
		bpm: v.optional(v.number()),
		patternLengthBeats: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		await requireOwnedProject(ctx, args.id)
		const { id, ...rest } = args
		await ctx.db.patch('amoreProjects', id, { ...rest, updatedAt: Date.now() })
	}
})

export const remove = mutation({
	args: { id: v.id('amoreProjects') },
	handler: async (ctx, args) => {
		await requireOwnedProject(ctx, args.id)

		const chords = await ctx.db
			.query('amoreProgressionChords')
			.withIndex('by_project_order', (q) => q.eq('projectId', args.id))
			.take(CLEANUP_LIMIT)
		for (const chord of chords) await ctx.db.delete('amoreProgressionChords', chord._id)

		const signals = await ctx.db
			.query('amoreSignals')
			.withIndex('by_project', (q) => q.eq('projectId', args.id))
			.take(CLEANUP_LIMIT)
		for (const signal of signals) await ctx.db.delete('amoreSignals', signal._id)

		await ctx.db.delete('amoreProjects', args.id)
	}
})
