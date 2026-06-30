import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Id } from './_generated/dataModel'
import { requireOwnedProject } from './amoreAuthz'

const TAKE_LIMIT = 500
const MIN_DURATION_BEATS = 0.25

// The progression lane has no gaps: each chord's start beat is the sum of the
// durations of every chord before it (by `order`), so reordering only ever
// touches `order` and resizing only ever touches `durationBeats`.

export const list = query({
	args: { projectId: v.id('amoreProjects') },
	handler: async (ctx, args) => {
		await requireOwnedProject(ctx, args.projectId)
		return await ctx.db
			.query('amoreProgressionChords')
			.withIndex('by_project_order', (q) => q.eq('projectId', args.projectId))
			.order('asc')
			.take(TAKE_LIMIT)
	}
})

export const add = mutation({
	args: {
		projectId: v.id('amoreProjects'),
		root: v.string(),
		chordType: v.string(),
		durationBeats: v.number()
	},
	handler: async (ctx, args): Promise<Id<'amoreProgressionChords'>> => {
		await requireOwnedProject(ctx, args.projectId)
		const last = await ctx.db
			.query('amoreProgressionChords')
			.withIndex('by_project_order', (q) => q.eq('projectId', args.projectId))
			.order('desc')
			.take(1)
		const nextOrder = last.length > 0 ? last[0].order + 1 : 0
		return await ctx.db.insert('amoreProgressionChords', {
			projectId: args.projectId,
			order: nextOrder,
			root: args.root,
			chordType: args.chordType,
			inversion: 0,
			durationBeats: Math.max(MIN_DURATION_BEATS, args.durationBeats)
		})
	}
})

export const updateDuration = mutation({
	args: { id: v.id('amoreProgressionChords'), durationBeats: v.number() },
	handler: async (ctx, args) => {
		const chord = await ctx.db.get('amoreProgressionChords', args.id)
		if (chord === null) throw new Error('Chord not found')
		await requireOwnedProject(ctx, chord.projectId)
		await ctx.db.patch('amoreProgressionChords', args.id, {
			durationBeats: Math.max(MIN_DURATION_BEATS, args.durationBeats)
		})
	}
})

export const updateInversion = mutation({
	args: { id: v.id('amoreProgressionChords'), inversion: v.number() },
	handler: async (ctx, args) => {
		const chord = await ctx.db.get('amoreProgressionChords', args.id)
		if (chord === null) throw new Error('Chord not found')
		await requireOwnedProject(ctx, chord.projectId)
		await ctx.db.patch('amoreProgressionChords', args.id, { inversion: args.inversion })
	}
})

// Replace the full ordering in one shot — the lane is short enough (a handful
// to a few dozen chords) that this stays well inside mutation limits and
// avoids reconciling partial reorders.
export const reorder = mutation({
	args: { projectId: v.id('amoreProjects'), orderedIds: v.array(v.id('amoreProgressionChords')) },
	handler: async (ctx, args) => {
		await requireOwnedProject(ctx, args.projectId)
		for (let index = 0; index < args.orderedIds.length; index++) {
			await ctx.db.patch('amoreProgressionChords', args.orderedIds[index], { order: index })
		}
	}
})

export const remove = mutation({
	args: { id: v.id('amoreProgressionChords') },
	handler: async (ctx, args) => {
		const chord = await ctx.db.get('amoreProgressionChords', args.id)
		if (chord === null) return
		await requireOwnedProject(ctx, chord.projectId)
		await ctx.db.delete('amoreProgressionChords', args.id)
	}
})
