import { Canvas } from '@react-three/fiber'
import type { RootState } from '@react-three/fiber'
import { ErrorBoundary } from 'react-error-boundary'
import { isHighQuality, isTouchDevice } from '../game/quality'
import { BuildPreview } from './BuildPreview'
import { CameraRig } from './CameraRig'
import { Floors } from './Floors'
import { Lighting } from './Lighting'
import { LotGround } from './LotGround'
import { PlacedObjects } from './PlacedObjects'
import { blockedWebGlMessage, checkCanCreateWebGl, describeCanvasError, markRenderFailed, watchRenderer } from './renderHealth'
import { Surroundings } from './Surroundings'
import { Walls } from './Walls'
import './GameScene.css'

const cameraPosition: [number, number, number] = [13, 17, 19]
const cameraSettings = { position: cameraPosition, fov: 40, near: 0.1, far: 300 }

const getPixelRatio = (): [number, number] => {
	if (!isHighQuality) return [1, 1]
	if (isTouchDevice) return [1, 1.5]
	return [1, 2]
}

const pixelRatio = getPixelRatio()
const powerPreference: WebGLPowerPreference = 'default'
const glSettings = { antialias: isHighQuality, powerPreference }
const shadowSetting = isHighQuality ? 'percentage' : false

const handleCreated = (state: RootState) => {
	watchRenderer(state.gl)
}

// Anything thrown while creating or drawing the 3D view lands
// here, so the HUD stays up and can say what went wrong.
const handleSceneError = (error: unknown) => {
	markRenderFailed(`The 3D view crashed: ${describeCanvasError(error)}`)
}

const renderNothing = () => {
	return null
}

const canCreateWebGl = checkCanCreateWebGl()
if (!canCreateWebGl) markRenderFailed(blockedWebGlMessage)

export const GameScene = () => {
	if (!canCreateWebGl) return null

	return (
		<div className="gameScene">
			<ErrorBoundary fallbackRender={renderNothing} onError={handleSceneError}>
				<Canvas shadows={shadowSetting} dpr={pixelRatio} gl={glSettings} camera={cameraSettings} onCreated={handleCreated}>
					<Lighting />
					<CameraRig />
					<Surroundings />
					<LotGround />
					<Floors />
					<Walls />
					<PlacedObjects />
					<BuildPreview />
				</Canvas>
			</ErrorBoundary>
		</div>
	)
}
