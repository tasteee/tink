import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { MutationCtx } from './_generated/server'
import type { Id } from './_generated/dataModel'
import { isAuthor, requireAuthor } from './authz'

const LIST_LIMIT = 500

const slugify = (input: string): string => {
	const base = input
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '')
	return base || 'untitled'
}

// Ensure the slug is unique by appending -2, -3, ... when needed.
const uniqueSlug = async (ctx: MutationCtx, desired: string): Promise<string> => {
	let candidate = desired
	let suffix = 2
	while (true) {
		const existing = await ctx.db
			.query('posts')
			.withIndex('by_slug', (q) => q.eq('slug', candidate))
			.unique()
		if (existing === null) return candidate
		candidate = `${desired}-${suffix}`
		suffix += 1
	}
}

// ── Queries ──────────────────────────────────────────────────────────────

// Public: published posts, newest first. Search/sort/filter happen client-side.
export const listPublished = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db
			.query('posts')
			.withIndex('by_status_publishedAt', (q) => q.eq('status', 'published'))
			.order('desc')
			.take(LIST_LIMIT)
	}
})

// Admin: every post (drafts + published), most recently created first.
export const listAll = query({
	args: {},
	handler: async (ctx) => {
		await requireAuthor(ctx)
		return await ctx.db.query('posts').order('desc').take(LIST_LIMIT)
	}
})

// Lets the client decide whether to render admin UI. Writes are gated server-side
// regardless, so this is purely cosmetic.
export const isCurrentUserAuthor = query({
	args: {},
	handler: async (ctx): Promise<boolean> => {
		return await isAuthor(ctx)
	}
})

export const getBySlug = query({
	args: { slug: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query('posts')
			.withIndex('by_slug', (q) => q.eq('slug', args.slug))
			.unique()
	}
})

export const getById = query({
	args: { id: v.id('posts') },
	handler: async (ctx, args) => {
		return await ctx.db.get('posts', args.id)
	}
})

// ── Mutations ────────────────────────────────────────────────────────────

export const createDraft = mutation({
	args: { title: v.optional(v.string()) },
	handler: async (ctx, args): Promise<Id<'posts'>> => {
		await requireAuthor(ctx)
		const title = args.title?.trim() || 'Untitled'
		const slug = await uniqueSlug(ctx, slugify(title))
		const now = Date.now()
		return await ctx.db.insert('posts', {
			title,
			slug,
			content: '',
			tags: [],
			status: 'draft',
			createdAt: now,
			updatedAt: now
		})
	}
})

export const update = mutation({
	args: {
		id: v.id('posts'),
		title: v.optional(v.string()),
		slug: v.optional(v.string()),
		content: v.optional(v.string()),
		excerpt: v.optional(v.string()),
		coverImage: v.optional(v.string()),
		tags: v.optional(v.array(v.string()))
	},
	handler: async (ctx, args) => {
		await requireAuthor(ctx)
		const { id, slug, ...rest } = args
		const patch: Record<string, unknown> = { ...rest, updatedAt: Date.now() }
		// Only re-slug when explicitly provided, keeping published URLs stable.
		if (slug !== undefined) patch.slug = await uniqueSlug(ctx, slugify(slug))
		await ctx.db.patch('posts', id, patch)
	}
})

export const publish = mutation({
	args: { id: v.id('posts') },
	handler: async (ctx, args) => {
		await requireAuthor(ctx)
		const post = await ctx.db.get('posts', args.id)
		if (post === null) throw new Error('Post not found')
		const now = Date.now()
		await ctx.db.patch('posts', args.id, {
			status: 'published',
			publishedAt: post.publishedAt ?? now,
			updatedAt: now
		})
	}
})

export const unpublish = mutation({
	args: { id: v.id('posts') },
	handler: async (ctx, args) => {
		await requireAuthor(ctx)
		await ctx.db.patch('posts', args.id, { status: 'draft', updatedAt: Date.now() })
	}
})

export const remove = mutation({
	args: { id: v.id('posts') },
	handler: async (ctx, args) => {
		await requireAuthor(ctx)
		await ctx.db.delete('posts', args.id)
	}
})
