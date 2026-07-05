import type { ChordRootT, ChordVoicingT } from '@amore/music/types'

export const CHORD_CARD_DRAG_TYPE = 'amore-chord'
export const CHORD_CARD_DRAG_GROUP = 'progression'

export type ChordSnapshotT = {
	kind: 'chord'
	source: 'grid' | 'previewHistory' | 'suggestion'
	label: string
	root: ChordRootT
	rootName: string
	romanNumeral?: string
	qualityId: string
	notes: number[]
	durationTicks: number
	inversion: number
	octaveOffset: number
	voicing: ChordVoicingT
	velocityMode: 'absolute'
	velocityMin: number
	velocityMax: number
	isEnabled?: boolean
}

type ChordCardPropsT = {
	snapshot: ChordSnapshotT
	title?: string
	isModified?: boolean
	onPreviewStart?: () => void
	onPreviewEnd?: () => void
}

export const isChordSnapshot = (value: unknown): value is ChordSnapshotT => {
	if (value === null || typeof value !== 'object') return false
	const candidate = value as Partial<ChordSnapshotT>
	return candidate.kind === 'chord' && typeof candidate.label === 'string' && typeof candidate.qualityId === 'string'
}

export const ChordCard = (props: ChordCardPropsT) => {
	const stopPreview = () => props.onPreviewEnd?.()

	return (
		<z-draggable
			type={CHORD_CARD_DRAG_TYPE}
			group={CHORD_CARD_DRAG_GROUP}
			data={props.snapshot}
			on:dragstart={stopPreview}
			on:dragend={stopPreview}
		>
			<div
				class={`chordTile${props.isModified ? ' hasModifiers' : ''}`}
				title={props.title}
				onMouseDown={(event) => {
					if (event.button !== 0) return
					props.onPreviewStart?.()
				}}
				onMouseUp={stopPreview}
				onMouseLeave={stopPreview}
			>
				<span class="chordTileNumeral">{props.snapshot.romanNumeral}</span>
				<span class="chordTileName">{props.snapshot.label}</span>
				<span class="chordTileModifierIndicator" title="Modified" />
			</div>
		</z-draggable>
	)
}
