import { midiToFrequency } from './theory'

// A small self-contained synth standing in for a piano soundfont: a couple of
// detuned triangle/sine oscillators per note through a short percussive
// envelope. No samples to fetch, no licensing, good enough to judge a chord
// or a pattern by ear.
//
// Held previews (chord grid) and scheduled playback (pattern engine) both
// flow through independent gain nodes so each can be silenced instantly
// without affecting the other.

type VoiceT = {
	oscillators: OscillatorNode[]
	gain: GainNode
}

const ATTACK_SECONDS = 0.008
const RELEASE_SECONDS = 0.12

let sharedContext: AudioContext | null = null
let playbackBus: GainNode | null = null

const getAudioContext = (): AudioContext => {
	if (sharedContext === null) sharedContext = new AudioContext()
	if (sharedContext.state === 'suspended') void sharedContext.resume()
	return sharedContext
}

const getPlaybackBus = (): GainNode => {
	const context = getAudioContext()
	if (playbackBus === null) {
		playbackBus = context.createGain()
		playbackBus.connect(context.destination)
	}
	return playbackBus
}

export const stopScheduledPlayback = (): void => {
	if (playbackBus === null) return
	const context = getAudioContext()
	playbackBus.gain.setValueAtTime(0, context.currentTime)
	// Re-create the bus for the next playback session so scheduled notes
	// from the previous session stay silenced.
	playbackBus.disconnect()
	playbackBus = null
}

const createVoice = (
	context: AudioContext,
	midiNote: number,
	destination: AudioNode,
	velocity: number,
	startTime: number
): VoiceT => {
	const frequency = midiToFrequency(midiNote)
	const gain = context.createGain()
	const peakLevel = (velocity / 127) * 0.22

	gain.gain.setValueAtTime(0, startTime)
	gain.gain.linearRampToValueAtTime(peakLevel, startTime + ATTACK_SECONDS)
	gain.connect(destination)

	const detunes = [0, -6, 6]
	const oscillators = detunes.map((detune) => {
		const oscillator = context.createOscillator()
		oscillator.type = 'triangle'
		oscillator.frequency.value = frequency
		oscillator.detune.value = detune
		oscillator.connect(gain)
		oscillator.start(startTime)
		return oscillator
	})

	return { oscillators, gain }
}

const stopVoice = (context: AudioContext, voice: VoiceT, atTime: number): void => {
	voice.gain.gain.cancelScheduledValues(atTime)
	voice.gain.gain.setValueAtTime(voice.gain.gain.value, atTime)
	voice.gain.gain.linearRampToValueAtTime(0, atTime + RELEASE_SECONDS)
	voice.oscillators.forEach((oscillator) => oscillator.stop(atTime + RELEASE_SECONDS + 0.02))
}

// Held-note preview: mousedown plays, mouseup/mouseleave releases. Keyed by an
// arbitrary id (e.g. the chord's roman numeral) so overlapping previews don't
// fight each other.
const heldVoices = new Map<string, VoiceT[]>()

export const startPreview = (id: string, midiNotes: number[]): void => {
	stopPreview(id)
	const context = getAudioContext()
	const voices = midiNotes.map((midiNote) => createVoice(context, midiNote, context.destination, 100, context.currentTime))
	heldVoices.set(id, voices)
}

export const stopPreview = (id: string): void => {
	const context = getAudioContext()
	const voices = heldVoices.get(id)
	if (voices === undefined) return
	voices.forEach((voice) => stopVoice(context, voice, context.currentTime))
	heldVoices.delete(id)
}

export const stopAllPreviews = (): void => {
	const context = getAudioContext()
	heldVoices.forEach((voices) => voices.forEach((voice) => stopVoice(context, voice, context.currentTime)))
	heldVoices.clear()
}

// Scheduled playback: every note's start/duration is already absolute
// (in seconds) by the time it reaches here — see music/playback.ts.
export const scheduleNote = (startTime: number, durationSeconds: number, midiNote: number, velocity: number): void => {
	const context = getAudioContext()
	const voice = createVoice(context, midiNote, getPlaybackBus(), velocity, startTime)
	const peakLevel = (velocity / 127) * 0.22
	const releaseAt = startTime + Math.max(durationSeconds, ATTACK_SECONDS)
	voice.gain.gain.setValueAtTime(peakLevel, releaseAt)
	voice.gain.gain.linearRampToValueAtTime(0, releaseAt + RELEASE_SECONDS)
	voice.oscillators.forEach((oscillator) => oscillator.stop(releaseAt + RELEASE_SECONDS + 0.02))
}

export const getCurrentAudioTime = (): number => getAudioContext().currentTime
