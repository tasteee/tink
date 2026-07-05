import { expandChord, resolveChordRootName, resolveSignalToMidi } from './theory'
import { ticksToBeats } from './timing'
import type { PatternLoopModeT, PatternSignalT, PlaybackNoteT, ProgressionChordItemT, ProgressionItemT, ScaleTypeT } from './types'

export const getProgressionLengthTicks = (items: ProgressionItemT[]): number => {
	return items.reduce((total, item) => total + item.durationTicks, 0)
}

export const getItemStartTicks = (items: ProgressionItemT[]): Map<string, number> => {
	const sorted = [...items].sort((a, b) => a.order - b.order)
	const startTicks = new Map<string, number>()
	let cursor = 0
	for (const item of sorted) {
		startTicks.set(item._id, cursor)
		cursor += item.durationTicks
	}
	return startTicks
}

const getItemActiveAtTick = (
	items: ProgressionItemT[],
	startTicks: Map<string, number>,
	tick: number
): ProgressionItemT | null => {
	const sorted = [...items].sort((a, b) => a.order - b.order)
	for (const item of sorted) {
		const start = startTicks.get(item._id) ?? 0
		const end = start + item.durationTicks
		if (tick >= start && tick < end) return item
	}
	return sorted.length > 0 ? sorted[sorted.length - 1] : null
}

const resolveChordNote = (
	signal: PatternSignalT,
	activeChord: ProgressionChordItemT,
	key: string,
	scale: ScaleTypeT,
	rootOctave: number
): { midiNote: number; velocity: number } => {
	const rootName = resolveChordRootName(activeChord.root, key, scale)
	const baseOctave = rootOctave + (activeChord.octaveOffset ?? 0)
	const chordNotes = expandChord(rootName, activeChord.qualityId, activeChord.inversion, baseOctave, activeChord.voicing ?? 'closed')
	const midiNote = resolveSignalToMidi(signal.chordToneIndex, signal.octaveModifier, chordNotes)
	const velocityMin = activeChord.velocityMin ?? signal.velocity
	const velocityMax = activeChord.velocityMax ?? signal.velocity
	const lowVelocity = Math.min(velocityMin, velocityMax)
	const highVelocity = Math.max(velocityMin, velocityMax)
	const velocity = Math.round(lowVelocity + Math.random() * (highVelocity - lowVelocity))
	return { midiNote, velocity }
}

const getPlayableSignals = (signals: PatternSignalT[], patternLengthTicks: number): PatternSignalT[] => {
	return signals.filter((signal) => {
		if (signal.isEnabled === false) return false
		if ((signal.probability ?? 1) <= 0) return false
		return signal.startTicks < patternLengthTicks
	})
}

const generateLoopAcrossProgressionNotes = (
	signals: PatternSignalT[],
	progressionItems: ProgressionItemT[],
	patternLengthTicks: number,
	key: string,
	scale: ScaleTypeT,
	rootOctave: number
): PlaybackNoteT[] => {
	const progressionLengthTicks = getProgressionLengthTicks(progressionItems)
	const startTicks = getItemStartTicks(progressionItems)
	const notes: PlaybackNoteT[] = []

	let loopStartTicks = 0
	while (loopStartTicks < progressionLengthTicks) {
		for (const signal of getPlayableSignals(signals, patternLengthTicks)) {
			const absoluteStartTicks = loopStartTicks + signal.startTicks
			if (absoluteStartTicks >= progressionLengthTicks) continue

			const activeChord = getItemActiveAtTick(progressionItems, startTicks, absoluteStartTicks)
			if (activeChord === null) continue
			if (activeChord.type !== 'chord') continue
			if (activeChord.isEnabled === false) continue

			const clampedDurationTicks = Math.min(
				signal.durationTicks,
				patternLengthTicks - signal.startTicks,
				progressionLengthTicks - absoluteStartTicks
			)
			if (clampedDurationTicks <= 0) continue
			const note = resolveChordNote(signal, activeChord, key, scale, rootOctave)

			notes.push({
				startBeat: ticksToBeats(absoluteStartTicks),
				durationBeats: ticksToBeats(clampedDurationTicks),
				midiNote: note.midiNote,
				velocity: note.velocity
			})
		}
		loopStartTicks += patternLengthTicks
	}

	return notes
}

const generateRestartOnChordNotes = (
	signals: PatternSignalT[],
	progressionItems: ProgressionItemT[],
	patternLengthTicks: number,
	key: string,
	scale: ScaleTypeT,
	rootOctave: number
): PlaybackNoteT[] => {
	const sortedItems = [...progressionItems].sort((a, b) => a.order - b.order)
	const playableSignals = getPlayableSignals(signals, patternLengthTicks)
	const notes: PlaybackNoteT[] = []
	let itemStartTicks = 0

	for (const item of sortedItems) {
		if (item.type === 'chord' && item.isEnabled !== false) {
			for (const signal of playableSignals) {
				if (signal.startTicks >= item.durationTicks) continue
				const absoluteStartTicks = itemStartTicks + signal.startTicks
				const clampedDurationTicks = Math.min(
					signal.durationTicks,
					patternLengthTicks - signal.startTicks,
					item.durationTicks - signal.startTicks
				)
				if (clampedDurationTicks <= 0) continue
				const note = resolveChordNote(signal, item, key, scale, rootOctave)

				notes.push({
					startBeat: ticksToBeats(absoluteStartTicks),
					durationBeats: ticksToBeats(clampedDurationTicks),
					midiNote: note.midiNote,
					velocity: note.velocity
				})
			}
		}
		itemStartTicks += item.durationTicks
	}

	return notes
}

export const generatePlaybackNotes = (
	signals: PatternSignalT[],
	progressionItems: ProgressionItemT[],
	patternLengthTicks: number,
	key: string,
	scale: ScaleTypeT,
	rootOctave: number,
	loopMode: PatternLoopModeT = 'loopAcrossProgression'
): PlaybackNoteT[] => {
	const progressionLengthTicks = getProgressionLengthTicks(progressionItems)
	if (progressionLengthTicks <= 0 || patternLengthTicks <= 0 || signals.length === 0) return []

	if (loopMode === 'restartOnChord') {
		return generateRestartOnChordNotes(signals, progressionItems, patternLengthTicks, key, scale, rootOctave)
	}
	return generateLoopAcrossProgressionNotes(signals, progressionItems, patternLengthTicks, key, scale, rootOctave)
}

export const beatsToSeconds = (beats: number, bpm: number): number => (beats / bpm) * 60
