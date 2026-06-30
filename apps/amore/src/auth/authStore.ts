import { createSignal } from 'solid-js'
import { ConvexHttpClient } from 'convex/browser'
import { convexClient, convexUrl } from '@amore/convex/client'

// @convex-dev/auth ships React-only client bindings. amore is SolidJS, so this
// replicates the essential bits of `@convex-dev/auth/react`'s client.ts by
// hand: JWT + refresh token in localStorage, handed to the Convex client via
// `setAuth`, refreshed on demand by calling the same `auth:signIn` action the
// server-side Password/GitHub providers already expose.

type AuthTokensT = { token: string; refreshToken: string }
type SignInResultT = { tokens?: AuthTokensT | null; redirect?: string }

const JWT_STORAGE_KEY = 'amoreAuthJWT'
const REFRESH_STORAGE_KEY = 'amoreAuthRefreshToken'

const readStoredToken = (): string | null => localStorage.getItem(JWT_STORAGE_KEY)
const readStoredRefreshToken = (): string | null => localStorage.getItem(REFRESH_STORAGE_KEY)

const storeTokens = (tokens: AuthTokensT | null): void => {
	if (tokens === null) {
		localStorage.removeItem(JWT_STORAGE_KEY)
		localStorage.removeItem(REFRESH_STORAGE_KEY)
		return
	}
	localStorage.setItem(JWT_STORAGE_KEY, tokens.token)
	localStorage.setItem(REFRESH_STORAGE_KEY, tokens.refreshToken)
}

const [isAuthenticated, setIsAuthenticated] = createSignal(false)
const [isAuthLoading, setIsAuthLoading] = createSignal(true)
const [authError, setAuthError] = createSignal<string | null>(null)

export const getIsAuthenticated = isAuthenticated
export const getIsAuthLoading = isAuthLoading
export const getAuthError = authError

const handleAuthChange = (authenticated: boolean): void => {
	setIsAuthenticated(authenticated)
	setIsAuthLoading(false)
}

// Called by the Convex client whenever a request needs a token. On a normal
// request it returns the cached JWT; when the server rejects it
// (`forceRefreshToken`), it exchanges the refresh token for a new pair via a
// throwaway HTTP client so the main socket's auth state isn't touched mid-flight.
const fetchToken = async (args: { forceRefreshToken: boolean }): Promise<string | null> => {
	if (!args.forceRefreshToken) return readStoredToken()

	const refreshToken = readStoredRefreshToken()
	if (refreshToken === null) return null

	const httpClient = new ConvexHttpClient(convexUrl)
	// @convex-dev/auth registers auth:signIn as an HTTP action accessible by
	// name string — the TypeScript overload expects a FunctionReference, but at
	// runtime the client also accepts a bare name string (verified in source).
	const result = (await (httpClient as any).action('auth:signIn', { refreshToken })) as SignInResultT
	if (result.tokens === undefined || result.tokens === null) {
		storeTokens(null)
		return null
	}
	storeTokens(result.tokens)
	return result.tokens.token
}

convexClient.setAuth(fetchToken, handleAuthChange)

export type PasswordFlowT = 'signIn' | 'signUp'

export const signInWithPassword = async (email: string, password: string, flow: PasswordFlowT): Promise<boolean> => {
	setAuthError(null)
	try {
		const result = (await (convexClient as any).action('auth:signIn', {
			provider: 'password',
			params: { email, password, flow }
		})) as SignInResultT
		if (result.tokens === undefined || result.tokens === null) {
			setAuthError('Could not sign in')
			return false
		}
		storeTokens(result.tokens)
		convexClient.setAuth(fetchToken, handleAuthChange)
		return true
	} catch (error) {
		setAuthError(error instanceof Error ? error.message : 'Could not sign in')
		return false
	}
}

export const signOut = async (): Promise<void> => {
	try {
		await (convexClient as any).action('auth:signOut', {})
	} catch {
		// Already signed out server-side — fine, just clear local state below.
	}
	storeTokens(null)
	convexClient.setAuth(fetchToken, handleAuthChange)
}
