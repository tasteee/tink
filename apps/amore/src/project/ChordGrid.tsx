import { For } from 'solid-js'
import { convexClient } from '@amore/convex/client'
import { api } from '@convex/_generated/api'
import { expandChord, CHORD_LABELS } from '@amore/music/theory'
import { startPreview, stopPreview } from '@amore/music/audio'
import type { DiatonicChordT } from '@amore/music/types'

type ChordGridPropsT = {
	diatonicChords: DiatonicChordT[]
	projectId: string
}

const CHORD_VOICE_OCTAVE = 4
const DEFAULT_DURATION_BEATS = 2

const buildChordLabel = (chord: DiatonicChordT): string => {
	return `${chord.root}${CHORD_LABELS[chord.chordType]}`
}

const buildSeventhLabel = (chord: DiatonicChordT): string => {
	return `${chord.root}${CHORD_LABELS[chord.seventhChordType]}`
}

const ChordTile = (props: {
	chord: DiatonicChordT
	isSeventhVariant: boolean
	projectId: string
}) => {
	const chordType = () => (props.isSeventhVariant ? props.chord.seventhChordType : props.chord.chordType)
	const label = () => (props.isSeventhVariant ? buildSeventhLabel(props.chord) : buildChordLabel(props.chord))
	const previewId = () => `${props.chord.root}-${chordType()}`

	const handleMouseDown = (event: MouseEvent) => {
		event.preventDefault()
		const notes = expandChord(props.chord.root, chordType(), 0, CHORD_VOICE_OCTAVE)
		startPreview(previewId(), notes)
	}

	const handleMouseUp = () => stopPreview(previewId())

	const handleMouseLeave = () => stopPreview(previewId())

	const handleAddClick = async (event: MouseEvent) => {
		event.stopPropagation()
		await convexClient.mutation(api.amoreProgression.add, {
			projectId: props.projectId as any,
			root: props.chord.root,
			chordType: chordType(),
			durationBeats: DEFAULT_DURATION_BEATS
		})
	}

	return (
		<div
			class="chordTile"
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onMouseLeave={handleMouseLeave}
		>
			<span class="chordTileNumeral">{props.chord.romanNumeral}</span>
			<span class="chordTileName">{label()}</span>
			<button
				type="button"
				class="chordTileAddButton"
				title={`Add ${label()} to progression`}
				onClick={handleAddClick}
			>
				+
			</button>
		</div>
	)
}

export const ChordGrid = (props: ChordGridPropsT) => (
	<div class="chordGrid">
		<div class="chordGridSection">
			<span class="chordGridSectionLabel">Triads</span>
			<div class="chordRow">
				<For each={props.diatonicChords}>
					{(chord) => <ChordTile chord={chord} isSeventhVariant={false} projectId={props.projectId} />}
				</For>
			</div>
		</div>

		<div class="chordGridSection">
			<span class="chordGridSectionLabel">7th chords</span>
			<div class="chordRow">
				<For each={props.diatonicChords}>
					{(chord) => <ChordTile chord={chord} isSeventhVariant={true} projectId={props.projectId} />}
				</For>
			</div>
		</div>
	</div>
)
