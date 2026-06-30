import { getAuthUserId } from '@convex-dev/auth/server'
import type { QueryCtx, MutationCtx } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'

// amore projects are private to their owner. Identity is always derived
// server-side from the session — callers never pass a userId.

export const requireUserId = async (ctx: QueryCtx | MutationCtx): Promise<Id<'users'>> => {
	const userId = await getAuthUserId(ctx)
	if (userId === null) throw new Error('Not authenticated')
	return userId
}

export const requireOwnedProject = async (
	ctx: QueryCtx | MutationCtx,
	projectId: Id<'amoreProjects'>
): Promise<Doc<'amoreProjects'>> => {
	const userId = await requireUserId(ctx)
	const project = await ctx.db.get('amoreProjects', projectId)
	if (project === null) throw new Error('Project not found')
	if (project.userId !== userId) throw new Error('Unauthorized')
	return project
}
