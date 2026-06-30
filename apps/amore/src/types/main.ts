export const TICKS_PER_BEAT = 96
export const MIN_PROGRESSION_ITEM_DURATION_TICKS = 6
export const DEFAULT_PATTERN_SIGNAL_DURATION_TICKS = 24

declare namespace Musical {
	type KeyT =
		| 'C'
		| 'C#'
		| 'Db'
		| 'D'
		| 'D#'
		| 'Eb'
		| 'E'
		| 'F'
		| 'F#'
		| 'Gb'
		| 'G'
		| 'G#'
		| 'Ab'
		| 'A'
		| 'A#'
		| 'Bb'
		//
		| 'B'
	type ScaleT =
		| 'major'
		| 'naturalMinor'
		| 'harmonicMinor'
		| 'melodicMinor'
		| 'dorian'
		| 'phrygian'
		| 'lydian'
		| 'mixolydian'
		//
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
			//
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

export type ChordModifiersT = {
	octaveOffset: number
	inversion: number
	voicing: Musical.Chord.VoicingT
	bassNote: Musical.KeyT | null
	velocityMin: number
	velocityMax: number
}

export type ChordInstanceT = ChordDefinitionT & ChordModifiersT

export type ChordCard = ChordInstanceT & {
	id: string

	// Local UI convenience value.
	// Derived by comparing current modifiers to default modifiers.
	isModified: boolean
}

export type ProgressionChordItemT = ChordInstanceT & {
	id: string
	type: 'chord'

	// Canonical progression timing.
	// No startTick here. Start/end are derived from array order.
	durationTicks: number
}

export type ProgressionRestItemT = {
	id: string
	type: 'rest'

	symbol: 'REST'
	name: 'Rest'
	rootNote: 'REST'

	durationTicks: number
}

export type ProgressionItemT = ProgressionChordItemT | ProgressionRestItemT

export type ProgressionT = {
	// Canonical progression order is array order.
	// Canonical progression duration is derived from item durations.
	items: ProgressionItemT[]
}

export type ProgressionLayoutItem = ProgressionItemT & {
	// Derived UI/layout fields.
	index: number
	startTick: number
	endTick: number
}

export type SignalRowId = Brand<number, 'SignalRowId'>

export type PatternSignal = {
	id: string

	// Vertical axis. i.e N0, N1, N2, N0+1, N1+1, N2+4, N5+3, N4-3, etc
	// SignalRowIds go from N0-3 to N8+3. Nx+0 -> Nx (no modifier for 0 octave)
	signalId: SignalRowId

	// Pattern signals are sparse/polyphonic, so startTick is canonical here.
	startTick: number
	durationTicks: number

	isEnabled: boolean

	// Null means use active chord/global/default velocity behavior.
	// 2 number range means min/max to randomize between.
	// Single number means fixed velocity.
	velocity: number | [number, number] | null

	// Null means always play.
	probability: number | null
}

export type Pattern = {
	durationTicks: number

	// Existing signals are not modified when gridTicks changes.
	// Only future move/resize/paste operations snap to the active grid.
	gridTicks: number

	signals: PatternSignal[]
}

export type ProjectVisibility = 'private' | 'public' | 'unlisted'

export type ProjectPerformanceMode = 'progression' | 'pattern'

export type ProjectPerformance = {
	playbackMode: ProjectPerformanceMode
	loop: boolean

	// 0 = straight, positive values add swing.
	swing: number
}

export type AmoreProject = {
	id: string
	ownerUserId: string

	title: string
	description: string
	visibility: ProjectVisibility

	bpm: number
	key: MusicalT.Key
	scale: MusicalScaleT
	rootOctave: number

	progression: ProgressionT
	pattern: Pattern
	performance: ProjectPerformance

	forkedFromProjectId: string | null

	createdAt: number
	updatedAt: number
}

export type OutputType = 'webAudio' | 'webMidi'

export type LocalOutputSettings = {
	// Browser-local only. Never persisted to Convex.
	outputType: OutputType

	// WebAudio.
	instrumentId: string | null

	// WebMIDI.
	midiDeviceId: string | null

	mute: boolean
	volume: number

	velocityMin: number
	velocityMax: number
}

export type EditorMode =
	| 'idle'
	| 'draggingProgressionItem'
	| 'resizingProgressionItem'
	| 'draggingChordCard'
	| 'draggingSignal'
	| 'resizingSignal'
	| 'marqueeSelecting'
	| 'panning'

export type SelectionState = {
	selectedChordCardId: string | null
	selectedProgressionItemIds: string[]
	selectedSignalIds: string[]
}

export type DragState = {
	mode: EditorMode

	pointerStartX: number
	pointerStartY: number

	tickStart: number | null
	signalStartId: SignalRowId | null

	targetId: string | null
}

export type MarqueeState = {
	isActive: boolean

	anchorX: number
	anchorY: number

	currentX: number
	currentY: number

	intersectedSignalIds: string[]
}

export type ClipboardState = {
	signals: PatternSignal[]
	copiedAtTick: number
}

export type PlaybackSurface = 'projectEditor' | 'progressionPanelPreview' | 'chordGridPreview' | 'searchResultPreview'

export type PlaybackState = {
	surface: PlaybackSurface | null
	isPlaying: boolean

	previewingChordCardId: string | null
	previewingProgressionItemId: string | null

	elapsedTicks: number
	activeMidiNotes: number[]
}

export type EditorDraftData = {
	project: AmoreProject

	chordCardsById: Record<string, ChordCard>
	chordCardIds: string[]

	progressionItemsById: Record<string, ProgressionItemT>
	progressionItemIds: string[]

	patternSignalsById: Record<string, PatternSignal>
	patternSignalIds: string[]
}

export type UndoEntry = {
	id: string
	label: string

	before: EditorDraftData
	after: EditorDraftData

	createdAt: number
}

export type UndoRedoState = {
	undoStack: UndoEntry[]
	redoStack: UndoEntry[]
}

export type ProjectEditorState = {
	savedSnapshot: EditorDraftData
	draft: EditorDraftData

	selection: SelectionState
	drag: DragState
	marquee: MarqueeState
	clipboard: ClipboardState | null
	playback: PlaybackState
	history: UndoRedoState

	localOutputSettings: LocalOutputSettings

	isDirty: boolean
	isSaving: boolean
	lastSaveError: string | null
}

export type AmoreUser = {
	id: string

	username: string
	displayName: string
	email: string

	avatarStorageId: string | null
	description: string

	socialLinks: SocialLink[]

	createdAt: number
	updatedAt: number
}

export type SocialLink = {
	label: string
	url: string
}

export type ProjectLike = {
	projectId: string
	userId: string
	createdAt: number
}

export type UserFollow = {
	followerUserId: string
	followedUserId: string
	createdAt: number
}

export type SaveProjectMode = 'updateOwnedProject' | 'forkPublicProject' | 'createNewProject'

export type EditorAction =
	| {
			type: 'project.rename'
			title: string
	  }
	| {
			type: 'project.setDescription'
			description: string
	  }
	| {
			type: 'project.setVisibility'
			visibility: ProjectVisibility
	  }
	| {
			type: 'project.setBpm'
			bpm: number
	  }
	| {
			type: 'project.setKey'
			key: MusicalT.Key
	  }
	| {
			type: 'project.setScale'
			scale: MusicalScaleT
	  }
	| {
			type: 'project.setRootOctave'
			rootOctave: number
	  }
	| {
			type: 'chordCard.select'
			chordCardId: string | null
	  }
	| {
			type: 'chordCard.setModifiers'
			chordCardId: string
			modifiers: Partial<ChordModifiersT>
	  }
	| {
			type: 'chordCard.reset'
			chordCardId: string
	  }
	| {
			type: 'progression.insertChordFromCard'
			chordCardId: string
			insertIndex: number
			durationTicks: number
	  }
	| {
			type: 'progression.insertRest'
			insertIndex: number
			durationTicks: number
	  }
	| {
			type: 'progression.select'
			itemIds: string[]
	  }
	| {
			type: 'progression.moveSelected'
			toIndex: number
	  }
	| {
			type: 'progression.resize'
			itemId: string
			durationTicks: number
	  }
	| {
			type: 'progression.duplicateSelected'
	  }
	| {
			type: 'progression.deleteSelected'
	  }
	| {
			type: 'pattern.insertSignal'
			signalId: SignalRowId
			startTick: number
			durationTicks: number
	  }
	| {
			type: 'pattern.selectSignals'
			signalIds: string[]
	  }
	| {
			type: 'pattern.selectSignalRow'
			signalId: SignalRowId
	  }
	| {
			type: 'pattern.moveSelectedSignals'
			deltaTicks: number
			deltaSignalRows: number
	  }
	| {
			type: 'pattern.resizeSelectedSignals'
			edge: 'start' | 'end'
			deltaTicks: number
	  }
	| {
			type: 'pattern.toggleSelectedSignals'
	  }
	| {
			type: 'pattern.deleteSelectedSignals'
	  }
	| {
			type: 'pattern.duplicateSelectedSignals'
	  }
	| {
			type: 'pattern.copySelectedSignals'
	  }
	| {
			type: 'pattern.pasteSignals'
			atTick: number
	  }
	| {
			type: 'pattern.setGridTicks'
			gridTicks: number
	  }
	| {
			type: 'history.undo'
	  }
	| {
			type: 'history.redo'
	  }
