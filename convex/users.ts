import { getAuthUserId } from '@convex-dev/auth/server'
import { query } from './_generated/server'

// The signed-in user's own profile (whichever provider they used — GitHub or
// Password share the same `users` table). Null when signed out.
export const me = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx)
		if (userId === null) return null
		return await ctx.db.get('users', userId)
	}
})
