import { getAuthUserId } from '@convex-dev/auth/server'
import type { QueryCtx } from './_generated/server'
import type { Doc } from './_generated/dataModel'

// Single-author authorization. Anyone can sign in via GitHub, but only the user
// whose GitHub email matches BLOG_AUTHOR_EMAIL may read drafts or write posts.
// Identity is always derived server-side — never trust a client-supplied id.

// DEV ONLY: when BLOG_DEV_BYPASS_AUTH === 'true' on the deployment, treat every
// caller as the author so the editor works before the GitHub OAuth app exists.
// This env var must never be set on production. Unset it once auth is live.
const devBypass = (): boolean => process.env.BLOG_DEV_BYPASS_AUTH === 'true'

export const getCurrentUser = async (ctx: QueryCtx): Promise<Doc<'users'> | null> => {
	const userId = await getAuthUserId(ctx)
	if (!userId) return null
	return await ctx.db.get('users', userId)
}

export const isAuthor = async (ctx: QueryCtx): Promise<boolean> => {
	if (devBypass()) return true
	const user = await getCurrentUser(ctx)
	const allowed = process.env.BLOG_AUTHOR_EMAIL
	return Boolean(user && allowed && user.email === allowed)
}

// Throw unless the caller is the authenticated blog author. Use in every write
// (and in admin-only reads like draft listings).
export const requireAuthor = async (ctx: QueryCtx): Promise<void> => {
	if (devBypass()) return
	const user = await getCurrentUser(ctx)
	if (!user) throw new Error('Not authenticated')
	const allowed = process.env.BLOG_AUTHOR_EMAIL
	if (!allowed || user.email !== allowed) throw new Error('Unauthorized')
}
