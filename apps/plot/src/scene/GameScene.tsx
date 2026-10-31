import { Canvas } from '@react-three/fiber'
import { BuildPreview } from './BuildPreview'
import { CameraRig } from './CameraRig'
import { Floors } from './Floors'
import { Lighting } from './Lighting'
import { LotGround } from './LotGround'
import { PlacedObjects } from './PlacedObjects'
import { Surroundings } from './Surroundings'
import { Walls } from './Walls'
import './GameScene.css'

const cameraPosition: [number, number, number] = [13, 17, 19]
const cameraSettings = { position: cameraPosition, fov: 40, near: 0.1, far: 300 }

export const GameScene = () => {
	return (
		<div className="gameScene">
			<Canvas shadows="percentage" dpr={[1, 2]} camera={cameraSettings}>
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
