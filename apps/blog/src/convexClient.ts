import { ConvexReactClient } from 'convex/react'

const rawUrl = import.meta.env.VITE_CONVEX_URL as string | undefined
if (!rawUrl) throw new Error('Missing VITE_CONVEX_URL in .env.local')

// A trailing slash makes the client build `…convex.cloud//api/...`, which fails
// the WebSocket handshake (code 1006). Normalize it away.
const convexUrl = rawUrl.replace(/\/+$/, '')

export const convex = new ConvexReactClient(convexUrl)
