import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { authTables } from '@convex-dev/auth/server'

// A single-author markdown blog. Images live in Convex file storage (_storage);
// posts reference them by URL embedded in markdown, plus an optional coverImage.
// authTables provides the `users` + session/account tables Convex Auth manages.
export default defineSchema({
	...authTables,
	posts: defineTable({
		title: v.string(),
		slug: v.string(),
		content: v.string(), // markdown source
		excerpt: v.optional(v.string()),
		coverImage: v.optional(v.string()),
		tags: v.array(v.string()),
		status: v.union(v.literal('draft'), v.literal('published')),
		publishedAt: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_slug', ['slug'])
		.index('by_status', ['status'])
		// Lets us list published posts ordered by publishedAt (newest first).
		.index('by_status_publishedAt', ['status', 'publishedAt'])
})
