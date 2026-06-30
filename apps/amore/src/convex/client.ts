import { ConvexClient } from 'convex/browser'

const rawUrl = import.meta.env.VITE_CONVEX_URL as string | undefined
if (rawUrl === undefined) throw new Error('Missing VITE_CONVEX_URL in .env.local')

// A trailing slash makes the client build `…convex.cloud//api/...`, which fails
// the WebSocket handshake (code 1006). Normalize it away.
export const convexUrl = rawUrl.replace(/\/+$/, '')

export const convexClient = new ConvexClient(convexUrl)
