export type ScaleTypeT = 'major' | 'minor' | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian' | 'locrian'

export type ChordTypeT =
	| 'major'
	| 'minor'
	| 'diminished'
	| 'augmented'
	| 'major7'
	| 'minor7'
	| 'dominant7'
	| 'halfDiminished7'
	| 'diminished7'

export type DiatonicChordT = {
	degree: number // 0-based scale degree
	romanNumeral: string
	root: string
	chordType: ChordTypeT
	seventhChordType: ChordTypeT
}

export type ProgressionChordT = {
	_id: string
	order: number
	root: string
	chordType: string
	inversion: number
	durationBeats: number
}

export type SignalT = {
	_id: string
	noteIndex: number
	octaveModifier: number
	startBeat: number
	durationBeats: number
	velocity: number
}

export type PlaybackNoteT = {
	startBeat: number
	durationBeats: number
	midiNote: number
	velocity: number
}
