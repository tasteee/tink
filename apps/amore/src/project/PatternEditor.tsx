import { createEffect, onCleanup, onMount, untrack } from 'solid-js'
import { convexClient } from '@amore/convex/client'
import { api } from '@convex/_generated/api'
import { beatsToTicks, ticksToBeats } from '@amore/music/timing'
import type { PatternLoopModeT, PatternSignalT } from '@amore/music/types'
import { createPatternSync, type AddCoreT, type SignalShapeT } from './patternSync'

/*
 * PatternEditor — a thin wrapper over the <z-pattern-roll> zest element.
 *
 * The element owns all editing (draw / move / resize / marquee / duplicate /
 * collision trim+split / octave·velocity·probability·enabled) and emits the full
 * signal list on every mutation via its `change` event. This wrapper only:
 *   1. seeds the element once per pattern from the Convex snapshot, and
 *   2. hands each `change` to patternSync, which diffs it into granular
 *      addSignal / updateSignal / removeSignal mutations.
 *
 * The element is authoritative while mounted, so we never re-feed it from the
 * live subscription (that would reset selection mid-edit) — we only re-seed when
 * the pattern id changes. Pattern-level props the element doesn't model (length,
 * loop mode, playhead) are driven from Convex; the element's snap choice is
 * persisted back to the pattern's gridTicks.
 */

type PatternEditorPropsT = {
	patternId: string
	patternLengthTicks: number
	gridTicks: number
	loopMode: PatternLoopModeT
	signals: PatternSignalT[]
	playheadTicks?: number | null
}

const TONE_ROWS = 8
const DEFAULT_VELOCITY = 100

const PATTERN_LENGTH_OPTIONS = [1, 2, 4, 8, 16].map((beats) => ({
	value: String(beatsToTicks(beats)),
	label: `${beats} beat${beats === 1 ? '' : 's'}`
}))
const LOOP_MODE_OPTIONS: { value: PatternLoopModeT; label: string }[] = [
	{ value: 'loopAcrossProgression', label: 'Loop' },
	{ value: 'restartOnChord', label: 'Restart' }
]

export const PatternEditor = (props: PatternEditorPropsT) => {
	let rollRef: any
	let seededId: string | undefined

	const sync = createPatternSync({
		add: (core: AddCoreT) =>
			convexClient.mutation(api.patterns.addSignal, { patternId: props.patternId as any, ...core }).then(String),
		update: (id: string, patch: Partial<SignalShapeT>) => {
			void convexClient
				.mutation(api.patterns.updateSignal, { patternId: props.patternId as any, id, ...patch })
				.catch((error) => console.error('[amore] failed to update signal', error))
		},
		remove: (id: string) => {
			void convexClient
				.mutation(api.patterns.removeSignal, { patternId: props.patternId as any, id })
				.catch((error) => console.error('[amore] failed to remove signal', error))
		}
	})

	// --- seed the element once per pattern (property set = no `change` echo) ---
	createEffect(() => {
		const pid = props.patternId
		if (pid === seededId) return
		seededId = pid
		const elementSignals = sync.seed(untrack(() => props.signals))
		if (rollRef !== undefined) {
			rollRef.snap = ticksToBeats(props.gridTicks)
			rollRef.signals = elementSignals
		}
	})

	// --- drive pattern-level props the element doesn't model ---
	createEffect(() => {
		if (rollRef !== undefined) rollRef.length = ticksToBeats(props.patternLengthTicks)
	})
	createEffect(() => {
		if (rollRef === undefined) return
		const ticks = props.playheadTicks
		rollRef.playhead = ticks === null || ticks === undefined ? undefined : ticksToBeats(ticks)
	})

	const handleChange = (event: Event): void => {
		sync.applyChange((event as CustomEvent<{ signals: any[] }>).detail.signals)
	}

	// --- persist the element's snap choice back to the pattern's gridTicks ---
	onMount(() => {
		if (rollRef === undefined) return
		const observer = new MutationObserver(() => {
			const snapBeats = Number(rollRef.getAttribute('snap'))
			if (!Number.isFinite(snapBeats) || snapBeats <= 0) return
			const gridTicks = beatsToTicks(snapBeats)
			if (gridTicks !== props.gridTicks) {
				void convexClient
					.mutation(api.patterns.update, { id: props.patternId as any, gridTicks })
					.catch((error) => console.error('[amore] failed to update grid', error))
			}
		})
		observer.observe(rollRef, { attributes: true, attributeFilter: ['snap'] })
		onCleanup(() => observer.disconnect())
	})

	const handlePatternLengthChange = (event: Event): void => {
		const value = Number((event as CustomEvent<{ value: string }>).detail.value)
		if (!Number.isFinite(value)) return
		void convexClient
			.mutation(api.patterns.update, { id: props.patternId as any, durationTicks: value })
			.catch((error) => console.error('[amore] failed to update pattern length', error))
	}

	const handleLoopModeChange = (event: Event): void => {
		const value = (event as CustomEvent<{ value: PatternLoopModeT }>).detail.value
		void convexClient
			.mutation(api.patterns.update, { id: props.patternId as any, loopMode: value })
			.catch((error) => console.error('[amore] failed to update loop mode', error))
	}

	return (
		<z-column class="signalEditor">
			<z-row class="signalEditorControls">
				<z-row class="signalEditorControlGroup">
					<span class="signalEditorControlLabel">Length</span>
					<z-select
						options={PATTERN_LENGTH_OPTIONS}
						value={String(props.patternLengthTicks)}
						size="small"
						isInline
						on:change={handlePatternLengthChange}
					/>
				</z-row>
				<z-row class="signalEditorControlGroup">
					<span class="signalEditorControlLabel">Mode</span>
					<z-select
						options={LOOP_MODE_OPTIONS}
						value={props.loopMode}
						size="small"
						isInline
						on:change={handleLoopModeChange}
					/>
				</z-row>
				<span class="signalEditorMeta">
					{props.signals.length} signal{props.signals.length === 1 ? '' : 's'}
				</span>
			</z-row>

			<z-pattern-roll
				ref={rollRef}
				tones={TONE_ROWS}
				default-velocity={DEFAULT_VELOCITY}
				beats-per-bar={4}
				style={{ flex: '1', 'min-height': '240px' }}
				on:change={handleChange}
			/>
		</z-column>
	)
}
