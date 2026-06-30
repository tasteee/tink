import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Id } from './_generated/dataModel'
import { requireOwnedProject } from './amoreAuthz'

const TAKE_LIMIT = 1000
const MIN_DURATION_BEATS = 0.125

export const list = query({
	args: { projectId: v.id('amoreProjects') },
	handler: async (ctx, args) => {
		await requireOwnedProject(ctx, args.projectId)
		return await ctx.db
			.query('amoreSignals')
			.withIndex('by_project', (q) => q.eq('projectId', args.projectId))
			.take(TAKE_LIMIT)
	}
})

export const add = mutation({
	args: {
		projectId: v.id('amoreProjects'),
		noteIndex: v.number(),
		octaveModifier: v.number(),
		startBeat: v.number(),
		durationBeats: v.number(),
		velocity: v.number()
	},
	handler: async (ctx, args): Promise<Id<'amoreSignals'>> => {
		await requireOwnedProject(ctx, args.projectId)
		return await ctx.db.insert('amoreSignals', {
			projectId: args.projectId,
			noteIndex: Math.max(1, Math.round(args.noteIndex)),
			octaveModifier: Math.round(args.octaveModifier),
			startBeat: Math.max(0, args.startBeat),
			durationBeats: Math.max(MIN_DURATION_BEATS, args.durationBeats),
			velocity: Math.min(127, Math.max(1, args.velocity))
		})
	}
})

export const update = mutation({
	args: {
		id: v.id('amoreSignals'),
		noteIndex: v.optional(v.number()),
		octaveModifier: v.optional(v.number()),
		startBeat: v.optional(v.number()),
		durationBeats: v.optional(v.number()),
		velocity: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		const signal = await ctx.db.get('amoreSignals', args.id)
		if (signal === null) throw new Error('Signal not found')
		await requireOwnedProject(ctx, signal.projectId)
		const { id, ...rest } = args
		await ctx.db.patch('amoreSignals', id, rest)
	}
})

export const remove = mutation({
	args: { id: v.id('amoreSignals') },
	handler: async (ctx, args) => {
		const signal = await ctx.db.get('amoreSignals', args.id)
		if (signal === null) return
		await requireOwnedProject(ctx, signal.projectId)
		await ctx.db.delete('amoreSignals', args.id)
	}
})
