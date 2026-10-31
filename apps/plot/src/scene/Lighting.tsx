import { useIsNight } from '../game/store'
import { checkIsTouchDevice } from './renderHealth'

const shadowMapSize = checkIsTouchDevice() ? 1024 : 2048

const dayLook = {
	sky: '#bfe0ee',
	hemisphereSky: '#e4f3ff',
	hemisphereGround: '#6b7f4a',
	hemisphereIntensity: 1.1,
	sunColor: '#fff2dc',
	sunIntensity: 2.4
}

const nightLook = {
	sky: '#121a33',
	hemisphereSky: '#5a6fb0',
	hemisphereGround: '#1c2416',
	hemisphereIntensity: 0.35,
	sunColor: '#9fb4ff',
	sunIntensity: 0.45
}

// Sun (or moon) with a shadow box sized to cover the lot.
export const Lighting = () => {
	const isNight = useIsNight()
	const look = isNight ? nightLook : dayLook
	const fogArgs: [string, number, number] = [look.sky, 45, 110]

	// A fragment, not a group: background and fog must attach
	// to the scene itself.
	return (
		<>
			<color attach="background" args={[look.sky]} />
			<fog attach="fog" args={fogArgs} />
			<hemisphereLight args={[look.hemisphereSky, look.hemisphereGround, look.hemisphereIntensity]} />
			<directionalLight
				position={[14, 22, 9]}
				color={look.sunColor}
				intensity={look.sunIntensity}
				castShadow
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
