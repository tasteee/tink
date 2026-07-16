import { createSignal, For, Show } from 'solid-js'
import {
	CHORD_GRID_SECTIONS,
	CHORD_QUALITIES,
	CHROMATIC_NOTES,
	doesChordFitScale,
	expandChord,
	getChordQualityLabel,
	getChordQualityName,
	getScalePitchClasses,
	noteToMidi
} from '@amore/music/theory'
import { startPreview, stopPreview } from '@amore/music/audio'
import { beatsToTicks } from '@amore/music/timing'
import type { ChordVoicingT, DiatonicChordT, ScaleTypeT } from '@amore/music/types'
import { ChordCard, type ChordSnapshotT } from './ChordCard'

type ChordGridPropsT = {
	diatonicChords: DiatonicChordT[]
	projectRootOctave: number
	projectKey: string
	projectScale: ScaleTypeT
	rootOctaveOverrides: Record<string, number>
	onRootOctaveOverrideChange: (degree: number, value: number) => void
}

type GridChordT = {
	id: string
	chord: DiatonicChordT
	qualityId: string
}

type ChordModifierStateT = {
	inversion: number
	voicing: ChordVoicingT
	octaveOffset: number
	velocityMin: number
	velocityMax: number
}

type ChordModifierMapT = Record<string, ChordModifierStateT>

type MenuItemT = {
	value?: string
	label?: string
	shortcut?: string
	isDisabled?: boolean
	isSeparator?: boolean
	isDanger?: boolean
}

const DEFAULT_DURATION_BEATS = 2
const DEFAULT_INVERSION = 0
const DEFAULT_VOICING: ChordVoicingT = 'closed'
const DEFAULT_OCTAVE_OFFSET = 0
const DEFAULT_VELOCITY_MIN = 72
const DEFAULT_VELOCITY_MAX = 112
const VOICING_OPTIONS: ChordVoicingT[] = ['closed', 'open', 'drop2', 'spread']
const VOICING_LABELS: Record<ChordVoicingT, string> = {
	closed: 'Closed',
	open: 'Open',
	drop2: 'Drop 2',
	spread: 'Spread'
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))

const buildChordLabel = (chord: DiatonicChordT, qualityId: string): string => {
	return `${chord.root}${getChordQualityLabel(qualityId)}`
}

const buildSelectionId = (chord: DiatonicChordT, qualityId: string): string => `${chord.degree}-${qualityId}`

type ViewModeT = 'sections' | 'keybird'

const ALL_QUALITY_IDS = Object.keys(CHORD_QUALITIES)

export const ChordGrid = (props: ChordGridPropsT) => {
	const [modifierBySelectionId, setModifierBySelectionId] = createSignal<ChordModifierMapT>({})
	const [viewMode, setViewMode] = createSignal<ViewModeT>('sections')

	const scalePitchClasses = () => getScalePitchClasses(props.projectKey, props.projectScale)

	const rootOverrideForDegree = (degree: number): number => props.rootOctaveOverrides[String(degree)] ?? 0
	const isRootOverridden = (degree: number): boolean => rootOverrideForDegree(degree) !== 0

	const rootPreviewId = (degree: number): string => `grid-root-${degree}`

	const previewRootStart = (chord: DiatonicChordT): void => {
		const midiNote = noteToMidi(chord.root, props.projectRootOctave + rootOverrideForDegree(chord.degree))
		startPreview(rootPreviewId(chord.degree), [midiNote])
	}

	const previewRootStop = (chord: DiatonicChordT): void => {
		stopPreview(rootPreviewId(chord.degree))
	}

	const fitsScale = (chord: DiatonicChordT, qualityId: string): boolean => {
		const quality = CHORD_QUALITIES[qualityId]
		if (quality === undefined) return false
		return doesChordFitScale(chord.root, quality.intervals, scalePitchClasses())
	}

	// Keybird's chord browser (src/components/ChordBrowser.tsx +
	// $chords.scaleChords in the keybird repo) shows every chord that fits the
	// current key+scale as one flat grid sorted by chromatic root then symbol,
	// with no category grouping. This mirrors that layout as an alternative to
	// Amore's own category-sectioned grid.
	const flatFittingChords = (): GridChordT[] => {
		const items: GridChordT[] = []
		for (const chord of props.diatonicChords) {
			for (const qualityId of ALL_QUALITY_IDS) {
				if (!fitsScale(chord, qualityId)) continue
				items.push({ id: buildSelectionId(chord, qualityId), chord, qualityId })
			}
		}
		return items.sort((a, b) => {
			const rootDiff = CHROMATIC_NOTES.indexOf(a.chord.root as never) - CHROMATIC_NOTES.indexOf(b.chord.root as never)
			if (rootDiff !== 0) return rootDiff
			return getChordQualityLabel(a.qualityId).localeCompare(getChordQualityLabel(b.qualityId))
		})
	}

	const defaultModifiers = (): ChordModifierStateT => ({
		inversion: DEFAULT_INVERSION,
		voicing: DEFAULT_VOICING,
		octaveOffset: DEFAULT_OCTAVE_OFFSET,
		velocityMin: DEFAULT_VELOCITY_MIN,
		velocityMax: DEFAULT_VELOCITY_MAX
	})

	const modifiersForSelection = (selection: GridChordT): ChordModifierStateT => {
		return modifierBySelectionId()[selection.id] ?? defaultModifiers()
	}

	const saveModifiersForSelection = (selection: GridChordT, modifiers: ChordModifierStateT): void => {
		setModifierBySelectionId((value) => ({ ...value, [selection.id]: modifiers }))
	}

	const hasModifiers = (modifiers: ChordModifierStateT): boolean => {
		return (
			modifiers.inversion !== DEFAULT_INVERSION ||
			modifiers.voicing !== DEFAULT_VOICING ||
			modifiers.octaveOffset !== DEFAULT_OCTAVE_OFFSET ||
			modifiers.velocityMin !== DEFAULT_VELOCITY_MIN ||
			modifiers.velocityMax !== DEFAULT_VELOCITY_MAX
		)
	}

	const effectiveOctaveOffset = (selection: GridChordT, modifiers: ChordModifierStateT): number =>
		rootOverrideForDegree(selection.chord.degree) + modifiers.octaveOffset

	const previewNotes = (selection: GridChordT, modifiers: ChordModifierStateT): number[] => {
		return expandChord(
			selection.chord.root,
			selection.qualityId,
			modifiers.inversion,
			props.projectRootOctave + effectiveOctaveOffset(selection, modifiers),
			modifiers.voicing
		)
	}

	const previewSelection = (selection: GridChordT, modifiers: ChordModifierStateT): void => {
		const velocity = Math.round((modifiers.velocityMin + modifiers.velocityMax) / 2)
		startPreview(`grid-${selection.id}`, previewNotes(selection, modifiers), velocity)
	}

	const stopGridPreview = (selection: GridChordT): void => {
		stopPreview(`grid-${selection.id}`)
	}

	const chordSnapshot = (selection: GridChordT, modifiers: ChordModifierStateT): ChordSnapshotT => ({
		kind: 'chord',
		source: 'grid',
		label: buildChordLabel(selection.chord, selection.qualityId),
		root: { kind: 'scaleDegree', degree: selection.chord.degree },
		rootName: selection.chord.root,
		romanNumeral: selection.chord.romanNumeral,
		qualityId: selection.qualityId,
		notes: previewNotes(selection, modifiers),
		durationTicks: beatsToTicks(DEFAULT_DURATION_BEATS),
		inversion: modifiers.inversion,
		// Bakes in the root-row override so the placed progression item is a
		// fixed snapshot; later edits to the root row don't reach back into it.
		octaveOffset: effectiveOctaveOffset(selection, modifiers),
		voicing: modifiers.voicing,
		velocityMode: 'absolute',
		velocityMin: modifiers.velocityMin,
		velocityMax: modifiers.velocityMax
	})

	const updateGridModifiers = (selection: GridChordT, modifiers: ChordModifierStateT): void => {
		saveModifiersForSelection(selection, modifiers)
	}

	const gridMenuItems = (selection: GridChordT): MenuItemT[] => {
		const modifiers = modifiersForSelection(selection)
		return [
			{ value: 'preview', label: 'Preview' },
			{ value: 'reset', label: 'Reset modifiers', isDisabled: !hasModifiers(modifiers) }
		]
	}

	const handleGridMenuSelect = async (event: Event, selection: GridChordT): Promise<void> => {
		const value = (event as CustomEvent<{ value: string }>).detail.value
		const modifiers = modifiersForSelection(selection)

		if (value === 'preview') {
			previewSelection(selection, modifiers)
			return
		}
		if (value === 'reset') {
			updateGridModifiers(selection, defaultModifiers())
			return
		}
	}

	const rootMenuItems = (degree: number): MenuItemT[] => [
		{ value: 'reset', label: 'Reset octave', isDisabled: !isRootOverridden(degree) }
	]

	const handleRootMenuSelect = (event: Event, degree: number): void => {
		const value = (event as CustomEvent<{ value: string }>).detail.value
		if (value === 'reset') props.onRootOctaveOverrideChange(degree, 0)
	}

	const handleStepperInput = (value: string, fallback: number, min: number, max: number): number => {
		const numericValue = Number(value)
		if (!Number.isFinite(numericValue)) return fallback
		return clamp(Math.round(numericValue), min, max)
	}

	const renderModifierStepper = (
		label: string,
		value: number,
		min: number,
		max: number,
		onChange: (value: number) => void
	) => (
		<z-column class="modifierMenuField">
			<span class="modifierMenuLabel">{label}</span>
			<z-row class="modifierStepper">
				<z-button size="small" kind="outline" tone="neutral" on:click={() => onChange(clamp(value - 1, min, max))}>
					-
				</z-button>
				<z-input
					type="number"
					size="small"
					value={String(value)}
					on:change={(event: Event) =>
						onChange(handleStepperInput((event as CustomEvent<{ value: string }>).detail.value, value, min, max))
					}
				/>
				<z-button size="small" kind="outline" tone="neutral" on:click={() => onChange(clamp(value + 1, min, max))}>
					+
				</z-button>
			</z-row>
		</z-column>
	)

	const renderGridModifierControls = (selection: GridChordT) => {
		const modifiers = () => modifiersForSelection(selection)
		const updateModifiers = (patch: Partial<ChordModifierStateT>) =>
			updateGridModifiers(selection, { ...modifiers(), ...patch })
		const rangeKey = () => `${modifiers().velocityMin}-${modifiers().velocityMax}`

		return (
			<z-column
				slot="controls"
				class="modifierMenuControls"
				onMouseDown={(event) => event.stopPropagation()}
				onClick={(event) => event.stopPropagation()}
				onContextMenu={(event) => event.preventDefault()}
			>
				<z-column class="modifierMenuField">
					<span class="modifierMenuLabel">Voicing</span>
					<z-select
						options={VOICING_OPTIONS.map((option) => ({ value: option, label: VOICING_LABELS[option] }))}
						value={modifiers().voicing}
						size="small"
						on:change={(event: Event) =>
							updateModifiers({ voicing: (event as CustomEvent<{ value: ChordVoicingT }>).detail.value })
						}
					/>
				</z-column>

				<Show keyed when={rangeKey()}>
					<z-range
						min={1}
						max={127}
						step={1}
						label="Velocity"
						showValue
						on:input={(event: Event) => {
							const detail = (event as CustomEvent<{ left: number; right: number }>).detail
							updateModifiers({ velocityMin: detail.left, velocityMax: detail.right })
						}}
					>
						<z-range-handle value={modifiers().velocityMin} />
						<z-range-handle value={modifiers().velocityMax} />
					</z-range>
				</Show>

				{renderModifierStepper('Inversion', modifiers().inversion, 0, 8, (value) => updateModifiers({ inversion: value }))}
				{renderModifierStepper('Octave', modifiers().octaveOffset, -3, 3, (value) =>
					updateModifiers({ octaveOffset: value })
				)}
			</z-column>
		)
	}

	const renderRootModifierControls = (degree: number) => (
		<z-column
			slot="controls"
			class="modifierMenuControls"
			onMouseDown={(event) => event.stopPropagation()}
			onClick={(event) => event.stopPropagation()}
			onContextMenu={(event) => event.preventDefault()}
		>
			{renderModifierStepper('Octave', rootOverrideForDegree(degree), -3, 3, (value) =>
				props.onRootOctaveOverrideChange(degree, value)
			)}
		</z-column>
	)

	const renderRootTile = (chord: DiatonicChordT) => (
		<z-context-menu items={rootMenuItems(chord.degree)} on:select={(event: Event) => handleRootMenuSelect(event, chord.degree)}>
			{renderRootModifierControls(chord.degree)}
			<z-card
				isFlex
				isRow
				gap="2"
				class={`rootTile${isRootOverridden(chord.degree) ? ' hasModifiers' : ''}`}
				title="Click to hear the root note. Right-click to set a base octave for every chord with this root."
				onMouseDown={(event: MouseEvent) => {
					if (event.button !== 0) return
					previewRootStart(chord)
				}}
				onMouseUp={() => previewRootStop(chord)}
				onMouseLeave={() => previewRootStop(chord)}
			>
				<span class="chordTileNumeral">{chord.romanNumeral}</span>
				<span class="chordTileName">{chord.root}</span>
				<span class="chordTileModifierIndicator" title="Octave adjusted" />
			</z-card>
		</z-context-menu>
	)

	const renderChordTile = (chord: DiatonicChordT, qualityId: string) => {
		const tileId = buildSelectionId(chord, qualityId)
		const gridChord = { id: tileId, chord, qualityId }
		const snapshot = () => chordSnapshot(gridChord, modifiersForSelection(gridChord))
		const isModified = () => hasModifiers(modifiersForSelection(gridChord))

		return (
			<z-context-menu
				items={gridMenuItems(gridChord)}
				on:select={(event: Event) => void handleGridMenuSelect(event, gridChord)}
			>
				{renderGridModifierControls(gridChord)}
				<ChordCard
					snapshot={snapshot()}
					isModified={isModified()}
					title={`${getChordQualityName(qualityId)}. Right-click for modifiers.`}
					onPreviewStart={() => previewSelection(gridChord, modifiersForSelection(gridChord))}
					onPreviewEnd={() => stopGridPreview(gridChord)}
				/>
			</z-context-menu>
		)
	}

	return (
		<z-column class="chordGrid">
			<z-column class="chordGridSection chordGridRootSection">
				<span class="chordGridSectionLabel">Root notes</span>
				<z-row class="chordRow">
					<For each={props.diatonicChords}>{(chord) => renderRootTile(chord)}</For>
				</z-row>
			</z-column>

			<z-row class="chordGridFilterBar">
				<z-button
					size="small"
					kind={viewMode() === 'sections' ? 'solid' : 'outline'}
					tone={viewMode() === 'sections' ? 'primary' : 'neutral'}
					onClick={() => setViewMode('sections')}
				>
					Sections
				</z-button>
				<z-button
					size="small"
					kind={viewMode() === 'keybird' ? 'solid' : 'outline'}
					tone={viewMode() === 'keybird' ? 'primary' : 'neutral'}
					onClick={() => setViewMode('keybird')}
				>
					Keybird
				</z-button>
			</z-row>

			<Show when={viewMode() === 'sections'}>
				<For each={CHORD_GRID_SECTIONS}>
					{(section) => (
						<z-column class="chordGridSection">
							<span class="chordGridSectionLabel">{section.label}</span>
							<z-row class="chordRow">
								<For each={section.qualityIds}>
									{(qualityId) => (
										<For each={props.diatonicChords}>
											{(chord) => <Show when={fitsScale(chord, qualityId)}>{renderChordTile(chord, qualityId)}</Show>}
										</For>
									)}
								</For>
							</z-row>
						</z-column>
					)}
				</For>
			</Show>

			<Show when={viewMode() === 'keybird'}>
				<z-row class="chordRow">
					<For each={flatFittingChords()}>{(gridChord) => renderChordTile(gridChord.chord, gridChord.qualityId)}</For>
				</z-row>
			</Show>
		</z-column>
	)
}
