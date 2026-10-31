import { CylinderGeometry, ExtrudeGeometry, Shape, SphereGeometry, TorusGeometry } from 'three'
import type { BufferGeometry, Material } from 'three'
import { useIsNight } from '../../game/store'
import { buildTube, getCachedGeometry, getRoundedBox } from './geometryKit'
import type { PointT } from './geometryKit'
import { getCarPaint, getChrome, getGlass, getGlow, getMatte, getRubber } from './materials'
import type { Vector3TupleT } from './parts'

// Vintage boxy 4x4, inspired by classic two-door off-roaders.
// Footprint is 2 tiles wide by 4 deep; the nose points +Z.

const BODY_WIDTH = 1.72
const HALF_BODY_WIDTH = BODY_WIDTH / 2
const BODY_REAR = -1.95
const BODY_FRONT = 1.95
const SILL_HEIGHT = 0.42
const BELT_HEIGHT = 1.08
const WHEEL_Z = 1.28
const WHEEL_X = 0.8
const WHEEL_RADIUS = 0.38
const ARCH_RADIUS = 0.47
const CABIN_FRONT = 0.48
const ROOF_HEIGHT = 1.72
// The extrude bevel grows the shell 0.04 past its profile, so
// anything sitting on the body's top uses this height.
const BODY_TOP = BELT_HEIGHT + 0.04

type PartPropsT = {
	geometry: BufferGeometry
	material: Material
	position?: Vector3TupleT
	rotation?: Vector3TupleT
	scale?: Vector3TupleT
}

const Part = (props: PartPropsT) => {
	return <mesh geometry={props.geometry} material={props.material} position={props.position} rotation={props.rotation} scale={props.scale} castShadow receiveShadow />
}

// Side profile drawn in (z, y), with both wheel arches cut into
// the lower edge, then extruded across the body's width.
const buildBodyShell = (): BufferGeometry => {
	const shape = new Shape()
	shape.moveTo(BODY_REAR, SILL_HEIGHT)
	shape.lineTo(BODY_REAR, BELT_HEIGHT)
	shape.lineTo(CABIN_FRONT, BELT_HEIGHT)
	shape.lineTo(BODY_FRONT - 0.05, BELT_HEIGHT - 0.03)
	shape.lineTo(BODY_FRONT, BELT_HEIGHT - 0.08)
	shape.lineTo(BODY_FRONT, SILL_HEIGHT)
	shape.lineTo(WHEEL_Z + ARCH_RADIUS, SILL_HEIGHT)
	shape.absarc(WHEEL_Z, SILL_HEIGHT, ARCH_RADIUS, 0, Math.PI, false)
	shape.lineTo(-WHEEL_Z + ARCH_RADIUS, SILL_HEIGHT)
	shape.absarc(-WHEEL_Z, SILL_HEIGHT, ARCH_RADIUS, 0, Math.PI, false)
	shape.lineTo(BODY_REAR, SILL_HEIGHT)

	const bevel = 0.04
	const extrudeSettings = { depth: BODY_WIDTH - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 20 }
	const geometry = new ExtrudeGeometry(shape, extrudeSettings)
	geometry.rotateY(-Math.PI / 2)
	geometry.translate(HALF_BODY_WIDTH - bevel, 0, 0)
	return geometry
}

const buildTireRing = (): BufferGeometry => {
	const tire = new TorusGeometry(WHEEL_RADIUS - 0.1, 0.1, 12, 32)
	tire.rotateY(Math.PI / 2)
	tire.scale(1.25, 1, 1)
	return tire
}

const buildTireCore = (): BufferGeometry => {
	const core = new CylinderGeometry(WHEEL_RADIUS - 0.1, WHEEL_RADIUS - 0.1, 0.22, 28)
	core.rotateZ(Math.PI / 2)
	return core
}

const buildRim = (): BufferGeometry => {
	const rim = new CylinderGeometry(0.2, 0.2, 0.235, 28)
	rim.rotateZ(Math.PI / 2)
	return rim
}

const buildHubCap = (): BufferGeometry => {
	const cap = new SphereGeometry(0.075, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2)
	cap.rotateZ(-Math.PI / 2)
	return cap
}

const buildRimSlot = (): BufferGeometry => {
	const slot = new CylinderGeometry(0.026, 0.026, 0.24, 10)
	slot.rotateZ(Math.PI / 2)
	return slot
}

const buildHeadlightBezel = (): BufferGeometry => {
	return new TorusGeometry(0.1, 0.025, 10, 24)
}

const buildLens = (): BufferGeometry => {
	const lens = new CylinderGeometry(0.095, 0.095, 0.03, 24)
	lens.rotateX(Math.PI / 2)
	return lens
}

const rollBarPoints: PointT[] = [
	[-0.74, BELT_HEIGHT + 0.04, -0.75],
	[-0.74, 1.62, -0.72],
	[-0.6, 1.72, -0.72],
	[0.6, 1.72, -0.72],
	[0.74, 1.62, -0.72],
	[0.74, BELT_HEIGHT + 0.04, -0.75]
]

const getVehicleGeometry = () => {
	return {
		body: getCachedGeometry('cruiser:body', buildBodyShell),
		chassis: getRoundedBox(1.5, 0.22, 3.5, 0.05),
		hardtop: getRoundedBox(1.68, ROOF_HEIGHT - BELT_HEIGHT - 0.04, 2.4, 0.07),
		cabTop: getRoundedBox(1.68, ROOF_HEIGHT - BELT_HEIGHT - 0.04, 0.9, 0.07),
		sideWindowFront: getRoundedBox(0.012, 0.42, 0.42, 0.004),
		sideWindowRear: getRoundedBox(0.012, 0.42, 1.5, 0.004),
		rearWindow: getRoundedBox(1.36, 0.4, 0.012, 0.004),
		windshield: getRoundedBox(1.48, 0.46, 0.012, 0.004),
		windshieldRail: getRoundedBox(1.62, 0.05, 0.05, 0.02),
		windshieldPost: getRoundedBox(0.05, 0.56, 0.05, 0.02),
		grille: getRoundedBox(1.46, 0.34, 0.05, 0.02),
		grilleBar: getRoundedBox(1.0, 0.025, 0.02, 0.008),
		bumper: getRoundedBox(1.86, 0.13, 0.12, 0.04),
		bezel: getCachedGeometry('cruiser:bezel', buildHeadlightBezel),
		lens: getCachedGeometry('cruiser:lens', buildLens),
		indicator: getRoundedBox(0.12, 0.05, 0.03, 0.012),
		tailLight: getRoundedBox(0.08, 0.16, 0.03, 0.012),
		tireRing: getCachedGeometry('cruiser:tireRing', buildTireRing),
		tireCore: getCachedGeometry('cruiser:tireCore', buildTireCore),
		rim: getCachedGeometry('cruiser:rim', buildRim),
		hubCap: getCachedGeometry('cruiser:hubCap', buildHubCap),
		rimSlot: getCachedGeometry('cruiser:rimSlot', buildRimSlot),
		doorSeam: getRoundedBox(0.008, 0.56, 0.012, 0.003),
		doorHandle: getRoundedBox(0.03, 0.03, 0.12, 0.012),
		mirrorStalk: getRoundedBox(0.12, 0.025, 0.025, 0.008),
		mirrorHead: getRoundedBox(0.04, 0.11, 0.15, 0.025),
		beltTrim: getRoundedBox(0.012, 0.018, 3.82, 0.006),
		spareTire: getCachedGeometry('cruiser:spare', () => new TorusGeometry(0.27, 0.1, 12, 28)),
		spareCover: getCachedGeometry('cruiser:spareCover', () => new CylinderGeometry(0.28, 0.28, 0.16, 28)),
		cabinFloor: getRoundedBox(1.6, 0.02, 2.24, 0.01),
		bucketSeat: getRoundedBox(0.52, 0.42, 0.14, 0.05),
		seatBase: getRoundedBox(0.52, 0.12, 0.5, 0.04),
		benchBack: getRoundedBox(1.3, 0.4, 0.14, 0.05),
		benchBase: getRoundedBox(1.3, 0.12, 0.5, 0.04),
		steeringWheel: getCachedGeometry('cruiser:steering', () => new TorusGeometry(0.15, 0.018, 8, 24)),
		rollBar: getCachedGeometry('cruiser:rollBar', () => buildTube(rollBarPoints, 0.035, false)),
		bedFloor: getRoundedBox(1.56, 0.02, 1.4, 0.01),
		chargePort: getCachedGeometry('cruiser:port', () => new CylinderGeometry(0.045, 0.045, 0.02, 16))
	}
}

type VehicleGeometryT = ReturnType<typeof getVehicleGeometry>

const wheelSpots: Vector3TupleT[] = [
	[-WHEEL_X, WHEEL_RADIUS, WHEEL_Z],
	[WHEEL_X, WHEEL_RADIUS, WHEEL_Z],
	[-WHEEL_X, WHEEL_RADIUS, -WHEEL_Z],
	[WHEEL_X, WHEEL_RADIUS, -WHEEL_Z]
]

const rimSlotAngles = [0, 1, 2, 3, 4, 5, 6, 7].map((index) => (index / 8) * Math.PI * 2)

const Wheel = (props: { position: Vector3TupleT; geometry: VehicleGeometryT }) => {
	const rubber = getRubber()
	const chrome = getChrome()
	const darkMetal = getMatte('#2a2c30')
	const side = props.position[0] < 0 ? -1 : 1
	const hubPosition: Vector3TupleT = [side * 0.118, 0, 0]
	const hubTurn = side < 0 ? Math.PI : 0
	const hubRotation: Vector3TupleT = [0, 0, hubTurn]

	const slots = rimSlotAngles.map((angle) => {
		const slotPosition: Vector3TupleT = [0, Math.sin(angle) * 0.135, Math.cos(angle) * 0.135]
		return <Part key={angle} geometry={props.geometry.rimSlot} material={darkMetal} position={slotPosition} />
	})

	return (
		<group position={props.position}>
			<Part geometry={props.geometry.tireRing} material={rubber} />
			<Part geometry={props.geometry.tireCore} material={rubber} />
			<Part geometry={props.geometry.rim} material={chrome} />
			{slots}
			<Part geometry={props.geometry.hubCap} material={chrome} position={hubPosition} rotation={hubRotation} />
		</group>
	)
}

const FrontEnd = (props: { geometry: VehicleGeometryT; paint: Material }) => {
	const isNight = useIsNight()
	const lensGlow = isNight ? 3 : 0.35
	const lensMaterial = getGlow('#fff4d6', lensGlow)
	const indicatorMaterial = getGlow('#f0a13a', 0.4)
	const chrome = getChrome()
	const grilleMaterial = getMatte('#1e2023')
	const sides = [-1, 1]
	const grilleBarHeights = [0.72, 0.8, 0.88]

	const lights = sides.map((side) => {
		const lightPosition: Vector3TupleT = [side * 0.6, 0.82, BODY_FRONT + 0.03]
		const indicatorPosition: Vector3TupleT = [side * 0.6, 0.62, BODY_FRONT + 0.02]
		return (
			<group key={side}>
				<Part geometry={props.geometry.bezel} material={chrome} position={lightPosition} />
				<Part geometry={props.geometry.lens} material={lensMaterial} position={lightPosition} />
				<Part geometry={props.geometry.indicator} material={indicatorMaterial} position={indicatorPosition} />
			</group>
		)
	})

	const grilleBars = grilleBarHeights.map((height) => {
		const barPosition: Vector3TupleT = [0, height, BODY_FRONT + 0.035]
		return <Part key={height} geometry={props.geometry.grilleBar} material={chrome} position={barPosition} />
	})

	return (
		<group>
			<Part geometry={props.geometry.grille} material={grilleMaterial} position={[0, 0.8, BODY_FRONT + 0.01]} />
			{grilleBars}
			{lights}
			<Part geometry={props.geometry.bumper} material={chrome} position={[0, 0.5, BODY_FRONT + 0.06]} />
			{isNight && <spotLight position={[0, 0.85, BODY_FRONT + 0.2]} angle={0.5} penumbra={0.6} intensity={18} distance={12} color="#fff1cc" />}
		</group>
	)
}

const RearEnd = (props: { geometry: VehicleGeometryT; hasSpare: boolean; spareMaterial: Material }) => {
	const tailMaterial = getGlow('#c0261d', 0.5)
	const chrome = getChrome()
	const sides = [-1, 1]

	const tails = sides.map((side) => {
		const tailPosition: Vector3TupleT = [side * 0.74, 0.78, BODY_REAR - 0.03]
		return <Part key={side} geometry={props.geometry.tailLight} material={tailMaterial} position={tailPosition} />
	})

	return (
		<group>
			{tails}
			<Part geometry={props.geometry.bumper} material={chrome} position={[0, 0.5, BODY_REAR - 0.06]} />
			{props.hasSpare && <Part geometry={props.geometry.spareTire} material={getRubber()} position={[0, 0.98, BODY_REAR - 0.12]} />}
			{props.hasSpare && <Part geometry={props.geometry.spareCover} material={props.spareMaterial} position={[0, 0.98, BODY_REAR - 0.12]} rotation={[Math.PI / 2, 0, 0]} />}
		</group>
	)
}

const SideDetails = (props: { geometry: VehicleGeometryT }) => {
	const seamMaterial = getMatte('#2a1f1c')
	const chrome = getChrome()
	const sides = [-1, 1]

	const details = sides.map((side) => {
		const outerX = side * (HALF_BODY_WIDTH + 0.004)
		return (
			<group key={side}>
				<Part geometry={props.geometry.doorSeam} material={seamMaterial} position={[outerX, 0.78, CABIN_FRONT - 0.04]} />
				<Part geometry={props.geometry.doorSeam} material={seamMaterial} position={[outerX, 0.78, -0.42]} />
				<Part geometry={props.geometry.doorHandle} material={chrome} position={[outerX + side * 0.01, 0.98, -0.3]} />
				<Part geometry={props.geometry.beltTrim} material={chrome} position={[outerX, BELT_HEIGHT - 0.02, 0]} />
				<Part geometry={props.geometry.mirrorStalk} material={chrome} position={[side * (HALF_BODY_WIDTH + 0.06), 1.16, CABIN_FRONT - 0.08]} />
				<Part geometry={props.geometry.mirrorHead} material={chrome} position={[side * (HALF_BODY_WIDTH + 0.13), 1.2, CABIN_FRONT - 0.08]} />
				<Part geometry={props.geometry.chargePort} material={getMatte('#1e2023')} position={[outerX, 0.92, -1.62]} rotation={[0, 0, Math.PI / 2]} />
			</group>
		)
	})

	return <group>{details}</group>
}

const Windshield = (props: { geometry: VehicleGeometryT; frameMaterial: Material }) => {
	return (
		<group position={[0, BODY_TOP + 0.28, CABIN_FRONT + 0.02]} rotation={[-0.12, 0, 0]}>
			<Part geometry={props.geometry.windshieldRail} material={props.frameMaterial} position={[0, 0.255, 0]} />
			<Part geometry={props.geometry.windshieldRail} material={props.frameMaterial} position={[0, -0.255, 0]} />
			<Part geometry={props.geometry.windshieldPost} material={props.frameMaterial} position={[-0.785, 0, 0]} />
			<Part geometry={props.geometry.windshieldPost} material={props.frameMaterial} position={[0.785, 0, 0]} />
			<Part geometry={props.geometry.windshield} material={getGlass()} />
		</group>
	)
}

const Hardtop = (props: { geometry: VehicleGeometryT; topMaterial: Material }) => {
	const glass = getGlass()
	const topCenterY = (BODY_TOP + ROOF_HEIGHT) / 2
	const topCenterZ = CABIN_FRONT - 1.2
	const sides = [-1, 1]

	const sideWindows = sides.map((side) => {
		const windowX = side * 0.845
		return (
			<group key={side}>
				<Part geometry={props.geometry.sideWindowFront} material={glass} position={[windowX, topCenterY + 0.02, 0.18]} />
				<Part geometry={props.geometry.sideWindowRear} material={glass} position={[windowX, topCenterY + 0.02, -1.0]} />
			</group>
		)
	})

	return (
		<group>
			<Part geometry={props.geometry.hardtop} material={props.topMaterial} position={[0, topCenterY, topCenterZ]} />
			<Part geometry={props.geometry.windshield} material={glass} position={[0, topCenterY + 0.02, CABIN_FRONT + 0.005]} />
			<Part geometry={props.geometry.rearWindow} material={glass} position={[0, topCenterY + 0.02, topCenterZ - 1.205]} />
			{sideWindows}
		</group>
	)
}

const CabTop = (props: { geometry: VehicleGeometryT; topMaterial: Material }) => {
	const glass = getGlass()
	const topCenterY = (BODY_TOP + ROOF_HEIGHT) / 2
	const topCenterZ = CABIN_FRONT - 0.45

	return (
		<group>
			<Part geometry={props.geometry.cabTop} material={props.topMaterial} position={[0, topCenterY, topCenterZ]} />
			<Part geometry={props.geometry.windshield} material={glass} position={[0, topCenterY + 0.02, CABIN_FRONT + 0.005]} />
			<Part geometry={props.geometry.rearWindow} material={glass} position={[0, topCenterY + 0.02, topCenterZ - 0.455]} />
			<Part geometry={props.geometry.sideWindowFront} material={glass} position={[-0.845, topCenterY + 0.02, topCenterZ]} />
			<Part geometry={props.geometry.sideWindowFront} material={glass} position={[0.845, topCenterY + 0.02, topCenterZ]} />
			<Part geometry={props.geometry.bedFloor} material={getMatte('#2a2c30')} position={[0, BODY_TOP + 0.012, -1.15]} />
		</group>
	)
}

const OpenCabin = (props: { geometry: VehicleGeometryT; paint: Material; seatColor: string }) => {
	const seatMaterial = getMatte(props.seatColor)
	const darkMaterial = getMatte('#24262a')
	const sides = [-1, 1]

	const frontSeats = sides.map((side) => {
		const seatX = side * 0.36
		return (
			<group key={side}>
				<Part geometry={props.geometry.seatBase} material={seatMaterial} position={[seatX, BODY_TOP + 0.07, -0.05]} />
				<Part geometry={props.geometry.bucketSeat} material={seatMaterial} position={[seatX, BODY_TOP + 0.3, -0.29]} rotation={[-0.12, 0, 0]} />
			</group>
		)
	})

	return (
		<group>
			<Part geometry={props.geometry.cabinFloor} material={darkMaterial} position={[0, BODY_TOP + 0.012, -0.72]} />
			{frontSeats}
			<Part geometry={props.geometry.benchBase} material={seatMaterial} position={[0, BODY_TOP + 0.07, -1.3]} />
			<Part geometry={props.geometry.benchBack} material={seatMaterial} position={[0, BODY_TOP + 0.3, -1.55]} rotation={[-0.12, 0, 0]} />
			<Part geometry={props.geometry.steeringWheel} material={darkMaterial} position={[-0.36, BODY_TOP + 0.3, 0.3]} rotation={[-0.5, 0, 0]} />
			<Part geometry={props.geometry.rollBar} material={darkMaterial} />
			<Windshield geometry={props.geometry} frameMaterial={props.paint} />
		</group>
	)
}

const VehicleTop = {
	hardtop: 'hardtop',
	open: 'open',
	pickup: 'pickup'
} as const

type VehicleTopT = (typeof VehicleTop)[keyof typeof VehicleTop]

type CruiserPropsT = {
	paintColor: string
	topColor: string
	top: VehicleTopT
}

const Cruiser = (props: CruiserPropsT) => {
	const geometry = getVehicleGeometry()
	const paint = getCarPaint(props.paintColor)
	const topMaterial = getCarPaint(props.topColor)
	const isHardtop = props.top === VehicleTop.hardtop
	const isOpen = props.top === VehicleTop.open
	const isPickup = props.top === VehicleTop.pickup
	const hasSpare = !isPickup

	const wheels = wheelSpots.map((spot) => {
		return <Wheel key={spot.join(':')} position={spot} geometry={geometry} />
	})

	return (
		<group>
			<Part geometry={geometry.chassis} material={getMatte('#1c1d20')} position={[0, 0.42, 0]} />
			<Part geometry={geometry.body} material={paint} />
			{wheels}
			<FrontEnd geometry={geometry} paint={paint} />
			<RearEnd geometry={geometry} hasSpare={hasSpare} spareMaterial={topMaterial} />
			<SideDetails geometry={geometry} />
			{isHardtop && <Hardtop geometry={geometry} topMaterial={topMaterial} />}
			{isPickup && <CabTop geometry={geometry} topMaterial={topMaterial} />}
			{isOpen && <OpenCabin geometry={geometry} paint={paint} seatColor={props.topColor} />}
		</group>
	)
}

export const CruiserRed = () => {
	return <Cruiser paintColor="#b8231b" topColor="#f2efe8" top="hardtop" />
}

export const CruiserSage = () => {
	return <Cruiser paintColor="#8fa58a" topColor="#f2efe8" top="hardtop" />
}

export const CruiserSky = () => {
	return <Cruiser paintColor="#7fb2d6" topColor="#e9dcc4" top="open" />
}

export const CruiserSand = () => {
	return <Cruiser paintColor="#d2b48a" topColor="#f2efe8" top="pickup" />
}

export const CruiserBlack = () => {
	return <Cruiser paintColor="#1d1f22" topColor="#d9d4c9" top="hardtop" />
}
