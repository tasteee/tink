import { Canvas } from '@react-three/fiber'
import type { RootState } from '@react-three/fiber'
import { useCanvasGeneration } from '../game/store'
import { BuildPreview } from './BuildPreview'
import { CameraRig } from './CameraRig'
import { Floors } from './Floors'
import { Lighting } from './Lighting'
import { LotGround } from './LotGround'
import { PlacedObjects } from './PlacedObjects'
import { checkIsTouchDevice, watchRenderer } from './renderHealth'
import { Surroundings } from './Surroundings'
import { Walls } from './Walls'
import './GameScene.css'

const cameraPosition: [number, number, number] = [13, 17, 19]
const cameraSettings = { position: cameraPosition, fov: 40, near: 0.1, far: 300 }
const isTouchDevice = checkIsTouchDevice()
const touchPixelRatio: [number, number] = [1, 1.5]
const desktopPixelRatio: [number, number] = [1, 2]
const pixelRatio = isTouchDevice ? touchPixelRatio : desktopPixelRatio
const powerPreference: WebGLPowerPreference = 'default'
const glSettings = { antialias: true, powerPreference }

const handleCreated = (state: RootState) => {
	watchRenderer(state.gl)
}

export const GameScene = () => {
	const canvasGeneration = useCanvasGeneration()

	return (
		<div className="gameScene">
			<Canvas key={canvasGeneration} shadows="percentage" dpr={pixelRatio} gl={glSettings} camera={cameraSettings} onCreated={handleCreated}>
				<Lighting />
				<CameraRig />
				<Surroundings />
				<LotGround />
				<Floors />
				<Walls />
				<PlacedObjects />
				<BuildPreview />
			</Canvas>
		</div>
	)
}
