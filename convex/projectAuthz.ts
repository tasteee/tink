import { getAuthUserId } from '@convex-dev/auth/server'
import type { QueryCtx, MutationCtx } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'

export const requireUserId = async (ctx: QueryCtx | MutationCtx): Promise<Id<'users'>> => {
	const userId = await getAuthUserId(ctx)
	if (userId === null) throw new Error('Not authenticated')
	return userId
}

export const requireOwnedProject = async (
	ctx: QueryCtx | MutationCtx,
	projectId: Id<'projects'>
): Promise<Doc<'projects'>> => {
	const userId = await requireUserId(ctx)
	const project = await ctx.db.get('projects', projectId)
	if (project === null) throw new Error('Project not found')
	if (project.ownerId !== userId) throw new Error('Unauthorized')
	return project
}

export const requireOwnedProgression = async (
	ctx: QueryCtx | MutationCtx,
	progressionId: Id<'progressions'>
): Promise<Doc<'progressions'>> => {
	const userId = await requireUserId(ctx)
	const progression = await ctx.db.get('progressions', progressionId)
	if (progression === null) throw new Error('Progression not found')
	if (progression.ownerId !== userId) throw new Error('Unauthorized')
	return progression
}

export const requireOwnedPattern = async (
	ctx: QueryCtx | MutationCtx,
	patternId: Id<'patterns'>
): Promise<Doc<'patterns'>> => {
	const userId = await requireUserId(ctx)
	const pattern = await ctx.db.get('patterns', patternId)
	if (pattern === null) throw new Error('Pattern not found')
	if (pattern.ownerId !== userId) throw new Error('Unauthorized')
	return pattern
}
