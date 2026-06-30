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
import type { ScaleTypeT } from '@amore/music/types'
import { generatePlaybackNotes, beatsToSeconds } from '@amore/music/playback'
import { scheduleNote, stopScheduledPlayback, getCurrentAudioTime } from '@amore/music/audio'

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
	let stopTimer: ReturnType<typeof setTimeout> | null = null

	const projectId = () => params.id as any

	const projectQuery = createQuery(api.amoreProjects.get, () => (getIsAuthenticated() ? { id: projectId() } : QUERY_SKIP))
	const project = projectQuery

	const chordsQuery = createQuery(api.amoreProgression.list, () =>
		getIsAuthenticated() ? { projectId: projectId() } : QUERY_SKIP
	)
	const chords = chordsQuery

	const signalsQuery = createQuery(api.amoreSignals.list, () =>
		getIsAuthenticated() ? { projectId: projectId() } : QUERY_SKIP
	)
	const signals = signalsQuery

	const projectKey = () => project()?.key ?? 'C'
	const projectScale = () => (project()?.scale ?? 'major') as ScaleTypeT
	const projectBpm = () => project()?.bpm ?? 120

	const handleKeySelectChange = (event: any) => {
		void convexClient.mutation(api.amoreProjects.update, { id: projectId(), key: event.detail.value })
	}

	const handleScaleSelectChange = (event: any) => {
		void convexClient.mutation(api.amoreProjects.update, { id: projectId(), scale: event.detail.value })
	}

	const handleBpmChange = (event: Event) => {
		const bpmValue = parseInt((event.currentTarget as HTMLInputElement).value, 10)
		const isInRange = bpmValue >= 20 && bpmValue <= 300
		if (isNaN(bpmValue) || !isInRange) return
		void convexClient.mutation(api.amoreProjects.update, { id: projectId(), bpm: bpmValue })
	}

	const startPlayback = () => {
		const projectData = project()
		const chordData = chords() ?? []
		const signalData = signals() ?? []
		if (!projectData || chordData.length === 0) return
		if (signalData.length === 0) return

		const notes = generatePlaybackNotes(signalData, chordData, projectData.patternLengthBeats)
		const startTime = getCurrentAudioTime() + 0.05
		for (const note of notes) {
			const noteStart = startTime + beatsToSeconds(note.startBeat, projectData.bpm)
			const noteDuration = beatsToSeconds(note.durationBeats, projectData.bpm)
			scheduleNote(noteStart, noteDuration, note.midiNote, note.velocity)
		}

		const totalBeats = chordData.reduce((sum, c) => sum + c.durationBeats, 0)
		const totalSeconds = beatsToSeconds(totalBeats, projectData.bpm)
		setIsPlaying(true)
		stopTimer = setTimeout(() => setIsPlaying(false), (totalSeconds + 0.5) * 1000)
	}

	const stopPlayback = () => {
		stopScheduledPlayback()
		if (stopTimer !== null) {
			clearTimeout(stopTimer)
			stopTimer = null
		}
		setIsPlaying(false)
	}

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
						<ChordGrid diatonicChords={getDiatonicChords(projectKey(), projectScale())} projectId={projectId()} />
					</Show>

					<Show when={isPatternMode()}>
						<PatternEditor
							projectId={projectId()}
							patternLengthBeats={project()?.patternLengthBeats ?? 4}
							signals={signals() ?? []}
						/>
					</Show>
				</div>

				<ProgressionBar chords={chords() ?? []} projectId={projectId()} />
			</div>
		</div>
	)
}
