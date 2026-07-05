import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { authTables } from '@convex-dev/auth/server'

const chordRoot = v.union(
	v.object({ kind: v.literal('scaleDegree'), degree: v.number() }),
	v.object({ kind: v.literal('pitchClass'), pitchClass: v.number() })
)

const visibility = v.union(v.literal('private'), v.literal('unlisted'), v.literal('public'))
const voicing = v.union(v.literal('closed'), v.literal('open'), v.literal('drop2'), v.literal('spread'))
const progressionItem = v.union(
	v.object({
		_id: v.string(),
		order: v.number(),
		type: v.literal('chord'),
		durationTicks: v.number(),
		root: chordRoot,
		qualityId: v.string(),
		inversion: v.number(),
		isEnabled: v.optional(v.boolean()),
		octaveOffset: v.optional(v.number()),
		voicing: v.optional(voicing),
		velocityMode: v.optional(v.union(v.literal('relative'), v.literal('absolute'))),
		velocityMin: v.optional(v.number()),
		velocityMax: v.optional(v.number())
	}),
	v.object({
		_id: v.string(),
		order: v.number(),
		type: v.literal('rest'),
		durationTicks: v.number(),
		isEnabled: v.optional(v.boolean())
	})
)
const patternSignal = v.object({
	_id: v.string(),
	chordToneIndex: v.number(),
	octaveModifier: v.number(),
	startTicks: v.number(),
	durationTicks: v.number(),
	velocity: v.number(),
	probability: v.optional(v.number()),
	isEnabled: v.optional(v.boolean())
})

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

	// Amore projects are workspaces/scenes. The portable musical material lives
	// in progressions and patterns, so a project mostly pins playback context and
	// points at the currently active artifacts.
	projects: defineTable({
		ownerId: v.id('users'),
		name: v.string(),
		key: v.string(), // chromatic root, e.g. "C", "F#"
		scale: v.string(), // e.g. "major", "minor", "dorian"
		bpm: v.number(),
		activeProgressionId: v.optional(v.id('progressions')),
		activePatternId: v.optional(v.id('patterns')),
		description: v.optional(v.string()),
		visibility: v.optional(visibility), // default private
		rootOctave: v.optional(v.number()), // default 4
		minVelocity: v.optional(v.number()),
		maxVelocity: v.optional(v.number()),
		forkedFromProjectId: v.optional(v.id('projects')),
		likeCount: v.optional(v.number()),
		chordRootsUsed: v.optional(v.array(v.string())), // denormalized; powers chord-inclusion search
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_owner', ['ownerId'])
		.index('by_visibility_updatedAt', ['visibility', 'updatedAt']),

	progressions: defineTable({
		ownerId: v.id('users'),
		projectId: v.optional(v.id('projects')),
		name: v.string(),
		items: v.optional(v.array(progressionItem)),
		description: v.optional(v.string()),
		visibility: v.optional(visibility),
		forkedFromProgressionId: v.optional(v.id('progressions')),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_owner', ['ownerId'])
		.index('by_project', ['projectId'])
		.index('by_visibility_updatedAt', ['visibility', 'updatedAt']),

	patterns: defineTable({
		ownerId: v.id('users'),
		projectId: v.optional(v.id('projects')),
		name: v.string(),
		durationTicks: v.number(),
		gridTicks: v.number(),
		loopMode: v.union(v.literal('loopAcrossProgression'), v.literal('restartOnChord')),
		signals: v.optional(v.array(patternSignal)),
		description: v.optional(v.string()),
		visibility: v.optional(visibility),
		forkedFromPatternId: v.optional(v.id('patterns')),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_owner', ['ownerId'])
		.index('by_project', ['projectId'])
		.index('by_visibility_updatedAt', ['visibility', 'updatedAt']),

	profiles: defineTable({
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

	follows: defineTable({
		followerId: v.id('users'),
		followingId: v.id('users'),
		createdAt: v.number()
	})
		.index('by_follower', ['followerId'])
		.index('by_following', ['followingId'])
		.index('by_follower_following', ['followerId', 'followingId']),

	likes: defineTable({
		userId: v.id('users'),
		projectId: v.id('projects'),
		createdAt: v.number()
	})
		.index('by_user_project', ['userId', 'projectId'])
		.index('by_project', ['projectId'])
})
