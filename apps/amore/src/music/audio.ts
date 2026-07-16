type SmplrStopT = (time?: number) => void

type SmplrInstrumentT = {
	ready: Promise<void>
	start: (note: { note: number; velocity?: number; time?: number; duration?: number }) => SmplrStopT
	stop: (stopId?: number | string) => void
}

type SmplrModuleT = {
	SplendidGrandPiano: (context: AudioContext) => SmplrInstrumentT
}

const SMPLR_URL = 'https://unpkg.com/smplr@1.0.0/dist/index.mjs'

let sharedContext: AudioContext | null = null
let smplrPromise: Promise<SmplrModuleT> | null = null
let instrumentPromise: Promise<SmplrInstrumentT | null> | null = null
let instrument: SmplrInstrumentT | null = null
let instrumentFailed = false

const heldSampleStops = new Map<string, SmplrStopT[]>()
const scheduledSampleStops = new Set<SmplrStopT>()

const getAudioContext = (): AudioContext => {
	if (sharedContext === null) sharedContext = new AudioContext()
	if (sharedContext.state === 'suspended') void sharedContext.resume()
	return sharedContext
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
			const piano = smplr.SplendidGrandPiano(context)
			return piano.ready.then(() => piano)
		})
		.then((loadedInstrument) => {
			instrument = loadedInstrument
			return loadedInstrument
		})
		.catch((error) => {
			instrumentFailed = true
			console.error('[amore] Splendid Grand Piano unavailable; playback is disabled', error)
			return null
		})

	return instrumentPromise
}

export const preloadInstrument = (): void => {
	void warmInstrument()
}

export const stopScheduledPlayback = (): void => {
	if (sharedContext === null) return
	const context = getAudioContext()
	scheduledSampleStops.forEach((stop) => stop(context.currentTime))
	scheduledSampleStops.clear()
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

	void warmInstrument().then((sampledInstrument) => {
		if (sampledInstrument === null) return
		startSamplePreview(id, midiNotes, sampledInstrument, velocity)
	})
}

export const stopPreview = (id: string): void => {
	if (sharedContext === null) return
	const context = getAudioContext()
	const sampleStops = heldSampleStops.get(id)
	if (sampleStops !== undefined) {
		sampleStops.forEach((stop) => stop(context.currentTime))
		heldSampleStops.delete(id)
	}
}

export const stopAllPreviews = (): void => {
	if (sharedContext === null) return
	const context = getAudioContext()
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

	void warmInstrument().then((sampledInstrument) => {
		if (sampledInstrument === null) return
		const playbackTime = Math.max(startTime, context.currentTime)
		const stop = sampledInstrument.start({
			note: midiNote,
			velocity: Math.min(127, Math.max(1, velocity)),
			time: playbackTime,
			duration: durationSeconds
		})
		scheduledSampleStops.add(stop)
		window.setTimeout(() => scheduledSampleStops.delete(stop), Math.max(0, (playbackTime + durationSeconds + 1 - context.currentTime) * 1000))
	})
}

export const getCurrentAudioTime = (): number => getAudioContext().currentTime
