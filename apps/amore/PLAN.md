# amore — feature implementation plan

A chord-progression-driven MIDI pattern sequencer (`apps/amore`, SolidJS SPA,
shared Convex backend). This plan covers the full feature spec: project editing,
progression panel, pattern/signal editor, global output bar, profiles, and the
social/discovery layer.

## Decisions (locked)

1. **Editing = local draft + explicit save.** All edits (project settings,
   progression chords, pattern signals) mutate local Solid state only. Save /
   `Ctrl+S` diffs against the last-saved snapshot and batches Convex mutations.
   This replaces today's "mutate Convex on every drag/click" pattern and is the
   substrate for undo/redo and the dirty-indicator.
2. **Output/device settings = local-only (`localStorage`), per browser.** Output
   type, instrument, MIDI device id, volume, mute, and min/max velocity are
   never synced to Convex — a Web MIDI device id is meaningless on another
   machine.
3. **Public projects = live local preview, Save = clone.** Opening a public
   project loads it into the editor; edits are an in-browser sandbox that never
   touch the owner's data. Save always inserts a **new** `amoreProjects` row
   owned by the current user (`forkedFromProjectId` set).
4. **Voicing = named enum** `'closed' | 'open' | 'drop2' | 'spread'`, each
   remapping which chord tones get octave-shifted in `expandChord()`.
5. **Undo/redo = single combined client-side stack** scoped to the current
   local-draft session (resets on reload/save). Falls out of decision #1.

## Data model

### Extend `amoreProjects`
- `description?: string`
- `isPublic?: boolean` (default false)
- `rootOctave?: number` (default 4 — replaces hardcoded `CHORD_VOICE_OCTAVE`)
- `minVelocity?: number` / `maxVelocity?: number` (project-level bounds for
  "relative" chord velocity mode)
- `forkedFromProjectId?: Id<'amoreProjects'>` (clone lineage)
- `likeCount?: number` (denormalized)
- `chordRootsUsed?: string[]` (denormalized, recomputed on progression save —
  powers the "filter by chord inclusion" search without a join)
- New index `by_public_updatedAt` on `['isPublic', 'updatedAt']`

### Extend `amoreProgressionChords`
- `isEnabled?: boolean` (default true; `0` toggles)
- `octaveOffset?: number` (default 0; additive to `project.rootOctave`)
- `voicing?: 'closed' | 'open' | 'drop2' | 'spread'` (default closed)
- `velocityMode?: 'relative' | 'absolute'`
- `velocityMin?: number` / `velocityMax?: number`

### Extend `amoreSignals`
- `isEnabled?: boolean` (default true)

### New tables
- **`amoreProfiles`** — separate from `authTables.users` (which Convex Auth
  manages). `userId`, `username`, `avatarStorageId?`, `description?`,
  `socialLinks: {platform,url}[]`, `followerCount`, `followingCount`.
  Indexes `by_user`, `by_username`.
- **`amoreFollows`** — `followerId`, `followingId`, `createdAt`. Indexes
  `by_follower`, `by_following`, `by_follower_following` (toggle uniqueness).
- **`amoreLikes`** — `userId`, `projectId`, `createdAt`. Indexes
  `by_user_project` (toggle), `by_project` (counts).

Email/password changes route through `@convex-dev/auth`'s Password provider, not
a custom table.

**Feed** = `amoreFollows.by_follower(me)` → fan out to each followed user's
public projects by `updatedAt`. Fine at indie scale; revisit a denormalized feed
table if follows reach the thousands.

> Migration note: new fields ship **optional** (widen-migrate-narrow step 1) so
> the schema accepts existing rows. Backfill defaults, then optionally narrow to
> required in a later pass.

## Zest design-system gap analysis

**Reuse as-is:** `z-select`, `z-switch`/`z-toggle`, `z-toggle-group`, `z-slider`,
`z-input`/`z-textarea` (keep uncontrolled — see amore-app memory gotcha),
`z-popover`/`z-hover-card`, `z-dialog`/`z-drawer`/`z-sheet`, `z-avatar`/`z-card`/
`z-tabs`, `z-combobox` (instrument/MIDI picker), `z-context-menu`,
`z-button-group` (quick actions).

**No zest preset — build custom in `apps/amore/src/project/`:**
1. Progression timeline (beat ruler + draggable/resizable chord blocks) — exists.
2. Pattern/signal grid (piano-roll) — exists.
3. Marquee multi-select (drag-rectangle over signal grid) — net-new.
4. Floating contextual quick-action toolbar anchored to a selected block's rect —
   check if `z-popover` can anchor to a computed rect; else custom positioning,
   zest only supplies chrome tokens.
5. Dual-handle relative/absolute velocity range — check `z-slider` two-thumb
   support; else custom.
6. Chord/signal color palette — keep as a fixed theme-independent music palette
   (not themed tokens) so blocks stay visually distinct in any theme.

Keep these app-local; extract into `packages/zest` only if a second consumer
needs a timeline/grid primitive.

## Phased roadmap

1. **Schema migration** — add fields/tables above; backfill defaults. ← current
2. **Local-draft editing layer** — replace instant-mutation handlers with local
   state + dirty tracking + Save/`Ctrl+S` flush. Unblocks everything below.
3. **Progression panel pass** — selection, quick-action toolbar, octave offset /
   inversion / voicing / velocity, enable/disable, 1/16-beat resize, reorder.
4. **Pattern/signal panel pass** — marquee multi-select, group drag/resize/
   delete, duplicate, copy/paste, undo/redo.
5. **Global bottom bar** — output type / instrument / MIDI device / mute /
   volume / min-max velocity, all `localStorage`.
6. **Profile + auth pages** — signin/signup/forgot-password/logout, profile edit
   (username/email/password/avatar/description/social links).
7. **Social/discovery** — public browse + search/filters, like, follow, feed,
   clone-on-save flow.
