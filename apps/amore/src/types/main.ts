declare namespace Musical {
	type KeyT = 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B'

	type ScaleT =
		| 'major'
		| 'naturalMinor'
		| 'harmonicMinor'
		| 'melodicMinor'
		| 'dorian'
		| 'phrygian'
		| 'lydian'
		| 'mixolydian'
		| 'locrian'

	namespace Chord {
		type QualityT =
			| 'major'
			| 'minor'
			| 'diminished'
			| 'augmented'
			| 'dominant7'
			| 'major7'
			| 'minor7'
			| 'minorMajor7'
			| 'diminished7'
			| 'halfDiminished7'
			| 'sus2'
			| 'sus4'
			| 'add9'
			| 'sixth'
			| 'minorSixth'

		type VoicingT = 'closed' | 'open' | 'drop2' | 'spread'
	}
}

type ChordDefinitionT = {
	quality: Musical.Chord.QualityT
	rootNote: Musical.KeyT
	symbol: string
	name: string
}

type ChordModifiersT = {
	octaveOffset: number
	inversion: number
	voicing: Musical.Chord.VoicingT
	bassNote: Musical.KeyT | null
	velocityMin: number
	velocityMax: number
}

// An instance of a chord is the genetic makeup
// of the chord (definition) combined with the
// variables that can make it unique (modifiers).
type ChordInstanceT = ChordDefinitionT & ChordModifiersT

type ChordCardT = ChordInstanceT & {
	id: string
	isModified: boolean
}

type ProgressionChordItemT = ChordInstanceT & {
	id: string
	type: 'chord'
	durationTicks: number
}

type ProgressionRestItemT = {
	id: string
	type: 'rest'
	symbol: 'REST'
	name: 'Rest'
	rootNote: 'REST'
	durationTicks: number
}

type ProgressionItemT = ProgressionChordItemT | ProgressionRestItemT

declare namespace Progression {
	// Canonical progression order is array order.
	// Canonical progression duration is derived from item durations.
	type ItemsT = ProgressionItemT[]
}

type ProgressionLayoutItem = ProgressionItemT & {
	// Derived UI/layout fields.
	index: number
	startTick: number
	endTick: number
}

type SignalT = {
	id: string
	startTicks: number
	durationTicks: number
	isEnabled: boolean

	// Null means use active chord/global/default velocity behavior.
	// 2 number range means min/max to randomize between.
	// Single number means fixed velocity.
	velocity: number | [number, number] | null

	// Null means always play.
	probability: number | null
}

// A project's pattern is 1 bar in duration by default.
// The user should be able to change the duration very
// easily to make it any number of full beats. Loop mode
// should be able to be turned on, in which case, while
// playback advances, if the end of the pattern is reached
// then it just loops back to the beginning of the pattern,
// applying signals to the chord that is active at that
// given moment in playback on the fly. When loop mode is
// not enabled, then each new chord that is reached during
// the playback will trigger the pattern from its very first
// signal all over again.
type PatternT = {
	isLoopEnabled: boolean
	durationTicks: number
	gridTicks: number
	signals: SignalT[]
}

// Private means only the owner can view / access it.
// Public means that anyone can find the project in the
// app search results, open it, clone it, link to it directly,
// etc. Unlisted means public, technically, you can access it by
// link directly, but it wont show up in search results.
type ProjectVisibilityT = 'private' | 'public' | 'unlisted'

// Should be able to be set by the user, not on the projec itself.
// That way, a user can enable 'progression' playback mode and
// scroll through other user's projects and play them back,
// but each one will just play the chords, not the entire
// performance with the pattern applied to the chords.
type PlaybackModeT = 'progression' | 'performance'

type PlaybackT = {
	// 0 = straight, positive values add swing.
	swing: number
	humanizeAmount: number
	playbackMode: PlaybackModeT
	loop: boolean
}

type OutputSettingsT = {
	outputType: 'instrument' | 'midi'
	instrumentId: string | null
	midiId: string | null
	midiChannel: string | null
	isVolumeMuted: boolean
	volume: number
	minVelocity: number
	maxVelocity: number
}

type ProjectT = {
	id: string
	title: string
	description: string
	visibility: ProjectVisibilityT
	ownerId: string
	bpm: number
	key: Musical.KeyT
	scale: Musical.ScaleT
	rootOctave: number
	progression: Progression.ItemsT
	pattern: PatternT
	origin: string | null
	createdAt: number
	updatedAt: number
}

type EditorModeT =
	| 'draggingProgressionItem'
	| 'resizingProgressionItem'
	| 'draggingChordCard'
	| 'draggingSignal'
	| 'resizingSignal'
	| 'marqueeSelecting'
	| 'panning'
	| 'idle'

type SelectionStateT = {
	chordCardId: string | null
	progressionItemIds: string[]
	signalIds: string[]
}

type DragStateT = {
	mode: EditorModeT
	pointerStartX: number
	pointerStartY: number
	tickStart: number | null
	signalStartId: string | null
	targetId: string | null
}

// Marquee = the click/drag select box thingy.
type MarqueeStateT = {
	isActive: boolean
	anchorX: number
	anchorY: number
	currentX: number
	currentY: number
	// Do we need to track this, really? Can't we just
	// store the starting signal row, the starting ticks
	// from the start of the pattern the click began, and
	// on mouseup we determine 1) what all signal rows
	// could be affected and 2) based on start ticks and
	// end ticks of select box, we can then determine which
	// if any signals fit into that box?
	intersectedSignalIds: string[]
}

type ClipboardStateT = {
	signals: SignalT[]
	copiedAtTick: number
}

// One playback store in the whole
// app any any given time. It needs to
// track chords playing as lists of notes
// i.e [C3, E3, G3] so it can stop those
// playing notes when it needs to trigger
// them again. When mousedown on a progression
// chord, it will broadcast to play the notes
// of that chord. If project playback is going
// at that time, and any of the notes needed
// by the chord are current,ly playing, then they
//. will be stopped prior to firing the midi.
type PlaybackStoreT = {
	isPlaying: boolean
	elapsedTicks: number
	activeMidiNotes: number[]
}

// Note that
type EditorDraftDataT = {
	project: ProjectT

	chordCardsById: Record<string, ChordCardT>
	chordCardIds: string[]

	progressionItemsById: Record<string, ProgressionItemT>
	progressionItemIds: string[]

	patternSignalsById: Record<string, SignalT>
	patternSignalIds: string[]
}

type UndoEntryT = {
	id: string
	label: string
	before: EditorDraftDataT
	after: EditorDraftDataT
	createdAt: number
}

type UndoRedoStateT = {
	undoStack: UndoEntryT[]
	redoStack: UndoEntryT[]
}

type ProjectEditorStateT = {
	// The state of the project when it was last saved. (Used to diff for dirty state.)
	savedSnapshot: EditorDraftDataT
	// The current state of the project. (Powers the app.)
	draft: EditorDraftDataT

	selection: SelectionStateT
	drag: DragStateT
	marquee: MarqueeStateT
	clipboard: ClipboardStateT | null
	playback: PlaybackStoreT
	history: UndoRedoStateT
	output: OutputSettingsT

	isDirty: boolean
	isSaving: boolean
	lastSaveError: string | null
}

type UserT = {
	id: string
	username: string
	emailAddress: string
	avatarStorageId: string | null
	description: string
	socialLinks: SocialLinkT[]
	createdAt: number
	updatedAt: number
}

type SocialLinkT = {
	// i.e "spotify" "instagram" "bandlab" "soundcloud" etc
	// the ui will use social.platform string to look up the icon
	// and use the social.url to create the href.
	platform: string
	url: string
}

type ProjectLikeT = {
	projectId: string
	userId: string
	createdAt: number
}

type UserFollowT = {
	followerUserId: string
	followedUserId: string
	createdAt: number
}

// update: when already saved/existing and owner is editing and saves
// fork: first save after opening a project owned by another user
// create: not already existing/saved, owner saves for the first time
type SaveProjectModeT = 'udpate' | 'fork' | 'create'

// These are the actions that can be undone/redone.
type EditorActionT =
	| {
			type: 'project.set'
			title: string
	  }
	| {
			type: 'project.description.set'
			description: string
	  }
	| {
			type: 'project.visibility.set'
			visibility: ProjectVisibilityT
	  }
	| {
			type: 'project.bpm.set'
			bpm: number
	  }
	| {
			type: 'project.key.set'
			key: Musical.KeyT
	  }
	| {
			type: 'project.scale.set'
			scale: Musical.ScaleT
	  }
	| {
			type: 'project.rootOctave.set'
			octave: number
	  }
	| {
			type: 'chordCard.select'
			id: string | null
	  }
	| {
			type: 'chordCard.modifiers.set'
			id: string
			modifiers: Partial<ChordModifiersT>
	  }
	| {
			type: 'chordCard.reset'
			id: string
	  }
	| {
			type: 'progression.items.reset'
			id: string
	  }
	| {
			// NOTE: id is chord card id
			type: 'progression.insert'
			id: string
			insertIndex: number
			durationTicks: number
	  }
	| {
			// NOTE: Can select multiple chords that are not
			// sublings with ctrl+click. This will make toolbar
			// modifiers apply to each selected chord. Can NOT
			// move non-siblings as a group, though.
			type: 'progression.items.select'
			itemIds: string[]
	  }
	| {
			type: 'progression.items.move'
			toIndex: number
	  }
	| {
			type: 'progression.items.resize'
			itemId: string
			durationTicks: number
	  }
	| {
			type: 'progression.items.duplicate'
	  }
	| {
			type: 'progression.removeItems'
	  }
	| {
			type: 'pattern.insertSignal'
			signalId: string
			startTick: number
			durationTicks: number
	  }
	| {
			type: 'pattern.selectSignals'
			signalIds: string[]
	  }
	| {
			type: 'pattern.selectSignalRow'
			signalId: string
	  }
	| {
			type: 'pattern.moveSignal'
			deltaTicks: number
			deltaSignalRows: number
	  }
	| {
			type: 'pattern.resizeSignal'
			edge: 'start' | 'end'
			deltaTicks: number
	  }
	| {
			type: 'pattern.toggleSignalSelection'
	  }
	| {
			type: 'pattern.removeSignal'
	  }
	| {
			type: 'pattern.duplicateSignal'
	  }
	| {
			type: 'pattern.copySignal'
	  }
	| {
			type: 'pattern.pasteSignal'
			ticks: number
	  }
	| {
			type: 'pattern.setGridTicks'
			ticks: number
	  }
	| {
			type: 'history.undo'
	  }
	| {
			type: 'history.redo'
	  }
