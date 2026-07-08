import { createSignal, createEffect, onCleanup, Show } from 'solid-js'
import { useParams, useNavigate } from '@solidjs/router'
import { api } from '@convex/_generated/api'
import { createQuery, QUERY_SKIP } from '@amore/convex/createQuery'
import { convexClient } from '@amore/convex/client'
import { getIsAuthenticated } from '@amore/auth/authStore'
import { ChordGrid } from './ChordGrid'
import { ProgressionBar } from './ProgressionBar'
import { PatternEditor } from './PatternEditor'
import { getDiatonicChords, CHROMATIC_NOTES, SCALE_TYPES } from '@amore/music/theory'
import type { PatternLoopModeT, ProgressionItemT, ScaleTypeT } from '@amore/music/types'
import { generatePlaybackNotes, beatsToSeconds, getProgressionLengthTicks, getItemStartTicks } from '@amore/music/playback'
import { scheduleNote, stopScheduledPlayback, getCurrentAudioTime, preloadInstrument, stopAllPreviews } from '@amore/music/audio'
import { beatsToTicks, ticksToBeats } from '@amore/music/timing'
import { downloadMidiFile, generateProgressionChordMidiNotes, sanitizeMidiFileName } from '@amore/music/midi'

const KEY_OPTIONS = CHROMATIC_NOTES.map((note) => ({ value: note, label: note }))
const SCALE_OPTIONS = SCALE_TYPES.map((scale) => ({
	value: scale,
	label: scale.charAt(0).toUpperCase() + scale.slice(1)
}))

export const ProjectView = () => {
	const params = useParams()
	const navigate = useNavigate()
	const [isPatternMode, setIsPatternMode] = createSignal(false)
	const [isPlaying, setIsPlaying] = createSignal(false)
	const [playheadTicks, setPlayheadTicks] = createSignal(0)
	const [patternPlayheadTicks, setPatternPlayheadTicks] = createSignal(0)
	const [localProgressionItems, setLocalProgressionItems] = createSignal<ProgressionItemT[]>([])
	const [hydratedProgressionId, setHydratedProgressionId] = createSignal<string | null>(null)
	let stopTimer: ReturnType<typeof setTimeout> | null = null
	let animationFrameId: number | null = null
	let playbackStartTime = 0
	let playbackTotalTicks = 0
	let playbackPatternLengthTicks = 0
	let playbackLoopMode: PatternLoopModeT = 'loopAcrossProgression'
	let playbackSnapshot = ''

	const projectId = () => params.id as any

	const projectQuery = createQuery(api.projects.get, () => (getIsAuthenticated() ? { id: projectId() } : QUERY_SKIP))
	const project = projectQuery

	const progressionQuery = createQuery(api.progression.get, () =>
		getIsAuthenticated() && project()?.activeProgressionId !== undefined
			? { id: project()!.activeProgressionId! }
			: QUERY_SKIP
	)
	const progression = progressionQuery

	const patternQuery = createQuery(api.patterns.get, () =>
		getIsAuthenticated() && project()?.activePatternId !== undefined ? { id: project()!.activePatternId! } : QUERY_SKIP
	)
	const pattern = patternQuery

	const projectKey = () => project()?.key ?? 'C'
	const projectScale = () => (project()?.scale ?? 'major') as ScaleTypeT
	const projectBpm = () => project()?.bpm ?? 120
	const projectRootOctave = () => project()?.rootOctave ?? 4
	const patternLoopMode = () => (pattern()?.loopMode ?? 'loopAcrossProgression') as PatternLoopModeT
	const progressionItems = () => localProgressionItems()
	const signals = () => pattern()?.signals ?? []

	createEffect(() => {
		if (project() !== undefined) preloadInstrument()
	})

	createEffect(() => {
		const activeProgressionId = project()?.activeProgressionId
		const progressionData = progression()
		if (activeProgressionId === undefined || progressionData === undefined) return
		if (hydratedProgressionId() === activeProgressionId) return
		setLocalProgressionItems(progressionData.items ?? [])
		setHydratedProgressionId(activeProgressionId)
	})

	const handleKeySelectChange = (event: any) => {
		void convexClient.mutation(api.projects.update, { id: projectId(), key: event.detail.value })
	}

	const handleScaleSelectChange = (event: any) => {
		void convexClient.mutation(api.projects.update, { id: projectId(), scale: event.detail.value })
	}

	const handleBpmChange = (event: Event) => {
		const bpmValue = parseInt((event.currentTarget as HTMLInputElement).value, 10)
		const isInRange = bpmValue >= 20 && bpmValue <= 300
		if (isNaN(bpmValue) || !isInRange) return
		void convexClient.mutation(api.projects.update, { id: projectId(), bpm: bpmValue })
	}

	const getPatternCursorTicks = (
		absoluteTicks: number,
		progressionData: ProgressionItemT[],
		patternLengthTicks: number,
		loopMode: PatternLoopModeT
	): number => {
		if (patternLengthTicks <= 0) return 0
		if (loopMode === 'loopAcrossProgression') return absoluteTicks % patternLengthTicks

		const startTicks = getItemStartTicks(progressionData)
		const activeItem = [...progressionData]
			.sort((a, b) => a.order - b.order)
			.find((item) => {
				const start = startTicks.get(item._id) ?? 0
				return absoluteTicks >= start && absoluteTicks < start + item.durationTicks
			})
		if (activeItem === undefined) return 0
		const itemStartTicks = startTicks.get(activeItem._id) ?? 0
		return Math.min(patternLengthTicks, absoluteTicks - itemStartTicks)
	}

	const stopCursor = (): void => {
		if (animationFrameId !== null) {
			cancelAnimationFrame(animationFrameId)
			animationFrameId = null
		}
	}

	const updateCursor = (progressionData: ProgressionItemT[], bpm: number): void => {
		const elapsedSeconds = Math.max(0, getCurrentAudioTime() - playbackStartTime)
		const elapsedTicks = Math.min(playbackTotalTicks, beatsToTicks((elapsedSeconds * bpm) / 60))
		setPlayheadTicks(elapsedTicks)
		setPatternPlayheadTicks(getPatternCursorTicks(elapsedTicks, progressionData, playbackPatternLengthTicks, playbackLoopMode))

		if (elapsedTicks >= playbackTotalTicks) {
			stopPlayback()
			return
		}
		animationFrameId = requestAnimationFrame(() => updateCursor(progressionData, bpm))
	}

	const startPlayback = () => {
		stopPlayback()
		const projectData = project()
		const progressionData = progressionItems()
		const signalData = signals()
		const patternData = pattern()
		if (!projectData || !patternData || progressionData.length === 0) return
		if (signalData.length === 0) return

		const notes = generatePlaybackNotes(
			signalData,
			progressionData,
			patternData.durationTicks,
			projectKey(),
			projectScale(),
			projectRootOctave(),
			patternLoopMode()
		)
		const startTime = getCurrentAudioTime() + 0.05
		for (const note of notes) {
			const noteStart = startTime + beatsToSeconds(note.startBeat, projectData.bpm)
			const noteDuration = beatsToSeconds(note.durationBeats, projectData.bpm)
			scheduleNote(noteStart, noteDuration, note.midiNote, note.velocity)
		}

		const totalTicks = getProgressionLengthTicks(progressionData)
		const totalBeats = ticksToBeats(totalTicks)
		const totalSeconds = beatsToSeconds(totalBeats, projectData.bpm)
		playbackStartTime = startTime
		playbackTotalTicks = totalTicks
		playbackPatternLengthTicks = patternData.durationTicks
		playbackLoopMode = patternLoopMode()
		setPlayheadTicks(0)
		setPatternPlayheadTicks(0)
		setIsPlaying(true)
		animationFrameId = requestAnimationFrame(() => updateCursor(progressionData, projectData.bpm))
		stopTimer = setTimeout(stopPlayback, (totalSeconds + 0.5) * 1000)
	}

	const stopPlayback = () => {
		stopCursor()
		stopScheduledPlayback()
		stopAllPreviews()
		if (stopTimer !== null) {
			clearTimeout(stopTimer)
			stopTimer = null
		}
		setIsPlaying(false)
		setPlayheadTicks(0)
		setPatternPlayheadTicks(0)
	}

	const midiBaseFileName = (): string => sanitizeMidiFileName(project()?.name ?? 'amore')

	const downloadProgressionMidi = (): void => {
		const notes = generateProgressionChordMidiNotes(progressionItems(), projectKey(), projectScale(), projectRootOctave())
		downloadMidiFile(notes, projectBpm(), `${midiBaseFileName()}-progression.mid`)
	}

	const downloadPerformanceMidi = (): void => {
		const patternData = pattern()
		if (patternData === undefined) return
		const notes = generatePlaybackNotes(
			signals(),
			progressionItems(),
			patternData.durationTicks,
			projectKey(),
			projectScale(),
			projectRootOctave(),
			patternLoopMode()
		)
		downloadMidiFile(notes, projectBpm(), `${midiBaseFileName()}-performance.mid`)
	}

	const playbackInputSnapshot = (): string => {
		const progressionData = progressionItems()
		const signalData = signals()
		return JSON.stringify({
			key: projectKey(),
			scale: projectScale(),
			bpm: projectBpm(),
			rootOctave: projectRootOctave(),
			patternDurationTicks: pattern()?.durationTicks ?? 0,
			loopMode: patternLoopMode(),
			progressionItems: progressionData.map((item) => item),
			signals: signalData.map((signal) => signal)
		})
	}

	createEffect(() => {
		const snapshot = playbackInputSnapshot()
		if (playbackSnapshot === '') {
			playbackSnapshot = snapshot
			return
		}
		if (isPlaying() && snapshot !== playbackSnapshot) stopPlayback()
		playbackSnapshot = snapshot
	})

	const handleSpacebar = (event: KeyboardEvent) => {
		if (event.code !== 'Space') return
		const target = event.target as HTMLElement
		const isTypingTarget = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'
		if (isTypingTarget) return
		event.preventDefault()
		if (isPlaying()) {
			stopPlayback()
		} else {
			startPlayback()
		}
	}

	createEffect(() => {
		document.addEventListener('keydown', handleSpacebar)
		onCleanup(() => {
			document.removeEventListener('keydown', handleSpacebar)
			stopCursor()
			stopScheduledPlayback()
			if (stopTimer !== null) clearTimeout(stopTimer)
		})
	})

	return (
		<div class='projectPage'>
			<div class='projectTopBar'>
				<button type='button' class='projectBack' onClick={() => navigate('/')}>
					← Home
				</button>

				<span class='projectTopBarTitle'>
					<Show when={project()} fallback='Loading…'>
						{project()!.name}
					</Show>
				</span>

				<div class='projectTopBarControls'>
					<div class='projectSelectGroup'>
						<span class='projectSelectLabel'>Key</span>
						<z-select options={KEY_OPTIONS} value={projectKey()} size='small' isInline on:change={handleKeySelectChange} />
					</div>

					<div class='projectSelectGroup'>
						<span class='projectSelectLabel'>Scale</span>
						<z-select options={SCALE_OPTIONS} value={projectScale()} size='small' isInline on:change={handleScaleSelectChange} />
					</div>

					<div class='projectSelectGroup'>
						<span class='projectSelectLabel'>BPM</span>
						<input
							type='number'
							value={projectBpm()}
							min='20'
							max='300'
							onChange={handleBpmChange}
							style={{
								width: '72px',
								height: '2.25rem',
								'padding-inline': '0.75rem',
								'font-size': 'var(--font-size-small)',
								background: 'transparent',
								border: '1px solid var(--border)',
								'border-radius': 'var(--radius-md)',
								color: 'var(--foreground)',
								'font-family': 'inherit'
							}}
						/>
					</div>

					<z-button size='small' kind={isPatternMode() ? 'solid' : 'outline'} onClick={() => setIsPatternMode((v) => !v)}>
						{isPatternMode() ? '← Chords' : 'Pattern →'}
					</z-button>

					<z-button
						size='small'
						kind={isPlaying() ? 'soft' : 'ghost'}
						tone={isPlaying() ? 'primary' : 'neutral'}
						onClick={() => (isPlaying() ? stopPlayback() : startPlayback())}
					>
						{isPlaying() ? '■ Stop' : '▶ Play'}
					</z-button>
				</div>
			</div>

			<div class='projectMain'>
				<div class='projectContent'>
					<Show when={!isPatternMode()}>
						<Show when={project()?.activeProgressionId !== undefined}>
							<ChordGrid
								diatonicChords={getDiatonicChords(projectKey(), projectScale())}
								projectRootOctave={projectRootOctave()}
							/>
						</Show>
					</Show>

					<Show when={isPatternMode()}>
						{/* keyed on patternId so each pattern gets a fresh editor/sync
						    instance (no cross-pattern bleed); only mounts once signals
						    are loaded so the initial seed sees real data */}
						<Show when={pattern() !== undefined ? project()?.activePatternId : undefined} keyed>
							{(patternId) => (
								<PatternEditor
									patternId={patternId}
									patternLengthTicks={pattern()?.durationTicks ?? 1920}
									gridTicks={pattern()?.gridTicks ?? 120}
									loopMode={patternLoopMode()}
									signals={signals()}
									playheadTicks={isPlaying() ? patternPlayheadTicks() : null}
								/>
							)}
						</Show>
					</Show>
				</div>

				<Show when={project()?.activeProgressionId !== undefined}>
					<ProgressionBar
						items={progressionItems()}
						onItemsChange={setLocalProgressionItems}
						progressionId={project()!.activeProgressionId!}
						projectKey={projectKey()}
						projectScale={projectScale()}
						projectRootOctave={projectRootOctave()}
						playheadTicks={isPlaying() ? playheadTicks() : null}
						onDownloadProgressionMidi={downloadProgressionMidi}
						onDownloadPerformanceMidi={downloadPerformanceMidi}
						isProgressionMidiDisabled={progressionItems().length === 0}
						isPerformanceMidiDisabled={progressionItems().length === 0 || signals().length === 0}
					/>
				</Show>
			</div>
		</div>
	)
}
