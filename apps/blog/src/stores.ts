import { datass } from 'datass'

// Global UI state for the blog, kept in datass. Convex owns server data
// (posts, images); these stores own ephemeral client state only.

export type SortKey = 'newest' | 'oldest' | 'title'

// Home page list controls (search / sort / filter).
export const $search = datass.string('')
export const $sort = datass.string('newest') // SortKey
export const $activeTags = datass.array<string>([])

// Auth/session placeholder until Convex Auth lands in iteration 3.
export const $isAuthed = datass.boolean(false)
