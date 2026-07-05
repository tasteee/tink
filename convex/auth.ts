import GitHub from '@auth/core/providers/github'
import { Password } from '@convex-dev/auth/providers/Password'
import { convexAuth } from '@convex-dev/auth/server'

// GitHub OAuth (blog) reads AUTH_GITHUB_ID / AUTH_GITHUB_SECRET from the
// deployment env (set via `npx convex env set`); write access there is
// separately restricted — see authz.ts (BLOG_AUTHOR_EMAIL).
//
// Password (amore) is plain email+password with no email-verification step,
// so sign-up immediately yields a session. Both providers share the same
// `users` table — they're just two front doors onto one Convex Auth identity.
const normalizeEmail = (email: unknown): string => {
	return String(email ?? '').trim().toLowerCase()
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [
		GitHub,
		Password({
			profile: (params) => ({ email: normalizeEmail(params.email) })
		})
	]
})
