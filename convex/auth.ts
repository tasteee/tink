import GitHub from '@auth/core/providers/github'
import { convexAuth } from '@convex-dev/auth/server'

// GitHub OAuth. Reads AUTH_GITHUB_ID / AUTH_GITHUB_SECRET from the deployment
// env (set via `npx convex env set`). Any GitHub user can sign in; write access
// is separately restricted to the blog author — see authz.ts (BLOG_AUTHOR_EMAIL).
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [GitHub]
})
