import { expandChord, resolveSignalToMidi } from './theory'
import type { PlaybackNoteT, ProgressionChordT, SignalT } from './types'

const CHORD_VOICE_OCTAVE = 4

export const getProgressionLengthBeats = (chords: ProgressionChordT[]): number => {
	return chords.reduce((total, chord) => total + chord.durationBeats, 0)
}

// Start beat of each chord, derived from cumulative durations — the lane has
// no gaps, so `order` + `durationBeats` alone fully determines position.
export const getChordStartBeats = (chords: ProgressionChordT[]): Map<string, number> => {
	const sorted = [...chords].sort((a, b) => a.order - b.order)
	const startBeats = new Map<string, number>()
	let cursor = 0
	for (const chord of sorted) {
		startBeats.set(chord._id, cursor)
		cursor += chord.durationBeats
	}
	return startBeats
}

const getChordActiveAtBeat = (
	chords: ProgressionChordT[],
	startBeats: Map<string, number>,
	beat: number
): ProgressionChordT | null => {
	const sorted = [...chords].sort((a, b) => a.order - b.order)
	for (const chord of sorted) {
		const start = startBeats.get(chord._id) ?? 0
		const end = start + chord.durationBeats
		if (beat >= start && beat < end) return chord
	}
	return sorted.length > 0 ? sorted[sorted.length - 1] : null
}

// Flattens (pattern signals × progression chords) into absolute, playable
// notes. The pattern loops until the full progression length is covered;
// each loop re-resolves every signal against whatever chord is active then —
// a chord change mid-loop changes the rest of that loop's pitches.
export const generatePlaybackNotes = (
	signals: SignalT[],
	progressionChords: ProgressionChordT[],
	patternLengthBeats: number
): PlaybackNoteT[] => {
	const progressionLength = getProgressionLengthBeats(progressionChords)
	if (progressionLength <= 0 || signals.length === 0) return []

	const startBeats = getChordStartBeats(progressionChords)
	const notes: PlaybackNoteT[] = []

	let loopStart = 0
	while (loopStart < progressionLength) {
		for (const signal of signals) {
			const absoluteStart = loopStart + signal.startBeat
			if (absoluteStart >= progressionLength) continue

			const activeChord = getChordActiveAtBeat(progressionChords, startBeats, absoluteStart)
			if (activeChord === null) continue

			const chordNotes = expandChord(activeChord.root, activeChord.chordType, activeChord.inversion, CHORD_VOICE_OCTAVE)
			const midiNote = resolveSignalToMidi(signal.noteIndex, signal.octaveModifier, chordNotes)
			const clampedDuration = Math.min(signal.durationBeats, progressionLength - absoluteStart)

			notes.push({
				startBeat: absoluteStart,
				durationBeats: clampedDuration,
				midiNote,
				velocity: signal.velocity
			})
		}
		loopStart += patternLengthBeats
	}

	return notes
}

export const beatsToSeconds = (beats: number, bpm: number): number => (beats / bpm) * 60
