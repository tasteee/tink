import type { ChordQualityT, ChordRootT, ChordTypeT, ChordVoicingT, DiatonicChordT, ScaleTypeT } from './types'

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

export const CHORD_QUALITIES: Record<ChordTypeT, ChordQualityT> = {
	power5: { id: 'power5', label: '5', name: 'Power fifth', intervals: [0, 7], category: 'power' },
	major: { id: 'major', label: '', name: 'Major', intervals: [0, 4, 7], category: 'triad' },
	minor: { id: 'minor', label: 'm', name: 'Minor', intervals: [0, 3, 7], category: 'triad' },
	diminished: { id: 'diminished', label: 'dim', name: 'Diminished', intervals: [0, 3, 6], category: 'triad' },
	augmented: { id: 'augmented', label: 'aug', name: 'Augmented', intervals: [0, 4, 8], category: 'triad' },
	sus2: { id: 'sus2', label: 'sus2', name: 'Suspended second', intervals: [0, 2, 7], category: 'suspended' },
	sus4: { id: 'sus4', label: 'sus4', name: 'Suspended fourth', intervals: [0, 5, 7], category: 'suspended' },
	sus24: { id: 'sus24', label: 'sus2sus4', name: 'Suspended second and fourth', intervals: [0, 2, 5, 7], category: 'suspended' },
	major6: { id: 'major6', label: '6', name: 'Major sixth', intervals: [0, 4, 7, 9], category: 'sixth' },
	minor6: { id: 'minor6', label: 'm6', name: 'Minor sixth', intervals: [0, 3, 7, 9], category: 'sixth' },
	major7: { id: 'major7', label: 'maj7', name: 'Major seventh', intervals: [0, 4, 7, 11], category: 'seventh' },
	minor7: { id: 'minor7', label: 'm7', name: 'Minor seventh', intervals: [0, 3, 7, 10], category: 'seventh' },
	dominant7: { id: 'dominant7', label: '7', name: 'Dominant seventh', intervals: [0, 4, 7, 10], category: 'seventh' },
	minorMajor7: { id: 'minorMajor7', label: 'mMaj7', name: 'Minor major seventh', intervals: [0, 3, 7, 11], category: 'seventh' },
	halfDiminished7: { id: 'halfDiminished7', label: 'm7b5', name: 'Half-diminished seventh', intervals: [0, 3, 6, 10], category: 'seventh' },
	diminished7: { id: 'diminished7', label: 'dim7', name: 'Diminished seventh', intervals: [0, 3, 6, 9], category: 'seventh' },
	augmented7: { id: 'augmented7', label: 'aug7', name: 'Augmented seventh', intervals: [0, 4, 8, 10], category: 'seventh' },
	augmentedMajor7: { id: 'augmentedMajor7', label: 'augMaj7', name: 'Augmented major seventh', intervals: [0, 4, 8, 11], category: 'seventh' },
	dominant7sus2: { id: 'dominant7sus2', label: '7sus2', name: 'Dominant seventh suspended second', intervals: [0, 2, 7, 10], category: 'seventh' },
	dominant7sus4: { id: 'dominant7sus4', label: '7sus4', name: 'Dominant seventh suspended fourth', intervals: [0, 5, 7, 10], category: 'seventh' },
	add2: { id: 'add2', label: 'add2', name: 'Added second', intervals: [0, 2, 4, 7], category: 'add' },
	add4: { id: 'add4', label: 'add4', name: 'Added fourth', intervals: [0, 4, 5, 7], category: 'add' },
	add9: { id: 'add9', label: 'add9', name: 'Added ninth', intervals: [0, 4, 7, 14], category: 'add' },
	major9: { id: 'major9', label: 'maj9', name: 'Major ninth', intervals: [0, 4, 7, 11, 14], category: 'ninth' },
	minor9: { id: 'minor9', label: 'm9', name: 'Minor ninth', intervals: [0, 3, 7, 10, 14], category: 'ninth' },
	dominant9: { id: 'dominant9', label: '9', name: 'Dominant ninth', intervals: [0, 4, 7, 10, 14], category: 'ninth' },
	major11: { id: 'major11', label: 'maj11', name: 'Major eleventh', intervals: [0, 4, 7, 11, 14, 17], category: 'extension' },
	minor11: { id: 'minor11', label: 'm11', name: 'Minor eleventh', intervals: [0, 3, 7, 10, 14, 17], category: 'extension' },
	dominant11: { id: 'dominant11', label: '11', name: 'Dominant eleventh', intervals: [0, 4, 7, 10, 14, 17], category: 'extension' },
	major13: { id: 'major13', label: 'maj13', name: 'Major thirteenth', intervals: [0, 4, 7, 11, 14, 21], category: 'extension' },
	minor13: { id: 'minor13', label: 'm13', name: 'Minor thirteenth', intervals: [0, 3, 7, 10, 14, 21], category: 'extension' },
	dominant13: { id: 'dominant13', label: '13', name: 'Dominant thirteenth', intervals: [0, 4, 7, 10, 14, 21], category: 'extension' }
}

export const CHORD_LABELS = Object.fromEntries(
	Object.values(CHORD_QUALITIES).map((quality) => [quality.id, quality.label])
) as Record<ChordTypeT, string>

export const CHORD_GRID_SECTIONS: { label: string; qualityIds: ChordTypeT[] }[] = [
	{ label: 'Power', qualityIds: ['power5'] },
	{ label: 'Triads', qualityIds: ['major', 'minor', 'diminished', 'augmented'] },
	{ label: 'Suspended', qualityIds: ['sus2', 'sus4', 'sus24'] },
	{ label: 'Sixths', qualityIds: ['major6', 'minor6'] },
	{ label: 'Sevenths', qualityIds: ['major7', 'minor7', 'dominant7', 'minorMajor7', 'halfDiminished7', 'diminished7', 'augmented7', 'augmentedMajor7', 'dominant7sus2', 'dominant7sus4'] },
	{ label: 'Ninths', qualityIds: ['major9', 'minor9', 'dominant9'] },
	{ label: 'Extensions', qualityIds: ['major11', 'minor11', 'dominant11', 'major13', 'minor13', 'dominant13'] },
	{ label: 'Adds', qualityIds: ['add2', 'add4', 'add9'] }
]

export const noteNameToPitchClass = (noteName: string): number => {
	const index = CHROMATIC_NOTES.indexOf(noteName as (typeof CHROMATIC_NOTES)[number])
	return index === -1 ? 0 : index
}

export const pitchClassToNoteName = (pitchClass: number): string => {
	const wrapped = ((Math.round(pitchClass) % CHROMATIC_NOTES.length) + CHROMATIC_NOTES.length) % CHROMATIC_NOTES.length
	return CHROMATIC_NOTES[wrapped]
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

const getStackedDegreeValue = (scaleIntervals: number[], baseDegree: number, stepsAbove: number): number => {
	const absoluteStep = baseDegree + stepsAbove
	const stepIndex = absoluteStep % scaleIntervals.length
	const octaveWraps = Math.floor(absoluteStep / scaleIntervals.length)
	return scaleIntervals[stepIndex] + octaveWraps * 12
}

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
	if (triadType === 'minor' && seventhInterval === 11) return 'minorMajor7'
	if (triadType === 'diminished' && seventhInterval === 10) return 'halfDiminished7'
	if (triadType === 'diminished' && seventhInterval === 9) return 'diminished7'
	if (triadType === 'augmented' && seventhInterval === 11) return 'augmentedMajor7'
	if (triadType === 'augmented') return 'augmented7'
	return triadType
}

export const getDiatonicChords = (key: string, scale: ScaleTypeT): DiatonicChordT[] => {
	const rootPitchClass = noteNameToPitchClass(key)
	const intervals = SCALE_INTERVALS[scale]

	return intervals.map((interval, degree) => {
		const pitchClass = (rootPitchClass + interval) % 12
		const triadType = getDiatonicTriadType(intervals, degree)
		const seventhChordType = getDiatonicSeventhType(intervals, degree, triadType)
		const isLowerCase = triadType === 'minor' || triadType === 'diminished'
		const numeral = isLowerCase ? ROMAN_NUMERALS[degree].toLowerCase() : ROMAN_NUMERALS[degree]
		const suffix = triadType === 'diminished' ? 'dim' : ''

		return {
			degree,
			romanNumeral: `${numeral}${suffix}`,
			root: CHROMATIC_NOTES[pitchClass],
			chordType: triadType,
			seventhChordType
		}
	})
}

export const resolveChordRootName = (root: ChordRootT, key: string, scale: ScaleTypeT): string => {
	if (root.kind === 'pitchClass') return pitchClassToNoteName(root.pitchClass)

	const rootPitchClass = noteNameToPitchClass(key)
	const intervals = SCALE_INTERVALS[scale] ?? SCALE_INTERVALS.major
	const degree = ((Math.round(root.degree) % intervals.length) + intervals.length) % intervals.length
	return pitchClassToNoteName(rootPitchClass + intervals[degree])
}

export const getChordQualityLabel = (qualityId: string): string => {
	return CHORD_QUALITIES[qualityId as ChordTypeT]?.label ?? qualityId
}

export const getChordQualityName = (qualityId: string): string => {
	return CHORD_QUALITIES[qualityId as ChordTypeT]?.name ?? qualityId
}

const applyVoicing = (notes: number[], voicing: ChordVoicingT): number[] => {
	if (voicing === 'closed') return notes

	if (voicing === 'drop2' && notes.length >= 4) {
		const voiced = [...notes]
		voiced[voiced.length - 2] -= 12
		return voiced.sort((a, b) => a - b)
	}

	if (voicing === 'open') {
		return notes.map((note, index) => note + (index % 2 === 1 ? 12 : 0)).sort((a, b) => a - b)
	}

	if (voicing === 'spread') {
		return notes.map((note, index) => note + Math.floor(index / 2) * 12).sort((a, b) => a - b)
	}

	return notes
}

export const expandChord = (
	root: string,
	chordType: string,
	inversion: number,
	baseOctave: number,
	voicing: ChordVoicingT = 'closed'
): number[] => {
	const intervals = CHORD_QUALITIES[chordType as ChordTypeT]?.intervals ?? CHORD_QUALITIES.major.intervals
	const rootMidi = noteToMidi(root, baseOctave)
	let notes = intervals.map((interval) => rootMidi + interval)

	const wrappedInversion = ((inversion % notes.length) + notes.length) % notes.length
	for (let step = 0; step < wrappedInversion; step++) {
		const lowestNote = notes.shift()
		if (lowestNote !== undefined) notes.push(lowestNote + 12)
	}

	return applyVoicing(notes, voicing)
}

export const resolveSignalToMidi = (noteIndex: number, octaveModifier: number, chordNotes: number[]): number => {
	const zeroBasedIndex = Math.max(0, noteIndex - 1)
	const wrappedIndex = zeroBasedIndex % chordNotes.length
	const wrapOctaves = Math.floor(zeroBasedIndex / chordNotes.length)
	return chordNotes[wrappedIndex] + (wrapOctaves + octaveModifier) * 12
}
