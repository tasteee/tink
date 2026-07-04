import { midiToFrequency } from './theory'

type VoiceT = {
	oscillators: OscillatorNode[]
	gain: GainNode
}

type SmplrStopT = (time?: number) => void

type SmplrInstrumentT = {
	ready: Promise<void>
	start: (note: { note: number; velocity?: number; time?: number; duration?: number }) => SmplrStopT
	stop: (stopId?: number | string) => void
}

type SmplrModuleT = {
	Soundfont: (context: AudioContext, options?: { instrument?: string; kit?: 'FluidR3_GM' | 'MusyngKite'; volume?: number; velocity?: number }) => SmplrInstrumentT
}

const ATTACK_SECONDS = 0.035
const RELEASE_SECONDS = 0.2
const SMPLR_URL = 'https://unpkg.com/smplr@1.0.0/dist/index.mjs'
const DEFAULT_SOUNDFONT_INSTRUMENT = 'synth_strings_1'

let sharedContext: AudioContext | null = null
let playbackBus: GainNode | null = null
let smplrPromise: Promise<SmplrModuleT> | null = null
let instrumentPromise: Promise<SmplrInstrumentT | null> | null = null
let instrument: SmplrInstrumentT | null = null
let instrumentFailed = false

const heldSynthVoices = new Map<string, VoiceT[]>()
const heldSampleStops = new Map<string, SmplrStopT[]>()
const scheduledSampleStops = new Set<SmplrStopT>()

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

const loadSmplr = async (): Promise<SmplrModuleT> => {
	if (smplrPromise !== null) return smplrPromise
	smplrPromise = import(/* @vite-ignore */ SMPLR_URL) as Promise<SmplrModuleT>
	return smplrPromise
}

const warmInstrument = (): Promise<SmplrInstrumentT | null> => {
	if (instrument !== null) return Promise.resolve(instrument)
	if (instrumentFailed) return Promise.resolve(null)
	if (instrumentPromise !== null) return instrumentPromise

	const context = getAudioContext()
	instrumentPromise = loadSmplr()
		.then((smplr) => {
			const soundfont = smplr.Soundfont(context, {
				instrument: DEFAULT_SOUNDFONT_INSTRUMENT,
				kit: 'FluidR3_GM',
				volume: 92,
				velocity: 100
			})
			return soundfont.ready.then(() => soundfont)
		})
		.then((loadedInstrument) => {
			instrument = loadedInstrument
			return loadedInstrument
		})
		.catch((error) => {
			instrumentFailed = true
			console.warn('[amore] sampled instrument unavailable, using fallback synth', error)
			return null
		})

	return instrumentPromise
}

export const preloadInstrument = (): void => {
	void loadSmplr().catch((error) => {
		console.warn('[amore] sampled instrument module unavailable, using fallback synth', error)
	})
}

export const stopScheduledPlayback = (): void => {
	if (sharedContext === null) return
	const context = getAudioContext()
	scheduledSampleStops.forEach((stop) => stop(context.currentTime))
	scheduledSampleStops.clear()

	if (playbackBus === null) return
	playbackBus.gain.setValueAtTime(0, context.currentTime)
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
	const peakLevel = (velocity / 127) * 0.13

	gain.gain.setValueAtTime(0, startTime)
	gain.gain.linearRampToValueAtTime(peakLevel, startTime + ATTACK_SECONDS)
	gain.connect(destination)

	const oscillators = [-7, 0, 7].map((detune) => {
		const oscillator = context.createOscillator()
		oscillator.type = 'sawtooth'
		oscillator.frequency.value = frequency
		oscillator.detune.value = detune
		oscillator.connect(gain)
		oscillator.start(startTime)
		return oscillator
	})

	return { oscillators, gain }
}

const stopVoice = (context: AudioContext, voice: VoiceT, atTime: number): void => {
	if (!Number.isFinite(atTime)) return
	voice.gain.gain.cancelScheduledValues(atTime)
	voice.gain.gain.setValueAtTime(voice.gain.gain.value, atTime)
	voice.gain.gain.linearRampToValueAtTime(0, atTime + RELEASE_SECONDS)
	voice.oscillators.forEach((oscillator) => oscillator.stop(atTime + RELEASE_SECONDS + 0.02))
}

const startSynthPreview = (id: string, midiNotes: number[], velocity: number): void => {
	const context = getAudioContext()
	const voices = midiNotes.map((midiNote) => createVoice(context, midiNote, context.destination, velocity, context.currentTime))
	heldSynthVoices.set(id, voices)
}

const startSamplePreview = (id: string, midiNotes: number[], sampledInstrument: SmplrInstrumentT, velocity: number): void => {
	const context = getAudioContext()
	const stops = midiNotes.map((midiNote) =>
		sampledInstrument.start({
			note: midiNote,
			velocity,
			time: context.currentTime
		})
	)
	heldSampleStops.set(id, stops)
}

export const startPreview = (id: string, midiNotes: number[], velocity = 92): void => {
	stopPreview(id)
	if (instrument !== null) {
		startSamplePreview(id, midiNotes, instrument, velocity)
		return
	}

	startSynthPreview(id, midiNotes, velocity)
	void warmInstrument()
}

export const stopPreview = (id: string): void => {
	if (sharedContext === null) return
	const context = getAudioContext()
	const synthVoices = heldSynthVoices.get(id)
	if (synthVoices !== undefined) {
		synthVoices.forEach((voice) => stopVoice(context, voice, context.currentTime))
		heldSynthVoices.delete(id)
	}

	const sampleStops = heldSampleStops.get(id)
	if (sampleStops !== undefined) {
		sampleStops.forEach((stop) => stop(context.currentTime))
		heldSampleStops.delete(id)
	}
}

export const stopAllPreviews = (): void => {
	if (sharedContext === null) return
	const context = getAudioContext()
	heldSynthVoices.forEach((voices) => voices.forEach((voice) => stopVoice(context, voice, context.currentTime)))
	heldSynthVoices.clear()
	heldSampleStops.forEach((stops) => stops.forEach((stop) => stop(context.currentTime)))
	heldSampleStops.clear()
}

export const scheduleNote = (startTime: number, durationSeconds: number, midiNote: number, velocity: number): void => {
	const context = getAudioContext()
	if (instrument !== null) {
		const stop = instrument.start({
			note: midiNote,
			velocity: Math.min(127, Math.max(1, velocity)),
			time: Math.max(startTime, context.currentTime),
			duration: durationSeconds
		})
		scheduledSampleStops.add(stop)
		window.setTimeout(() => scheduledSampleStops.delete(stop), Math.max(0, (startTime + durationSeconds + 1 - context.currentTime) * 1000))
		return
	}

	void warmInstrument()
	const voice = createVoice(context, midiNote, getPlaybackBus(), velocity, startTime)
	const peakLevel = (velocity / 127) * 0.18
	const releaseAt = startTime + Math.max(durationSeconds, ATTACK_SECONDS)
	voice.gain.gain.setValueAtTime(peakLevel, releaseAt)
	voice.gain.gain.linearRampToValueAtTime(0, releaseAt + RELEASE_SECONDS)
	voice.oscillators.forEach((oscillator) => oscillator.stop(releaseAt + RELEASE_SECONDS + 0.02))
}

export const getCurrentAudioTime = (): number => getAudioContext().currentTime
