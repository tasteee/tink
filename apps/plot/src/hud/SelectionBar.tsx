import { ArrowClockwise, Trash, X } from '@phosphor-icons/react'
import { getObjectDef, ToolId } from '../game/catalog'
import { rotateObject, sellObject } from '../game/actions'
import { $selectedObjectId, useSelectedObjectId, useTool, useWorld } from '../game/store'
import { formatFunds } from './hudTools'
import './SelectionBar.css'

const clearSelection = () => {
	$selectedObjectId.set('')
}

export const SelectionBar = () => {
	const tool = useTool()
	const world = useWorld()
	const selectedObjectId = useSelectedObjectId()
	const selectedObject = world.objects.find((placedObject) => placedObject.id === selectedObjectId)
	const isLookTool = tool === ToolId.look
	const shouldShow = isLookTool && selectedObject !== undefined
	if (!shouldShow) return null

	const objectDef = getObjectDef(selectedObject.defId)
	const sellLabel = `Sell ${formatFunds(objectDef.cost)}`

	const handleRotate = () => {
		rotateObject(selectedObject.id)
	}

	const handleSell = () => {
		sellObject(selectedObject.id)
	}

	return (
		<section className="selectionBar" aria-label="Selected object">
			<z-text size="sm" weight="600" class="selectionName">
				{objectDef.label}
			</z-text>
			<z-button size="small" kind="soft" onClick={handleRotate}>
				<ArrowClockwise weight="bold" />
				Rotate
			</z-button>
			<z-button size="small" kind="soft" tone="danger" onClick={handleSell}>
				<Trash weight="bold" />
				{sellLabel}
			</z-button>
			<z-button size="small" kind="ghost" onClick={clearSelection} aria-label="Deselect">
				<X weight="bold" />
			</z-button>
		</section>
	)
}
