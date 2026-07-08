import { expandChord, resolveChordRootName } from './theory'
import { TICKS_PER_BEAT, ticksToBeats } from './timing'
import type { PlaybackNoteT, ProgressionChordItemT, ProgressionItemT, ScaleTypeT } from './types'

const DEFAULT_VELOCITY_MIN = 72
const DEFAULT_VELOCITY_MAX = 112

type MidiTrackEventT = {
	tick: number
	order: number
	bytes: number[]
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))

const writeUint16 = (value: number): number[] => [(value >> 8) & 0xff, value & 0xff]
const writeUint24 = (value: number): number[] => [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff]
const writeUint32 = (value: number): number[] => [
	(value >> 24) & 0xff,
	(value >> 16) & 0xff,
	(value >> 8) & 0xff,
	value & 0xff
]

const writeAscii = (value: string): number[] => [...value].map((character) => character.charCodeAt(0) & 0xff)

const writeVariableLength = (value: number): number[] => {
	let remaining = Math.max(0, Math.round(value))
	const bytes = [remaining & 0x7f]
	remaining >>= 7
	while (remaining > 0) {
		bytes.unshift((remaining & 0x7f) | 0x80)
		remaining >>= 7
	}
	return bytes
}

const writeChunk = (name: string, data: number[]): number[] => [...writeAscii(name), ...writeUint32(data.length), ...data]

const noteToTicks = (beats: number): number => Math.max(0, Math.round(beats * TICKS_PER_BEAT))

const normalizeNote = (note: PlaybackNoteT): PlaybackNoteT => ({
	startBeat: Math.max(0, note.startBeat),
	durationBeats: Math.max(1 / TICKS_PER_BEAT, note.durationBeats),
	midiNote: clamp(Math.round(note.midiNote), 0, 127),
	velocity: clamp(Math.round(note.velocity), 1, 127)
})

export const createMidiFile = (notes: PlaybackNoteT[], bpm: number): Uint8Array => {
	const tempo = clamp(Math.round(bpm), 20, 300)
	const microsPerBeat = Math.round(60000000 / tempo)
	const events: MidiTrackEventT[] = [
		{ tick: 0, order: 0, bytes: [0xff, 0x51, 0x03, ...writeUint24(microsPerBeat)] },
		{ tick: 0, order: 1, bytes: [0xff, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08] }
	]

	for (const sourceNote of notes.map(normalizeNote)) {
		const startTick = noteToTicks(sourceNote.startBeat)
		const endTick = Math.max(startTick + 1, startTick + noteToTicks(sourceNote.durationBeats))
		events.push({ tick: startTick, order: 3, bytes: [0x90, sourceNote.midiNote, sourceNote.velocity] })
		events.push({ tick: endTick, order: 2, bytes: [0x80, sourceNote.midiNote, 0] })
	}

	events.sort((a, b) => a.tick - b.tick || a.order - b.order)

	const track: number[] = []
	let cursor = 0
	for (const event of events) {
		track.push(...writeVariableLength(event.tick - cursor), ...event.bytes)
		cursor = event.tick
	}
	track.push(...writeVariableLength(0), 0xff, 0x2f, 0x00)

	const header = writeChunk('MThd', [...writeUint16(0), ...writeUint16(1), ...writeUint16(TICKS_PER_BEAT)])
	const trackChunk = writeChunk('MTrk', track)
	return Uint8Array.from([...header, ...trackChunk])
}

export const downloadMidiFile = (notes: PlaybackNoteT[], bpm: number, fileName: string): void => {
	if (notes.length === 0) return
	const midiFile = createMidiFile(notes, bpm)
	const data = midiFile.buffer.slice(midiFile.byteOffset, midiFile.byteOffset + midiFile.byteLength) as ArrayBuffer
	const blob = new Blob([data], { type: 'audio/midi' })
	const url = URL.createObjectURL(blob)
	const anchor = document.createElement('a')
	anchor.href = url
	anchor.download = fileName.endsWith('.mid') ? fileName : `${fileName}.mid`
	document.body.append(anchor)
	anchor.click()
	anchor.remove()
	URL.revokeObjectURL(url)
}

export const sanitizeMidiFileName = (value: string): string => {
	const cleaned = value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9-_]+/g, '-')
		.replace(/^-+|-+$/g, '')
	return cleaned === '' ? 'amore' : cleaned
}

const velocityForChord = (item: ProgressionChordItemT): number => {
	const velocityMin = item.velocityMin ?? DEFAULT_VELOCITY_MIN
	const velocityMax = item.velocityMax ?? DEFAULT_VELOCITY_MAX
	return Math.round((velocityMin + velocityMax) / 2)
}

export const generateProgressionChordMidiNotes = (
	items: ProgressionItemT[],
	key: string,
	scale: ScaleTypeT,
	rootOctave: number
): PlaybackNoteT[] => {
	const notes: PlaybackNoteT[] = []
	let cursorTicks = 0

	for (const item of [...items].sort((a, b) => a.order - b.order)) {
		if (item.type === 'chord' && item.isEnabled !== false) {
			const root = resolveChordRootName(item.root, key, scale)
			const chordNotes = expandChord(
				root,
				item.qualityId,
				item.inversion,
				rootOctave + (item.octaveOffset ?? 0),
				item.voicing ?? 'closed'
			)
			const startBeat = ticksToBeats(cursorTicks)
			const durationBeats = ticksToBeats(item.durationTicks)
			const velocity = velocityForChord(item)
			for (const midiNote of chordNotes) {
				notes.push({ startBeat, durationBeats, midiNote, velocity })
			}
		}
		cursorTicks += item.durationTicks
	}

	return notes
}
