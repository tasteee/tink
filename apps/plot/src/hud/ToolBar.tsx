import { Bulldozer, Hand, Plus } from '@phosphor-icons/react'
import { ToolId } from '../game/catalog'
import type { ToolIdT } from '../game/catalog'
import { $hover, $isMenuOpen, $selectedObjectId, $tool, useTool } from '../game/store'
import { cancelStroke } from '../game/interaction'
import './ToolBar.css'

const switchTool = (toolId: ToolIdT) => {
	cancelStroke()
	$hover.set({ isVisible: false })
	$selectedObjectId.set('')
	$tool.set(toolId)
}

const selectLook = () => {
	switchTool(ToolId.look)
}

const selectBulldoze = () => {
	switchTool(ToolId.bulldoze)
}

const openMenu = () => {
	$isMenuOpen.set(true)
}

const getButtonKind = (isActive: boolean): 'solid' | 'ghost' => {
	return isActive ? 'solid' : 'ghost'
}

const getButtonTone = (isActive: boolean): 'primary' | 'neutral' => {
	return isActive ? 'primary' : 'neutral'
}

// Look, the build menu, and bulldoze. Floor, wall and place
// tools are entered by picking something in the build menu.
export const ToolBar = () => {
	const activeTool = useTool()
	const isLook = activeTool === ToolId.look
	const isBulldoze = activeTool === ToolId.bulldoze
	const isBuilding = !isLook && !isBulldoze

	return (
		<nav className="toolBar" aria-label="Tools">
			<z-button size="small" kind={getButtonKind(isLook)} tone={getButtonTone(isLook)} onClick={selectLook} aria-label="Look" aria-pressed={isLook}>
				<Hand weight="bold" />
			</z-button>
			<z-button size="small" kind={getButtonKind(isBuilding)} tone={getButtonTone(isBuilding)} onClick={openMenu} aria-label="Build">
				<Plus weight="bold" />
				Build
			</z-button>
			<z-button size="small" kind={getButtonKind(isBulldoze)} tone={getButtonTone(isBulldoze)} onClick={selectBulldoze} aria-label="Bulldoze" aria-pressed={isBulldoze}>
				<Bulldozer weight="bold" />
			</z-button>
		</nav>
	)
}
