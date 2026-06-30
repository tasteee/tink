import type { ChordTypeT, DiatonicChordT, ScaleTypeT } from './types'

// "Draw a rhythm once, let the chords decide the notes." Everything here turns
// (key, scale, chord, signal) into concrete MIDI numbers. The vertical axis of
// the pattern editor is "note position inside the chord" — never raw pitch —
// so all of this math exists to resolve that position at playback time.

export const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const

export const SCALE_TYPES: ScaleTypeT[] = ['major', 'minor', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian']

const SCALE_INTERVALS: Record<ScaleTypeT, number[]> = {
	major: [0, 2, 4, 5, 7, 9, 11],
	minor: [0, 2, 3, 5, 7, 8, 10],
	dorian: [0, 2, 3, 5, 7, 9, 10],
	phrygian: [0, 1, 3, 5, 7, 8, 10],
	lydian: [0, 2, 4, 6, 7, 9, 11],
	mixolydian: [0, 2, 4, 5, 7, 9, 10],
	locrian: [0, 1, 3, 5, 6, 8, 10]
}

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']

const CHORD_INTERVALS: Record<ChordTypeT, number[]> = {
	major: [0, 4, 7],
	minor: [0, 3, 7],
	diminished: [0, 3, 6],
	augmented: [0, 4, 8],
	major7: [0, 4, 7, 11],
	minor7: [0, 3, 7, 10],
	dominant7: [0, 4, 7, 10],
	halfDiminished7: [0, 3, 6, 10],
	diminished7: [0, 3, 6, 9]
}

export const CHORD_LABELS: Record<ChordTypeT, string> = {
	major: '',
	minor: 'm',
	diminished: '°',
	augmented: '+',
	major7: 'maj7',
	minor7: 'm7',
	dominant7: '7',
	halfDiminished7: 'ø7',
	diminished7: '°7'
}

export const noteNameToPitchClass = (noteName: string): number => {
	const index = CHROMATIC_NOTES.indexOf(noteName as (typeof CHROMATIC_NOTES)[number])
	return index === -1 ? 0 : index
}

export const noteToMidi = (noteName: string, octave: number): number => {
	return noteNameToPitchClass(noteName) + (octave + 1) * 12
}

export const midiToNoteName = (midiNote: number): string => {
	const pitchClass = ((midiNote % 12) + 12) % 12
	const octave = Math.floor(midiNote / 12) - 1
	return `${CHROMATIC_NOTES[pitchClass]}${octave}`
}

export const midiToFrequency = (midiNote: number): number => {
	return 440 * Math.pow(2, (midiNote - 69) / 12)
}

// Absolute semitone value of the scale step `stepsAbove` steps above
// `baseDegree`, carrying the octave when the step index wraps past the scale.
const getStackedDegreeValue = (scaleIntervals: number[], baseDegree: number, stepsAbove: number): number => {
	const absoluteStep = baseDegree + stepsAbove
	const stepIndex = absoluteStep % scaleIntervals.length
	const octaveWraps = Math.floor(absoluteStep / scaleIntervals.length)
	return scaleIntervals[stepIndex] + octaveWraps * 12
}

// The triad quality (major/minor/diminished/augmented) built on each scale
// degree, derived from the scale's own intervals rather than hardcoded per
// scale — works identically for every mode.
const getDiatonicTriadType = (scaleIntervals: number[], degree: number): ChordTypeT => {
	const rootValue = getStackedDegreeValue(scaleIntervals, degree, 0)
	const thirdInterval = getStackedDegreeValue(scaleIntervals, degree, 2) - rootValue
	const fifthInterval = getStackedDegreeValue(scaleIntervals, degree, 4) - rootValue

	if (thirdInterval === 4 && fifthInterval === 7) return 'major'
	if (thirdInterval === 3 && fifthInterval === 7) return 'minor'
	if (thirdInterval === 3 && fifthInterval === 6) return 'diminished'
	if (thirdInterval === 4 && fifthInterval === 8) return 'augmented'
	return 'major'
}

const getDiatonicSeventhType = (scaleIntervals: number[], degree: number, triadType: ChordTypeT): ChordTypeT => {
	const rootValue = getStackedDegreeValue(scaleIntervals, degree, 0)
	const seventhInterval = getStackedDegreeValue(scaleIntervals, degree, 6) - rootValue

	if (triadType === 'major' && seventhInterval === 11) return 'major7'
	if (triadType === 'major' && seventhInterval === 10) return 'dominant7'
	if (triadType === 'minor' && seventhInterval === 10) return 'minor7'
	if (triadType === 'diminished' && seventhInterval === 10) return 'halfDiminished7'
	if (triadType === 'diminished' && seventhInterval === 9) return 'diminished7'
	if (triadType === 'augmented') return 'augmented'
	return triadType
}

// All 7 diatonic chords for a key + scale, lowest degree first.
export const getDiatonicChords = (key: string, scale: ScaleTypeT): DiatonicChordT[] => {
	const rootPitchClass = noteNameToPitchClass(key)
	const intervals = SCALE_INTERVALS[scale]

	return intervals.map((interval, degree) => {
		const pitchClass = (rootPitchClass + interval) % 12
		const triadType = getDiatonicTriadType(intervals, degree)
		const seventhChordType = getDiatonicSeventhType(intervals, degree, triadType)
		const isLowerCase = triadType === 'minor' || triadType === 'diminished'
		const numeral = isLowerCase ? ROMAN_NUMERALS[degree].toLowerCase() : ROMAN_NUMERALS[degree]
		const suffix = triadType === 'diminished' ? '°' : ''

		return {
			degree,
			romanNumeral: `${numeral}${suffix}`,
			root: CHROMATIC_NOTES[pitchClass],
			chordType: triadType,
			seventhChordType
		}
	})
}

// Expand a chord into an ordered (lowest-to-highest) list of MIDI notes,
// accounting for inversion. Voicing stays simple/closed — this is the
// reference list every signal in the pattern resolves against.
export const expandChord = (root: string, chordType: string, inversion: number, baseOctave: number): number[] => {
	const intervals = CHORD_INTERVALS[chordType as ChordTypeT] ?? CHORD_INTERVALS.major
	const rootMidi = noteToMidi(root, baseOctave)
	let notes = intervals.map((interval) => rootMidi + interval)

	const wrappedInversion = ((inversion % notes.length) + notes.length) % notes.length
	for (let step = 0; step < wrappedInversion; step++) {
		const lowestNote = notes.shift()
		if (lowestNote !== undefined) notes.push(lowestNote + 12)
	}

	return notes
}

// "Play the Nth note of the current chord" — wraps an octave higher past the
// end of the chord's note list, then applies any explicit +/- octave shift.
export const resolveSignalToMidi = (noteIndex: number, octaveModifier: number, chordNotes: number[]): number => {
	const zeroBasedIndex = Math.max(0, noteIndex - 1)
	const wrappedIndex = zeroBasedIndex % chordNotes.length
	const wrapOctaves = Math.floor(zeroBasedIndex / chordNotes.length)
	return chordNotes[wrappedIndex] + (wrapOctaves + octaveModifier) * 12
}
