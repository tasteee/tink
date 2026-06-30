import { useConvexAuth, useQuery } from 'convex/react'
import { useAuthActions } from '@convex-dev/auth/react'
import { api } from '@convex/_generated/api'

// Single hook for the blog's auth state + actions. `isAuthor` reflects the
// server's BLOG_AUTHOR_EMAIL check — only the author should see admin UI (writes
// are gated server-side regardless).
export const useAuth = () => {
	const { isLoading, isAuthenticated } = useConvexAuth()
	const isAuthor = useQuery(api.posts.isCurrentUserAuthor) ?? false
	const { signIn, signOut } = useAuthActions()

	return {
		isLoading,
		isAuthenticated,
		isAuthor,
		signInWithGitHub: () => signIn('github'),
		signOut
	}
}
