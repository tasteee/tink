import { Armchair, Bulldozer, Hand, PaintRoller, Tree, Wall } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { ToolId } from '../game/catalog'
import type { ToolIdT } from '../game/catalog'

export type HudToolT = {
	id: ToolIdT
	label: string
	hint: string
	Icon: Icon
}

export const hudTools: HudToolT[] = [
	{ id: ToolId.look, label: 'Look', hint: 'Drag to pan · pinch to zoom · tap an object', Icon: Hand },
	{ id: ToolId.floor, label: 'Floor', hint: 'Drag across tiles to paint', Icon: PaintRoller },
	{ id: ToolId.wall, label: 'Walls', hint: 'Drag along grid lines to build', Icon: Wall },
	{ id: ToolId.plant, label: 'Plants', hint: 'Tap the lot to plant', Icon: Tree },
	{ id: ToolId.furniture, label: 'Furniture', hint: 'Tap the lot to place', Icon: Armchair },
	{ id: ToolId.bulldoze, label: 'Bulldoze', hint: 'Tap anything to remove it for a full refund', Icon: Bulldozer }
]

export const getHudTool = (toolId: ToolIdT): HudToolT => {
	const foundTool = hudTools.find((hudTool) => hudTool.id === toolId)
	return foundTool ?? hudTools[0]
}

export const formatFunds = (amount: number): string => {
	return `$${amount.toLocaleString()}`
}
