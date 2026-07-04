import { expandChord, resolveChordRootName, resolveSignalToMidi } from './theory'
import { ticksToBeats } from './timing'
import type { PatternSignalT, PlaybackNoteT, ProgressionItemT, ScaleTypeT } from './types'

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

export const generatePlaybackNotes = (
	signals: PatternSignalT[],
	progressionItems: ProgressionItemT[],
	patternLengthTicks: number,
	key: string,
	scale: ScaleTypeT,
	rootOctave: number
): PlaybackNoteT[] => {
	const progressionLengthTicks = getProgressionLengthTicks(progressionItems)
	if (progressionLengthTicks <= 0 || patternLengthTicks <= 0 || signals.length === 0) return []

	const startTicks = getItemStartTicks(progressionItems)
	const notes: PlaybackNoteT[] = []

	let loopStartTicks = 0
	while (loopStartTicks < progressionLengthTicks) {
		for (const signal of signals) {
			if (signal.isEnabled === false) continue
			if ((signal.probability ?? 1) <= 0) continue

			const absoluteStartTicks = loopStartTicks + signal.startTicks
			if (absoluteStartTicks >= progressionLengthTicks) continue

			const activeChord = getItemActiveAtTick(progressionItems, startTicks, absoluteStartTicks)
			if (activeChord === null) continue
			if (activeChord.type !== 'chord') continue
			if (activeChord.isEnabled === false) continue

			const rootName = resolveChordRootName(activeChord.root, key, scale)
			const baseOctave = rootOctave + (activeChord.octaveOffset ?? 0)
			const chordNotes = expandChord(rootName, activeChord.qualityId, activeChord.inversion, baseOctave, activeChord.voicing ?? 'closed')
			const midiNote = resolveSignalToMidi(signal.chordToneIndex, signal.octaveModifier, chordNotes)
			const clampedDurationTicks = Math.min(signal.durationTicks, progressionLengthTicks - absoluteStartTicks)
			const velocityMin = activeChord.velocityMin ?? signal.velocity
			const velocityMax = activeChord.velocityMax ?? signal.velocity
			const lowVelocity = Math.min(velocityMin, velocityMax)
			const highVelocity = Math.max(velocityMin, velocityMax)
			const velocity = Math.round(lowVelocity + Math.random() * (highVelocity - lowVelocity))

			notes.push({
				startBeat: ticksToBeats(absoluteStartTicks),
				durationBeats: ticksToBeats(clampedDurationTicks),
				midiNote,
				velocity
			})
		}
		loopStartTicks += patternLengthTicks
	}

	return notes
}

export const beatsToSeconds = (beats: number, bpm: number): number => (beats / bpm) * 60
