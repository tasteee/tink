import { v } from 'convex/values'
import { mutation } from './_generated/server'
import { requireAuthor } from './authz'

// Image upload flow (used by the editor's paste-to-upload), author-only:
//   1. client calls generateUploadUrl()
//   2. client POSTs the image blob to that URL -> { storageId }
//   3. client calls getImageUrl({ storageId }) -> public URL for markdown

export const generateUploadUrl = mutation({
	args: {},
	handler: async (ctx) => {
		await requireAuthor(ctx)
		return await ctx.storage.generateUploadUrl()
	}
})

export const getImageUrl = mutation({
	args: { storageId: v.id('_storage') },
	handler: async (ctx, args) => {
		await requireAuthor(ctx)
		return await ctx.storage.getUrl(args.storageId)
	}
})
