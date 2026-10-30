import { ArrowClockwise, ArrowCounterClockwise } from '@phosphor-icons/react'
import { requestCameraTurn } from '../scene/cameraCommands'
import './CameraButtons.css'

const turnLeft = () => {
	requestCameraTurn(-1)
}

const turnRight = () => {
	requestCameraTurn(1)
}

export const CameraButtons = () => {
	return (
		<div className="cameraButtons" aria-label="Camera">
			<z-button size="small" kind="ghost" onClick={turnLeft} aria-label="Turn camera left">
				<ArrowCounterClockwise weight="bold" />
			</z-button>
			<z-button size="small" kind="ghost" onClick={turnRight} aria-label="Turn camera right">
				<ArrowClockwise weight="bold" />
			</z-button>
		</div>
	)
}
