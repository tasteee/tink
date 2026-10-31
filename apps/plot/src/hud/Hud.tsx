import { CameraButtons } from './CameraButtons'
import { CatalogTray } from './CatalogTray'
import { NoticePill } from './NoticePill'
import { SelectionBar } from './SelectionBar'
import { ToolBar } from './ToolBar'
import { TopBar } from './TopBar'
import './Hud.css'

// The HUD floats over the canvas. Its container ignores
// pointers so gestures fall through to the 3D scene; only the
// panels themselves catch taps.
export const Hud = () => {
	return (
		<div className="hud">
			<TopBar />
			<div className="hudCenter">
				<NoticePill />
			</div>
			<div className="hudBottom">
				<SelectionBar />
				<CatalogTray />
				<div className="hudControls">
					<ToolBar />
					<CameraButtons />
				</div>
			</div>
		</div>
	)
}
