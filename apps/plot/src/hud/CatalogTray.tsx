import type { CSSProperties } from 'react'
import { ArrowClockwise } from '@phosphor-icons/react'
import { floorDefs, getObjectDefsInCategory, ToolId, wallDefs } from '../game/catalog'
import type { ToolIdT } from '../game/catalog'
import { $choices, $placementRotation, useChoices, usePlacementRotation, useSelectedObjectId, useTool } from '../game/store'
import type { CatalogChoicesT } from '../game/store'
import { formatFunds, getHudTool } from './hudTools'
import './CatalogTray.css'

type CatalogOptionT = {
	id: string
	label: string
	cost: number
	swatch: string
}

type ChoiceKeyT = keyof CatalogChoicesT

const getChoiceKey = (tool: ToolIdT): ChoiceKeyT | null => {
	const isFloorTool = tool === ToolId.floor
	if (isFloorTool) return 'floor'
	const isWallTool = tool === ToolId.wall
	if (isWallTool) return 'wall'
	const isPlantTool = tool === ToolId.plant
	if (isPlantTool) return 'plant'
	const isFurnitureTool = tool === ToolId.furniture
	if (isFurnitureTool) return 'furniture'
	return null
}

const getOptionsForChoiceKey = (choiceKey: ChoiceKeyT): CatalogOptionT[] => {
	const isFloor = choiceKey === 'floor'
	if (isFloor) {
		return floorDefs.map((floorDef) => {
			return { id: floorDef.id, label: floorDef.label, cost: floorDef.cost, swatch: floorDef.color }
		})
	}

	const isWall = choiceKey === 'wall'
	if (isWall) {
		return wallDefs.map((wallDef) => {
			return { id: wallDef.id, label: wallDef.label, cost: wallDef.cost, swatch: wallDef.color }
		})
	}

	return getObjectDefsInCategory(choiceKey).map((objectDef) => {
		return { id: objectDef.id, label: objectDef.label, cost: objectDef.cost, swatch: objectDef.swatch }
	})
}

type CatalogOptionButtonPropsT = {
	option: CatalogOptionT
	choiceKey: ChoiceKeyT
	isChosen: boolean
}

const CatalogOptionButton = (props: CatalogOptionButtonPropsT) => {
	const kind = props.isChosen ? 'solid' : 'soft'
	const tone = props.isChosen ? 'primary' : 'neutral'
	const priceLabel = formatFunds(props.option.cost)
	const swatchStyle: CSSProperties = { background: props.option.swatch }

	const handleClick = () => {
		$choices.set({ [props.choiceKey]: props.option.id })
	}

	return (
		<z-button size="small" kind={kind} tone={tone} onClick={handleClick} aria-pressed={props.isChosen}>
			<span className="catalogSwatch" style={swatchStyle} />
			<span className="catalogLabel">{props.option.label}</span>
			<span className="catalogPrice">{priceLabel}</span>
		</z-button>
	)
}

const rotatePlacement = () => {
	const nextRotation = ($placementRotation.state + 1) % 4
	$placementRotation.set(nextRotation)
}

const PlacementRotateButton = () => {
	const rotation = usePlacementRotation()
	const degreesLabel = `${rotation * 90}°`

	return (
		<z-button size="small" kind="outline" onClick={rotatePlacement} aria-label="Rotate before placing">
			<ArrowClockwise weight="bold" />
			<span className="catalogPrice">{degreesLabel}</span>
		</z-button>
	)
}

export const CatalogTray = () => {
	const tool = useTool()
	const choices = useChoices()
	const selectedObjectId = useSelectedObjectId()
	const hudTool = getHudTool(tool)
	const choiceKey = getChoiceKey(tool)
	const hasCatalog = choiceKey !== null
	const isObjectTool = tool === ToolId.plant || tool === ToolId.furniture
	const options = hasCatalog ? getOptionsForChoiceKey(choiceKey) : []

	// The selection bar replaces the Look hint so phones keep
	// two rows of chrome at most.
	const isLookTool = tool === ToolId.look
	const hasSelection = selectedObjectId !== ''
	const isHiddenBySelection = isLookTool && hasSelection
	if (isHiddenBySelection) return null

	const optionButtons = options.map((option) => {
		const isChosen = hasCatalog && choices[choiceKey] === option.id
		const resolvedChoiceKey = choiceKey ?? 'floor'
		return <CatalogOptionButton key={option.id} option={option} choiceKey={resolvedChoiceKey} isChosen={isChosen} />
	})

	return (
		<section className="catalogTray" aria-label={hudTool.label}>
			<div className="catalogHeader">
				<z-text size="xs" weight="600">
					{hudTool.label}
				</z-text>
				<z-text size="xs" color="muted">
					{hudTool.hint}
				</z-text>
			</div>
			{hasCatalog && (
				<div className="catalogStrip">
					{isObjectTool && <PlacementRotateButton />}
					{optionButtons}
				</div>
			)}
		</section>
	)
}
