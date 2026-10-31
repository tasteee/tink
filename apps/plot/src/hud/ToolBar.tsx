import { $hover, $selectedObjectId, $tool, useTool } from '../game/store'
import { cancelStroke } from '../game/interaction'
import { hudTools } from './hudTools'
import type { HudToolT } from './hudTools'
import './ToolBar.css'

const selectTool = (hudTool: HudToolT) => {
	cancelStroke()
	$hover.set({ isVisible: false })
	$selectedObjectId.set('')
	$tool.set(hudTool.id)
}

type ToolButtonPropsT = {
	hudTool: HudToolT
	isActive: boolean
}

const ToolButton = (props: ToolButtonPropsT) => {
	const kind = props.isActive ? 'solid' : 'ghost'
	const tone = props.isActive ? 'primary' : 'neutral'
	const ToolIcon = props.hudTool.Icon

	const handleClick = () => {
		selectTool(props.hudTool)
	}

	return (
		<z-button size="small" kind={kind} tone={tone} onClick={handleClick} aria-label={props.hudTool.label} aria-pressed={props.isActive}>
			<ToolIcon weight="bold" />
			<span className="toolLabel">{props.hudTool.label}</span>
		</z-button>
	)
}

export const ToolBar = () => {
	const activeTool = useTool()

	const buttons = hudTools.map((hudTool) => {
		const isActive = hudTool.id === activeTool
		return <ToolButton key={hudTool.id} hudTool={hudTool} isActive={isActive} />
	})

	return (
		<nav className="toolBar" aria-label="Build tools">
			{buttons}
		</nav>
	)
}
