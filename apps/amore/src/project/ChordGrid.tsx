import { createSignal, For } from 'solid-js'
import { convexClient } from '@amore/convex/client'
import { api } from '@convex/_generated/api'
import { CHORD_GRID_SECTIONS, expandChord, getChordQualityLabel, getChordQualityName } from '@amore/music/theory'
import { startPreview, stopPreview } from '@amore/music/audio'
import { beatsToTicks } from '@amore/music/timing'
import type { ChordTypeT, ChordVoicingT, DiatonicChordT } from '@amore/music/types'

type ChordGridPropsT = {
	diatonicChords: DiatonicChordT[]
	progressionId: string
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

	const addChordToProgression = async (selection: GridChordT, modifiers: ChordModifierStateT): Promise<void> => {
		await convexClient.mutation(api.progression.addItem, {
			progressionId: props.progressionId as any,
			root: { kind: 'scaleDegree', degree: selection.chord.degree },
			qualityId: selection.qualityId,
			durationTicks: beatsToTicks(DEFAULT_DURATION_BEATS),
			inversion: modifiers.inversion,
			octaveOffset: modifiers.octaveOffset,
			voicing: modifiers.voicing,
			velocityMin: modifiers.velocityMin,
			velocityMax: modifiers.velocityMax
		})
	}

	const updateGridModifiers = (selection: GridChordT, modifiers: ChordModifierStateT): void => {
		saveModifiersForSelection(selection, modifiers)
		previewSelection(selection, modifiers)
	}

	const gridMenuItems = (selection: GridChordT): MenuItemT[] => {
		const modifiers = modifiersForSelection(selection)
		return [
			{ value: 'add', label: 'Add to progression', shortcut: 'Enter' },
			{ value: 'preview', label: 'Preview' },
			{ isSeparator: true },
			{ value: 'inversion.down', label: 'Inversion -', shortcut: String(modifiers.inversion) },
			{ value: 'inversion.up', label: 'Inversion +' },
			{ value: 'octave.down', label: 'Octave -', shortcut: modifiers.octaveOffset >= 0 ? `+${modifiers.octaveOffset}` : String(modifiers.octaveOffset) },
			{ value: 'octave.up', label: 'Octave +' },
			{ isSeparator: true },
			...VOICING_OPTIONS.map((option) => ({
				value: `voicing.${option}`,
				label: `Voicing: ${VOICING_LABELS[option]}`,
				shortcut: modifiers.voicing === option ? 'Current' : undefined
			})),
			{ isSeparator: true },
			{ value: 'velocity.min.down', label: 'Velocity min -5', shortcut: String(modifiers.velocityMin) },
			{ value: 'velocity.min.up', label: 'Velocity min +5' },
			{ value: 'velocity.max.down', label: 'Velocity max -5', shortcut: String(modifiers.velocityMax) },
			{ value: 'velocity.max.up', label: 'Velocity max +5' },
			{ isSeparator: true },
			{ value: 'reset', label: 'Reset modifiers', isDisabled: !hasModifiers(modifiers) }
		]
	}

	const handleGridMenuSelect = async (event: Event, selection: GridChordT): Promise<void> => {
		const value = (event as CustomEvent<{ value: string }>).detail.value
		const modifiers = modifiersForSelection(selection)

		if (value === 'add') {
			await addChordToProgression(selection, modifiers)
			return
		}
		if (value === 'preview') {
			previewSelection(selection, modifiers)
			return
		}
		if (value === 'reset') {
			updateGridModifiers(selection, defaultModifiers())
			return
		}
		if (value === 'inversion.down') updateGridModifiers(selection, { ...modifiers, inversion: clamp(modifiers.inversion - 1, 0, 8) })
		if (value === 'inversion.up') updateGridModifiers(selection, { ...modifiers, inversion: clamp(modifiers.inversion + 1, 0, 8) })
		if (value === 'octave.down') updateGridModifiers(selection, { ...modifiers, octaveOffset: clamp(modifiers.octaveOffset - 1, -3, 3) })
		if (value === 'octave.up') updateGridModifiers(selection, { ...modifiers, octaveOffset: clamp(modifiers.octaveOffset + 1, -3, 3) })
		if (value === 'velocity.min.down') updateGridModifiers(selection, { ...modifiers, velocityMin: clamp(modifiers.velocityMin - 5, 1, modifiers.velocityMax - 1) })
		if (value === 'velocity.min.up') updateGridModifiers(selection, { ...modifiers, velocityMin: clamp(modifiers.velocityMin + 5, 1, modifiers.velocityMax - 1) })
		if (value === 'velocity.max.down') updateGridModifiers(selection, { ...modifiers, velocityMax: clamp(modifiers.velocityMax - 5, modifiers.velocityMin + 1, 127) })
		if (value === 'velocity.max.up') updateGridModifiers(selection, { ...modifiers, velocityMax: clamp(modifiers.velocityMax + 5, modifiers.velocityMin + 1, 127) })
		if (value.startsWith('voicing.')) updateGridModifiers(selection, { ...modifiers, voicing: value.replace('voicing.', '') as ChordVoicingT })
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
											const label = () => buildChordLabel(chord, qualityId)
											const isModified = () => hasModifiers(modifiersForSelection(gridChord))

											return (
												<z-context-menu items={gridMenuItems(gridChord)} on:select={(event: Event) => void handleGridMenuSelect(event, gridChord)}>
													<div
														class={`chordTile${isModified() ? ' hasModifiers' : ''}`}
														title={`${getChordQualityName(qualityId)}. Right-click for modifiers.`}
														onMouseDown={(event) => {
															if (event.button !== 0) return
															event.preventDefault()
															previewSelection(gridChord, modifiersForSelection(gridChord))
														}}
														onMouseUp={() => stopGridPreview(gridChord)}
														onMouseLeave={() => stopGridPreview(gridChord)}
													>
														<span class="chordTileNumeral">{chord.romanNumeral}</span>
														<span class="chordTileName">{label()}</span>
														<span class="chordTileModifierIndicator" title="Modified" />
														<button
															type="button"
															class="chordTileAddButton"
															title={`Add ${label()} to progression`}
															onMouseDown={(event) => event.stopPropagation()}
															onClick={async (event) => {
																event.stopPropagation()
																const modifiers = modifiersForSelection(gridChord)
																stopGridPreview(gridChord)
																await addChordToProgression(gridChord, modifiers)
															}}
														>
															+
														</button>
													</div>
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
