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
		.index('by_status_publishedAt', ['status', 'publishedAt']),

	// amore — a chord-progression-driven MIDI pattern sequencer. A project pins a
	// key/scale/bpm; chords on a single progression "lane" are stored as duration
	// + sort order (start beat is derived, so chords always sit end-to-end with no
	// gaps); pattern signals are short loop-relative events resolved against
	// whichever chord is active at playback time.
	//
	// Fields added for the full feature set ship optional (widen-migrate-narrow
	// step 1) so existing rows validate; mutations/queries supply defaults.
	amoreProjects: defineTable({
		userId: v.id('users'),
		name: v.string(),
		key: v.string(), // chromatic root, e.g. "C", "F#"
		scale: v.string(), // e.g. "major", "minor", "dorian"
		bpm: v.number(),
		patternLengthBeats: v.number(),
		description: v.optional(v.string()),
		isPublic: v.optional(v.boolean()), // default false
		rootOctave: v.optional(v.number()), // default 4; replaces hardcoded CHORD_VOICE_OCTAVE
		minVelocity: v.optional(v.number()), // project bounds for "relative" chord velocity mode
		maxVelocity: v.optional(v.number()),
		forkedFromProjectId: v.optional(v.id('amoreProjects')), // clone lineage
		likeCount: v.optional(v.number()), // denormalized
		chordRootsUsed: v.optional(v.array(v.string())), // denormalized; powers chord-inclusion search
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_user', ['userId'])
		// Browse/sort the public gallery without scanning private rows.
		.index('by_public_updatedAt', ['isPublic', 'updatedAt']),

	amoreProgressionChords: defineTable({
		projectId: v.id('amoreProjects'),
		order: v.number(), // sort position within the lane; start beat = sum of prior durations
		root: v.string(),
		chordType: v.string(), // "major", "minor", "diminished", "major7", ...
		inversion: v.number(),
		durationBeats: v.number(),
		isEnabled: v.optional(v.boolean()), // default true; "0" key toggles
		octaveOffset: v.optional(v.number()), // default 0; additive to project.rootOctave
		voicing: v.optional(
			v.union(v.literal('closed'), v.literal('open'), v.literal('drop2'), v.literal('spread'))
		), // default 'closed'
		velocityMode: v.optional(v.union(v.literal('relative'), v.literal('absolute'))),
		velocityMin: v.optional(v.number()), // randomization bounds for this chord's notes
		velocityMax: v.optional(v.number())
	}).index('by_project_order', ['projectId', 'order']),

	amoreSignals: defineTable({
		projectId: v.id('amoreProjects'),
		noteIndex: v.number(), // 1-based "Nth note of the active chord"
		octaveModifier: v.number(), // explicit +/- octave shift, applied after wrap
		startBeat: v.number(), // position within one pattern loop
		durationBeats: v.number(),
		velocity: v.number(), // 0-127
		isEnabled: v.optional(v.boolean()) // default true; "0" key toggles
	}).index('by_project', ['projectId']),

	// Public profile, kept separate from authTables.users (Convex Auth manages
	// that table's shape). socialLinks is bounded (a handful), so an inline array
	// is safe here.
	amoreProfiles: defineTable({
		userId: v.id('users'),
		username: v.string(),
		avatarStorageId: v.optional(v.id('_storage')),
		description: v.optional(v.string()),
		socialLinks: v.array(v.object({ platform: v.string(), url: v.string() })),
		followerCount: v.number(),
		followingCount: v.number()
	})
		.index('by_user', ['userId'])
		.index('by_username', ['username']),

	// One row per follow edge. by_follower_following enforces toggle uniqueness;
	// by_following backs follower lists/counts.
	amoreFollows: defineTable({
		followerId: v.id('users'),
		followingId: v.id('users'),
		createdAt: v.number()
	})
		.index('by_follower', ['followerId'])
		.index('by_following', ['followingId'])
		.index('by_follower_following', ['followerId', 'followingId']),

	// One row per like. by_user_project toggles/dedupes; by_project backs counts.
	amoreLikes: defineTable({
		userId: v.id('users'),
		projectId: v.id('amoreProjects'),
		createdAt: v.number()
	})
		.index('by_user_project', ['userId', 'projectId'])
		.index('by_project', ['projectId'])
})
