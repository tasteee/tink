export type ScaleTypeT =
	| 'major'
	| 'minor'
	| 'dorian'
	| 'phrygian'
	| 'lydian'
	| 'mixolydian'
	| 'locrian'
	| 'harmonicMajor'
	| 'harmonicMinor'
	| 'melodicMinor'

export type ChordTypeT =
	| 'power5'
	| 'major'
	| 'minor'
	| 'diminished'
	| 'augmented'
	| 'sus2'
	| 'sus4'
	| 'sus24'
	| 'major6'
	| 'minor6'
	| 'major7'
	| 'minor7'
	| 'dominant7'
	| 'minorMajor7'
	| 'halfDiminished7'
	| 'diminished7'
	| 'augmented7'
	| 'augmentedMajor7'
	| 'dominant7sus2'
	| 'dominant7sus4'
	| 'add2'
	| 'add4'
	| 'add9'
	| 'major9'
	| 'minor9'
	| 'dominant9'
	| 'major11'
	| 'minor11'
	| 'dominant11'
	| 'major13'
	| 'minor13'
	| 'dominant13'

export type ChordQualityCategoryT =
	| 'power'
	| 'triad'
	| 'suspended'
	| 'sixth'
	| 'seventh'
	| 'ninth'
	| 'extension'
	| 'add'
	| 'altered'
export type ChordVoicingT = 'closed' | 'open' | 'drop2' | 'spread'
export type PatternLoopModeT = 'loopAcrossProgression' | 'restartOnChord'

export type ChordQualityT = {
	id: string
	label: string
	name: string
	intervals: number[]
	category: ChordQualityCategoryT
}

export type DiatonicChordT = {
	degree: number // 0-based scale degree
	romanNumeral: string
	root: string
	chordType: ChordTypeT
	seventhChordType: ChordTypeT
}

export type ChordRootT =
	| {
			kind: 'scaleDegree'
			degree: number
	  }
	| {
			kind: 'pitchClass'
			pitchClass: number
	  }

export type ProgressionChordItemT = {
	_id: string
	order: number
	type: 'chord'
	root: ChordRootT
	qualityId: string
	inversion: number
	durationTicks: number
	isEnabled?: boolean
	octaveOffset?: number
	voicing?: ChordVoicingT
	velocityMode?: 'relative' | 'absolute'
	velocityMin?: number
	velocityMax?: number
}

export type ProgressionRestItemT = {
	_id: string
	order: number
	type: 'rest'
	durationTicks: number
	isEnabled?: boolean
}

export type ProgressionItemT = ProgressionChordItemT | ProgressionRestItemT

export type PatternSignalT = {
	_id: string
	chordToneIndex: number
	octaveModifier: number
	startTicks: number
	durationTicks: number
	velocity: number
	probability?: number
	isEnabled?: boolean
}

export type PlaybackNoteT = {
	startBeat: number
	durationBeats: number
	midiNote: number
	velocity: number
}
