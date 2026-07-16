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
import type { PatternLoopModeT, PatternSignalT, ProgressionItemT, ScaleTypeT } from '@amore/music/types'
import { generatePlaybackNotes, beatsToSeconds, getProgressionLengthTicks, getItemStartTicks } from '@amore/music/playback'
import {
	scheduleNote,
	stopScheduledPlayback,
	getCurrentAudioTime,
	preloadInstrument,
	stopAllPreviews
} from '@amore/music/audio'
import { beatsToTicks, ticksToBeats } from '@amore/music/timing'
import { downloadMidiFile, generateProgressionChordMidiNotes, sanitizeMidiFileName } from '@amore/music/midi'

const KEY_OPTIONS = CHROMATIC_NOTES.map((note) => ({ value: note, label: note }))
const formatScaleLabel = (scale: string): string => {
	const spaced = scale.replace(/([a-z])([A-Z])/g, '$1 $2')
	return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}
const SCALE_OPTIONS = SCALE_TYPES.map((scale) => ({
	value: scale,
	label: formatScaleLabel(scale)
}))

type ProjectFieldsT = { key: string; scale: string; bpm: number; rootOctaveOverrides: Record<string, number> }
type PatternFieldsT = { durationTicks: number; gridTicks: number; loopMode: PatternLoopModeT }

export const ProjectView = () => {
	const params = useParams()
	const navigate = useNavigate()
	const [isPatternMode, setIsPatternMode] = createSignal(false)
	const [isPlaying, setIsPlaying] = createSignal(false)
	const [playheadTicks, setPlayheadTicks] = createSignal(0)
	const [patternPlayheadTicks, setPatternPlayheadTicks] = createSignal(0)

	// --- local edit state (source of truth for the UI) + last-saved baselines
	//     (diffed against on save). Nothing here reaches Convex until saveAll(). ---
	const [localProgressionItems, setLocalProgressionItems] = createSignal<ProgressionItemT[]>([])
	const [hydratedProgressionId, setHydratedProgressionId] = createSignal<string | null>(null)
	let savedProgressionItems: ProgressionItemT[] = []

	const [localKey, setLocalKey] = createSignal('C')
	const [localScale, setLocalScale] = createSignal<ScaleTypeT>('major')
	const [localBpm, setLocalBpm] = createSignal(120)
	const [localRootOctaveOverrides, setLocalRootOctaveOverrides] = createSignal<Record<string, number>>({})
	const [hydratedProjectFieldsId, setHydratedProjectFieldsId] = createSignal<string | null>(null)
	let savedProjectFields: ProjectFieldsT | null = null

	const [localPatternDurationTicks, setLocalPatternDurationTicks] = createSignal(1920)
	const [localGridTicks, setLocalGridTicks] = createSignal(120)
	const [localLoopMode, setLocalLoopMode] = createSignal<PatternLoopModeT>('loopAcrossProgression')
	const [localSignals, setLocalSignals] = createSignal<PatternSignalT[]>([])
	const [hydratedPatternId, setHydratedPatternId] = createSignal<string | null>(null)
	let savedPatternFields: PatternFieldsT | null = null
	let patternFlush: (() => Promise<void>) | undefined

	const [isDirty, setIsDirty] = createSignal(false)
	const [isSaving, setIsSaving] = createSignal(false)
	const markDirty = (): void => {
		setIsDirty(true)
	}

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

	const projectKey = () => localKey()
	const projectScale = () => localScale()
	const projectBpm = () => localBpm()
	const projectRootOctave = () => project()?.rootOctave ?? 4
	const patternLoopMode = () => localLoopMode()
	const progressionItems = () => localProgressionItems()
	const signals = () => localSignals()

	createEffect(() => {
		if (project() !== undefined) preloadInstrument()
	})

	createEffect(() => {
		const activeProgressionId = project()?.activeProgressionId
		const progressionData = progression()
		if (activeProgressionId === undefined || progressionData === undefined) return
		if (hydratedProgressionId() === activeProgressionId) return
		const items = progressionData.items ?? []
		setLocalProgressionItems(items)
		savedProgressionItems = items.map((item) => ({ ...item }))
		setHydratedProgressionId(activeProgressionId)
	})

	createEffect(() => {
		const projectData = project()
		if (projectData === undefined) return
		if (hydratedProjectFieldsId() === projectData._id) return
		const rootOctaveOverrides = projectData.rootOctaveOverrides ?? {}
		setLocalKey(projectData.key)
		setLocalScale(projectData.scale as ScaleTypeT)
		setLocalBpm(projectData.bpm)
		setLocalRootOctaveOverrides(rootOctaveOverrides)
		savedProjectFields = { key: projectData.key, scale: projectData.scale, bpm: projectData.bpm, rootOctaveOverrides: { ...rootOctaveOverrides } }
		setHydratedProjectFieldsId(projectData._id)
	})

	createEffect(() => {
		const activePatternId = project()?.activePatternId
		const patternData = pattern()
		if (activePatternId === undefined || patternData === undefined) return
		if (hydratedPatternId() === activePatternId) return
		const patternSignals = patternData.signals ?? []
		setLocalPatternDurationTicks(patternData.durationTicks)
		setLocalGridTicks(patternData.gridTicks)
		setLocalLoopMode(patternData.loopMode as PatternLoopModeT)
		setLocalSignals(patternSignals)
		savedPatternFields = {
			durationTicks: patternData.durationTicks,
			gridTicks: patternData.gridTicks,
			loopMode: patternData.loopMode as PatternLoopModeT
		}
		setHydratedPatternId(activePatternId)
	})

	const handleRootOctaveOverrideChange = (degree: number, value: number): void => {
		const key = String(degree)
		const next = { ...localRootOctaveOverrides() }
		if (value === 0) delete next[key]
		else next[key] = value
		setLocalRootOctaveOverrides(next)
		markDirty()
	}

	const handleKeySelectChange = (event: any) => {
		setLocalKey(event.detail.value)
		markDirty()
	}

	const handleScaleSelectChange = (event: any) => {
		setLocalScale(event.detail.value)
		markDirty()
	}

	const handleBpmChange = (event: Event) => {
		const bpmValue = parseInt((event.currentTarget as HTMLInputElement).value, 10)
		const isInRange = bpmValue >= 20 && bpmValue <= 300
		if (isNaN(bpmValue) || !isInRange) return
		setLocalBpm(bpmValue)
		markDirty()
	}

	const handleProgressionItemsChange = (items: ProgressionItemT[]): void => {
		setLocalProgressionItems(items)
		markDirty()
	}

	const handlePatternSignalsChange = (list: PatternSignalT[]): void => {
		setLocalSignals(list)
		markDirty()
	}

	const handlePatternFieldsChange = (patch: Partial<PatternFieldsT>): void => {
		if (patch.durationTicks !== undefined) setLocalPatternDurationTicks(patch.durationTicks)
		if (patch.gridTicks !== undefined) setLocalGridTicks(patch.gridTicks)
		if (patch.loopMode !== undefined) setLocalLoopMode(patch.loopMode)
		markDirty()
	}

	const handlePatternReady = (flush: (() => Promise<void>) | undefined): void => {
		patternFlush = flush
	}

	// --- diff localProgressionItems() against the last-saved snapshot into the
	//     minimal add / remove / update / reorder calls. Only new items are ever
	//     'chord' (there's no UI path that creates 'rest' items). ---
	const flushProgression = async (progressionId: string): Promise<void> => {
		const local = localProgressionItems()
		const savedById = new Map(savedProgressionItems.map((item) => [item._id, item]))
		const localIds = new Set(local.map((item) => item._id))

		const removed = savedProgressionItems.filter((item) => !localIds.has(item._id))
		const added = local.filter((item) => !savedById.has(item._id))
		const kept = local.filter((item) => savedById.has(item._id))

		await Promise.all([
			...removed.map((item) =>
				convexClient.mutation(api.progression.removeItem, { progressionId: progressionId as any, itemId: item._id })
			),
			...added.map((item) => {
				if (item.type !== 'chord') {
					console.error('[amore] skipping unsupported new progression item type', item.type)
					return Promise.resolve()
				}
				return convexClient.mutation(api.progression.addItem, {
					progressionId: progressionId as any,
					clientItemId: item._id,
					root: item.root,
					qualityId: item.qualityId,
					durationTicks: item.durationTicks,
					inversion: item.inversion,
					octaveOffset: item.octaveOffset,
					voicing: item.voicing,
					velocityMin: item.velocityMin,
					velocityMax: item.velocityMax,
					insertIndex: item.order
				})
			}),
			...kept.map(async (item) => {
				const before = savedById.get(item._id)!
				if (item.durationTicks !== before.durationTicks) {
					await convexClient.mutation(api.progression.updateDuration, {
						progressionId: progressionId as any,
						itemId: item._id,
						durationTicks: item.durationTicks
					})
				}
				if (item.type !== 'chord' || before.type !== 'chord') return
				const patch: Record<string, unknown> = {}
				if (item.inversion !== before.inversion) patch.inversion = item.inversion
				if (item.octaveOffset !== before.octaveOffset) patch.octaveOffset = item.octaveOffset
				if (item.voicing !== before.voicing) patch.voicing = item.voicing
				if (item.velocityMin !== before.velocityMin) patch.velocityMin = item.velocityMin
				if (item.velocityMax !== before.velocityMax) patch.velocityMax = item.velocityMax
				if (item.isEnabled !== before.isEnabled) patch.isEnabled = item.isEnabled
				if (Object.keys(patch).length === 0) return
				await convexClient.mutation(api.progression.updateChordModifiers, {
					progressionId: progressionId as any,
					itemId: item._id,
					...patch
				})
			})
		])

		// Cheap correctness safeguard: always finish with the full final order
		// instead of trusting insertIndex bookkeeping across multiple adds/removes.
		if (local.length > 0) {
			await convexClient.mutation(api.progression.reorderItems, {
				progressionId: progressionId as any,
				orderedIds: local.map((item) => item._id)
			})
		}
	}

	const saveAll = async (): Promise<void> => {
		if (isSaving() || !isDirty()) return
		const projectData = project()
		if (projectData === undefined) return
		setIsSaving(true)
		try {
			const tasks: Promise<unknown>[] = []

			if (savedProjectFields !== null) {
				const patch: Record<string, unknown> = {}
				if (localKey() !== savedProjectFields.key) patch.key = localKey()
				if (localScale() !== savedProjectFields.scale) patch.scale = localScale()
				if (localBpm() !== savedProjectFields.bpm) patch.bpm = localBpm()
				if (JSON.stringify(localRootOctaveOverrides()) !== JSON.stringify(savedProjectFields.rootOctaveOverrides)) {
					patch.rootOctaveOverrides = localRootOctaveOverrides()
				}
				if (Object.keys(patch).length > 0) {
					tasks.push(convexClient.mutation(api.projects.update, { id: projectId(), ...patch }))
				}
			}

			if (projectData.activeProgressionId !== undefined) {
				tasks.push(flushProgression(projectData.activeProgressionId))
			}

			if (savedPatternFields !== null && projectData.activePatternId !== undefined) {
				const patch: Record<string, unknown> = {}
				if (localPatternDurationTicks() !== savedPatternFields.durationTicks) patch.durationTicks = localPatternDurationTicks()
				if (localGridTicks() !== savedPatternFields.gridTicks) patch.gridTicks = localGridTicks()
				if (localLoopMode() !== savedPatternFields.loopMode) patch.loopMode = localLoopMode()
				if (Object.keys(patch).length > 0) {
					tasks.push(convexClient.mutation(api.patterns.update, { id: projectData.activePatternId, ...patch }))
				}
			}

			if (patternFlush !== undefined) tasks.push(patternFlush())

			await Promise.all(tasks)

			savedProjectFields = {
				key: localKey(),
				scale: localScale(),
				bpm: localBpm(),
				rootOctaveOverrides: { ...localRootOctaveOverrides() }
			}
			savedProgressionItems = localProgressionItems().map((item) => ({ ...item }))
			savedPatternFields = {
				durationTicks: localPatternDurationTicks(),
				gridTicks: localGridTicks(),
				loopMode: localLoopMode()
			}
			setIsDirty(false)
		} catch (error) {
			console.error('[amore] failed to save project', error)
		} finally {
			setIsSaving(false)
		}
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
		setPatternPlayheadTicks(
			getPatternCursorTicks(elapsedTicks, progressionData, playbackPatternLengthTicks, playbackLoopMode)
		)

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
			localPatternDurationTicks(),
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
		playbackPatternLengthTicks = localPatternDurationTicks()
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
		if (pattern() === undefined) return
		const notes = generatePlaybackNotes(
			signals(),
			progressionItems(),
			localPatternDurationTicks(),
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
			patternDurationTicks: localPatternDurationTicks(),
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

	const handleSaveShortcut = (event: KeyboardEvent) => {
		const key = event.key.toLowerCase()
		if (key !== 's' || !(event.ctrlKey || event.metaKey)) return
		event.preventDefault()
		void saveAll()
	}

	const handleBeforeUnload = (event: BeforeUnloadEvent) => {
		if (!isDirty()) return
		event.preventDefault()
		event.returnValue = ''
	}

	createEffect(() => {
		document.addEventListener('keydown', handleSpacebar)
		document.addEventListener('keydown', handleSaveShortcut)
		window.addEventListener('beforeunload', handleBeforeUnload)
		onCleanup(() => {
			document.removeEventListener('keydown', handleSpacebar)
			document.removeEventListener('keydown', handleSaveShortcut)
			window.removeEventListener('beforeunload', handleBeforeUnload)
			stopCursor()
			stopScheduledPlayback()
			if (stopTimer !== null) clearTimeout(stopTimer)
		})
	})

	return (
		<z-column class="projectPage">
			<z-row class="projectTopBar">
				<button type="button" class="projectBack" onClick={() => navigate('/')}>
					← Home
				</button>

				<span class="projectTopBarTitle">
					<Show when={project()} fallback="Loading…">
						{project()!.name}
					</Show>
				</span>

				<div class="projectTopBarControls">
					<div class="projectSelectGroup">
						<span class="projectSelectLabel">Key</span>
						<z-select options={KEY_OPTIONS} value={projectKey()} size="small" isInline on:change={handleKeySelectChange} />
					</div>

					<div class="projectSelectGroup">
						<span class="projectSelectLabel">Scale</span>
						<z-select
							options={SCALE_OPTIONS}
							value={projectScale()}
							size="small"
							isInline
							on:change={handleScaleSelectChange}
						/>
					</div>

					<div class="projectSelectGroup">
						<span class="projectSelectLabel">BPM</span>
						<input
							type="number"
							value={projectBpm()}
							min="20"
							max="300"
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

					<z-button size="small" kind={isPatternMode() ? 'solid' : 'outline'} onClick={() => setIsPatternMode((v) => !v)}>
						{isPatternMode() ? '← Chords' : 'Pattern →'}
					</z-button>

					<z-button
						size="small"
						kind={isPlaying() ? 'soft' : 'ghost'}
						tone={isPlaying() ? 'primary' : 'neutral'}
						onClick={() => (isPlaying() ? stopPlayback() : startPlayback())}
					>
						{isPlaying() ? '■ Stop' : '▶ Play'}
					</z-button>

					<Show when={isDirty()}>
						<span class="projectUnsavedIndicator" title="Unsaved changes">
							Unsaved changes
						</span>
					</Show>

					<z-button
						size="small"
						kind="solid"
						tone="primary"
						isDisabled={!isDirty() || isSaving()}
						onClick={() => void saveAll()}
					>
						{isSaving() ? 'Saving…' : 'Save'}
					</z-button>
				</div>
			</z-row>

			<z-column class="projectMain">
				<z-column class="projectContent">
					<Show when={!isPatternMode()}>
						<Show when={project()?.activeProgressionId !== undefined}>
							<ChordGrid
								diatonicChords={getDiatonicChords(projectKey(), projectScale())}
								projectRootOctave={projectRootOctave()}
								projectKey={projectKey()}
								projectScale={projectScale()}
								rootOctaveOverrides={localRootOctaveOverrides()}
								onRootOctaveOverrideChange={handleRootOctaveOverrideChange}
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
									patternLengthTicks={localPatternDurationTicks()}
									gridTicks={localGridTicks()}
									loopMode={patternLoopMode()}
									signals={signals()}
									playheadTicks={isPlaying() ? patternPlayheadTicks() : null}
									onSignalsChange={handlePatternSignalsChange}
									onFieldsChange={handlePatternFieldsChange}
									onReady={handlePatternReady}
								/>
							)}
						</Show>
					</Show>
				</z-column>

				<Show when={project()?.activeProgressionId !== undefined}>
					<ProgressionBar
						items={progressionItems()}
						onItemsChange={handleProgressionItemsChange}
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
			</z-column>
		</z-column>
	)
}
