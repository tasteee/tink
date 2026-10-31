import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { PMREMGenerator } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { useIsNight } from '../game/store'
import { isHighQuality, isTouchDevice } from '../game/quality'

const shadowMapSize = isTouchDevice ? 1024 : 2048
// Without the reflection map, the sky light carries more fill.
const lowQualityFillBoost = isHighQuality ? 0 : 0.35

const dayLook = {
	sky: '#bfe0ee',
	hemisphereSky: '#e4f3ff',
	hemisphereGround: '#6b7f4a',
	hemisphereIntensity: 0.75,
	sunColor: '#fff2dc',
	sunIntensity: 2.4,
	environmentIntensity: 0.3
}

const nightLook = {
	sky: '#121a33',
	hemisphereSky: '#5a6fb0',
	hemisphereGround: '#1c2416',
	hemisphereIntensity: 0.35,
	sunColor: '#9fb4ff',
	sunIntensity: 0.45,
	environmentIntensity: 0.08
}

// A soft studio environment so gold, chrome, car paint and
// velvet sheen have something to reflect.
const useStudioEnvironment = (intensity: number) => {
	const renderer = useThree((state) => state.gl)
	const scene = useThree((state) => state.scene)

	useEffect(() => {
		if (!isHighQuality) return
		const generator = new PMREMGenerator(renderer)
		const room = new RoomEnvironment()
		const environmentTarget = generator.fromScene(room, 0.04)
		scene.environment = environmentTarget.texture
		room.dispose()
		generator.dispose()
		return () => {
			scene.environment = null
			environmentTarget.dispose()
		}
	}, [renderer, scene])

	useEffect(() => {
		scene.environmentIntensity = intensity
	}, [scene, intensity])
}

// Sun (or moon) with a shadow box sized to cover the lot.
export const Lighting = () => {
	const isNight = useIsNight()
	const look = isNight ? nightLook : dayLook
	useStudioEnvironment(look.environmentIntensity)
	const fogArgs: [string, number, number] = [look.sky, 45, 110]

	// A fragment, not a group: background and fog must attach
	// to the scene itself.
	return (
		<>
			<color attach="background" args={[look.sky]} />
			<fog attach="fog" args={fogArgs} />
			<hemisphereLight args={[look.hemisphereSky, look.hemisphereGround, look.hemisphereIntensity + lowQualityFillBoost]} />
			<directionalLight
				position={[14, 22, 9]}
				color={look.sunColor}
				intensity={look.sunIntensity}
				castShadow={isHighQuality}
				shadow-mapSize-width={shadowMapSize}
				shadow-mapSize-height={shadowMapSize}
				shadow-camera-left={-15}
				shadow-camera-right={15}
				shadow-camera-top={15}
				shadow-camera-bottom={-15}
				shadow-camera-near={1}
				shadow-camera-far={60}
				shadow-bias={-0.0006}
				shadow-normalBias={0.02}
			/>
		</>
	)
}
