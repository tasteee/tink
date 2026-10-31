import type { CSSProperties } from 'react'
import { ArrowClockwise, SquaresFour } from '@phosphor-icons/react'
import { ToolId } from '../game/catalog'
import { $isMenuOpen, $placementRotation, useChoices, usePlacementRotation, useTool } from '../game/store'
import { getActiveChoice } from './hudTools'
import './ActiveChoiceBar.css'

const openMenu = () => {
	$isMenuOpen.set(true)
}

const rotatePlacement = () => {
	const nextRotation = ($placementRotation.state + 1) % 4
	$placementRotation.set(nextRotation)
}

const PlacementRotateButton = () => {
	const rotation = usePlacementRotation()
	const degreesLabel = `${rotation * 90}°`

	return (
		<z-button size="small" kind="soft" onClick={rotatePlacement} aria-label="Rotate before placing">
			<ArrowClockwise weight="bold" />
			{degreesLabel}
		</z-button>
	)
}

// What the active tool is holding, with a shortcut back into
// the build menu. Bulldoze shows its hint only.
export const ActiveChoiceBar = () => {
	const tool = useTool()
	const choices = useChoices()
	const activeChoice = getActiveChoice(tool, choices)
	const isBulldoze = tool === ToolId.bulldoze
	const isPlaceTool = tool === ToolId.place

	if (isBulldoze) {
		return (
			<section className="activeChoiceBar">
				<z-text size="sm" color="muted">
					Tap anything to remove it
				</z-text>
			</section>
		)
	}

	if (activeChoice === null) return null
	const swatchStyle: CSSProperties = { background: activeChoice.swatch }

	return (
		<section className="activeChoiceBar" aria-label="Selected item">
			<span className="activeChoiceSwatch" style={swatchStyle} />
			<div className="activeChoiceText">
				<z-text size="sm" weight="600">
					{activeChoice.label}
				</z-text>
				<z-text size="xs" color="muted">
					{activeChoice.hint}
				</z-text>
			</div>
			{isPlaceTool && <PlacementRotateButton />}
			<z-button size="small" kind="soft" onClick={openMenu} aria-label="Change item">
				<SquaresFour weight="bold" />
			</z-button>
		</section>
	)
}
