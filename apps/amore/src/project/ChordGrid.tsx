import { createSignal, For, Show } from 'solid-js'
import { CHORD_GRID_SECTIONS, expandChord, getChordQualityLabel, getChordQualityName } from '@amore/music/theory'
import { startPreview, stopPreview } from '@amore/music/audio'
import { beatsToTicks } from '@amore/music/timing'
import type { ChordTypeT, ChordVoicingT, DiatonicChordT } from '@amore/music/types'
import { ChordCard, type ChordSnapshotT } from './ChordCard'

type ChordGridPropsT = {
	diatonicChords: DiatonicChordT[]
	projectRootOctave: number
}

type GridChordT = {
	id: string
	chord: DiatonicChordT
	qualityId: ChordTypeT
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

const buildChordLabel = (chord: DiatonicChordT, qualityId: ChordTypeT): string => {
	return `${chord.root}${getChordQualityLabel(qualityId)}`
}

const buildSelectionId = (chord: DiatonicChordT, qualityId: ChordTypeT): string => `${chord.degree}-${qualityId}`

export const ChordGrid = (props: ChordGridPropsT) => {
	const [modifierBySelectionId, setModifierBySelectionId] = createSignal<ChordModifierMapT>({})

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

	const previewNotes = (selection: GridChordT, modifiers: ChordModifierStateT): number[] => {
		return expandChord(
			selection.chord.root,
			selection.qualityId,
			modifiers.inversion,
			props.projectRootOctave + modifiers.octaveOffset,
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
		octaveOffset: modifiers.octaveOffset,
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
		<div class="modifierMenuField">
			<span class="modifierMenuLabel">{label}</span>
			<div class="modifierStepper">
				<z-button size="small" kind="outline" tone="neutral" on:click={() => onChange(clamp(value - 1, min, max))}>
					-
				</z-button>
				<z-input
					type="number"
					size="small"
					value={String(value)}
					on:change={(event: Event) => onChange(handleStepperInput((event as CustomEvent<{ value: string }>).detail.value, value, min, max))}
				/>
				<z-button size="small" kind="outline" tone="neutral" on:click={() => onChange(clamp(value + 1, min, max))}>
					+
				</z-button>
			</div>
		</div>
	)

	const renderGridModifierControls = (selection: GridChordT) => {
		const modifiers = () => modifiersForSelection(selection)
		const updateModifiers = (patch: Partial<ChordModifierStateT>) => updateGridModifiers(selection, { ...modifiers(), ...patch })
		const rangeKey = () => `${modifiers().velocityMin}-${modifiers().velocityMax}`

		return (
			<div
				slot="controls"
				class="modifierMenuControls"
				onMouseDown={(event) => event.stopPropagation()}
				onClick={(event) => event.stopPropagation()}
				onContextMenu={(event) => event.preventDefault()}
			>
				<div class="modifierMenuField">
					<span class="modifierMenuLabel">Voicing</span>
					<z-select
						options={VOICING_OPTIONS.map((option) => ({ value: option, label: VOICING_LABELS[option] }))}
						value={modifiers().voicing}
						size="small"
						on:change={(event: Event) => updateModifiers({ voicing: (event as CustomEvent<{ value: ChordVoicingT }>).detail.value })}
					/>
				</div>

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
				{renderModifierStepper('Octave', modifiers().octaveOffset, -3, 3, (value) => updateModifiers({ octaveOffset: value }))}
			</div>
		)
	}

	return (
		<div class='chordGrid'>
			<For each={CHORD_GRID_SECTIONS}>
				{(section) => (
					<div class='chordGridSection'>
						<span class='chordGridSectionLabel'>{section.label}</span>
						<div class='chordRow'>
							<For each={section.qualityIds}>
								{(qualityId) => (
									<For each={props.diatonicChords}>
										{(chord) => {
											const tileId = buildSelectionId(chord, qualityId)
											const gridChord = { id: tileId, chord, qualityId }
											const snapshot = () => chordSnapshot(gridChord, modifiersForSelection(gridChord))
											const isModified = () => hasModifiers(modifiersForSelection(gridChord))

											return (
												<z-context-menu items={gridMenuItems(gridChord)} on:select={(event: Event) => void handleGridMenuSelect(event, gridChord)}>
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
										}}
									</For>
								)}
							</For>
						</div>
					</div>
				)}
			</For>
		</div>
	)
}
