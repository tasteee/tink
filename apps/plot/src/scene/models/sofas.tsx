import { CanvasTexture, CylinderGeometry, ExtrudeGeometry, MeshStandardMaterial, RepeatWrapping, Shape, SphereGeometry, SRGBColorSpace, TorusGeometry } from 'three'
import type { BufferGeometry, Material } from 'three'
import { buildRange, buildSphereCloud, buildTube, getCachedGeometry, getRoundedBox } from './geometryKit'
import type { PointT } from './geometryKit'
import { getFabric, getGold, getMatte, getRhinestone, getVelvet, getVelvetShadow } from './materials'
import type { Vector3TupleT } from './parts'

// Medium-detail sofas. Both face +Z and are centered on their
// footprint: the rococo throne is 2x1 tiles, the sectional 3x2.

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

// ---------------------------------------------------------------
// Rococo throne sofa
// ---------------------------------------------------------------

const BACK_HALF_WIDTH = 0.96
const SEAT_TOP = 0.45
const BACK_FRONT_Z = -0.215
const BACK_DEPTH = 0.14

const gauss = (value: number, center: number, spread: number): number => {
	const distance = (value - center) / spread
	return Math.exp(-distance * distance)
}

// Height of the carved back's top edge across its width: a tall
// center crest, shallow dips, and raised scroll ends.
const getCrestHeight = (x: number): number => {
	const distanceFromCenter = Math.abs(x)
	const crest = 0.26 * gauss(x, 0, 0.17)
	const shoulders = 0.06 * gauss(distanceFromCenter, 0.36, 0.14)
	const dips = -0.08 * gauss(distanceFromCenter, 0.64, 0.12)
	const scrollEnds = 0.16 * gauss(distanceFromCenter, 0.93, 0.09)
	return 0.86 + crest + shoulders + dips + scrollEnds
}

const crestSamples = buildRange(-BACK_HALF_WIDTH, BACK_HALF_WIDTH, 0.04)

const buildBackPanel = (): BufferGeometry => {
	const shape = new Shape()
	shape.moveTo(-BACK_HALF_WIDTH, SEAT_TOP)
	for (const x of crestSamples) shape.lineTo(x, getCrestHeight(x))
	shape.lineTo(BACK_HALF_WIDTH, SEAT_TOP)
	shape.lineTo(-BACK_HALF_WIDTH, SEAT_TOP)

	const extrudeSettings = { depth: BACK_DEPTH, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.03, bevelSegments: 4, curveSegments: 8 }
	const geometry = new ExtrudeGeometry(shape, extrudeSettings)
	geometry.translate(0, 0, BACK_FRONT_Z - BACK_DEPTH - 0.035)
	return geometry
}

// Diamond tufting: offset rows of buttons kept inside the curve.
const getBackButtonPoints = (depthOffset: number): PointT[] => {
	const rowHeights = buildRange(SEAT_TOP + 0.13, 1.18, 0.1)
	const points: PointT[] = []

	for (const rowHeight of rowHeights) {
		const isOffsetRow = rowHeights.indexOf(rowHeight) % 2 === 1
		const rowStart = isOffsetRow ? -0.84 : -0.9
		const columns = buildRange(rowStart, 0.9, 0.12)
		for (const x of columns) {
			const isInsideCurve = rowHeight < getCrestHeight(x) - 0.09
			if (isInsideCurve) points.push([x, rowHeight, BACK_FRONT_Z + depthOffset])
		}
	}

	return points
}

const getSeatButtonPoints = (heightOffset: number): PointT[] => {
	const depthRows = buildRange(-0.12, 0.2, 0.16)
	const points: PointT[] = []

	for (const z of depthRows) {
		const isOffsetRow = depthRows.indexOf(z) % 2 === 1
		const rowStart = isOffsetRow ? -0.78 : -0.84
		const columns = buildRange(rowStart, 0.84, 0.12)
		for (const x of columns) points.push([x, 0.535 + heightOffset, z])
	}

	return points
}

const getCrestTrimPoints = (depth: number): PointT[] => {
	return crestSamples.map((x) => {
		const point: PointT = [x, getCrestHeight(x) + 0.03, depth]
		return point
	})
}

const getApronPoints = (): PointT[] => {
	const samples = buildRange(-0.94, 0.94, 0.1)
	return samples.map((x) => {
		const point: PointT = [x, 0.34 - 0.05 * gauss(x, 0, 0.22), 0.335]
		return point
	})
}

// Cabriole leg: a gentle S that kicks out at the knee.
const cabrioleLegPoints: PointT[] = [
	[0, 0.36, 0],
	[0.035, 0.27, 0.035],
	[0.01, 0.16, 0.01],
	[-0.025, 0.07, -0.02],
	[0.01, 0.02, 0.02]
]

const getRococoGeometry = () => {
	return {
		back: getCachedGeometry('rococo:back', buildBackPanel),
		backDimples: getCachedGeometry('rococo:backDimples', () => buildSphereCloud(getBackButtonPoints(-0.008), 0.024)),
		backButtons: getCachedGeometry('rococo:backButtons', () => buildSphereCloud(getBackButtonPoints(0.006), 0.012)),
		seatDimples: getCachedGeometry('rococo:seatDimples', () => buildSphereCloud(getSeatButtonPoints(-0.006), 0.022)),
		seatButtons: getCachedGeometry('rococo:seatButtons', () => buildSphereCloud(getSeatButtonPoints(0.006), 0.011)),
		frontTrim: getCachedGeometry('rococo:frontTrim', () => buildTube(getCrestTrimPoints(BACK_FRONT_Z + 0.01), 0.026, false)),
		rearTrim: getCachedGeometry('rococo:rearTrim', () => buildTube(getCrestTrimPoints(BACK_FRONT_Z - BACK_DEPTH - 0.06), 0.022, false)),
		apron: getCachedGeometry('rococo:apron', () => buildTube(getApronPoints(), 0.03, false)),
		leg: getCachedGeometry('rococo:leg', () => buildTube(cabrioleLegPoints, 0.034, false)),
		foot: getCachedGeometry('rococo:foot', () => new SphereGeometry(0.045, 12, 8)),
		seat: getRoundedBox(1.84, 0.17, 0.6, 0.06),
		seatBase: getRoundedBox(1.8, 0.12, 0.56, 0.03),
		armRoll: getCachedGeometry('rococo:armRoll', () => new CylinderGeometry(0.115, 0.115, 0.62, 24)),
		armPanel: getRoundedBox(0.12, 0.26, 0.6, 0.04),
		scroll: getCachedGeometry('rococo:scroll', () => new TorusGeometry(0.075, 0.02, 8, 24)),
		scrollBoss: getCachedGeometry('rococo:scrollBoss', () => new SphereGeometry(0.035, 12, 8)),
		crestRing: getCachedGeometry('rococo:crestRing', () => new TorusGeometry(0.07, 0.022, 10, 28)),
		crestLeaf: getCachedGeometry('rococo:crestLeaf', () => new SphereGeometry(0.05, 12, 8)),
		medallion: getRoundedBox(0.16, 0.14, 0.05, 0.02)
	}
}

const legCorners: Vector3TupleT[] = [
	[-0.82, 0, -0.22],
	[0.82, 0, -0.22],
	[-0.82, 0, 0.24],
	[0.82, 0, 0.24]
]

const crestLeafAngles = [-0.9, -0.45, 0, 0.45, 0.9]

type RococoPropsT = {
	velvetColor: string
	frameMaterial: Material
}

const RococoLegs = (props: { geometry: ReturnType<typeof getRococoGeometry>; frameMaterial: Material }) => {
	const legs = legCorners.map((corner) => {
		const mirrorX = corner[0] < 0 ? -1 : 1
		const mirrorZ = corner[2] < 0 ? -1 : 1
		const scale: Vector3TupleT = [mirrorX, 1, mirrorZ]
		const footPosition: Vector3TupleT = [corner[0] + 0.01 * mirrorX, 0.03, corner[2] + 0.02 * mirrorZ]
		return (
			<group key={corner.join(':')}>
				<Part geometry={props.geometry.leg} material={props.frameMaterial} position={corner} scale={scale} />
				<Part geometry={props.geometry.foot} material={props.frameMaterial} position={footPosition} />
			</group>
		)
	})

	return <group>{legs}</group>
}

const RococoArms = (props: { geometry: ReturnType<typeof getRococoGeometry>; velvet: Material; frameMaterial: Material }) => {
	const sides = [-1, 1]

	const arms = sides.map((side) => {
		const rollPosition: Vector3TupleT = [side * 0.88, 0.7, 0.02]
		const panelPosition: Vector3TupleT = [side * 0.9, 0.56, 0.02]
		const scrollPosition: Vector3TupleT = [side * 0.88, 0.7, 0.335]
		const bossPosition: Vector3TupleT = [side * 0.88, 0.7, 0.35]
		return (
			<group key={side}>
				<Part geometry={props.geometry.armRoll} material={props.velvet} position={rollPosition} rotation={[Math.PI / 2, 0, 0]} />
				<Part geometry={props.geometry.armPanel} material={props.velvet} position={panelPosition} />
				<Part geometry={props.geometry.scroll} material={props.frameMaterial} position={scrollPosition} />
				<Part geometry={props.geometry.scrollBoss} material={props.frameMaterial} position={bossPosition} />
			</group>
		)
	})

	return <group>{arms}</group>
}

const RococoCrest = (props: { geometry: ReturnType<typeof getRococoGeometry>; frameMaterial: Material }) => {
	const crestTop = getCrestHeight(0)

	const leaves = crestLeafAngles.map((angle) => {
		const leafPosition: Vector3TupleT = [Math.sin(angle) * 0.1, crestTop + 0.06 + Math.cos(angle) * 0.08, -0.3]
		const leafRotation: Vector3TupleT = [0, 0, -angle]
		const leafScale: Vector3TupleT = [0.55, 1.3, 0.6]
		return <Part key={angle} geometry={props.geometry.crestLeaf} material={props.frameMaterial} position={leafPosition} rotation={leafRotation} scale={leafScale} />
	})

	return (
		<group>
			<Part geometry={props.geometry.crestRing} material={props.frameMaterial} position={[0, crestTop + 0.02, -0.21]} />
			{leaves}
		</group>
	)
}

const RococoSofa = (props: RococoPropsT) => {
	const geometry = getRococoGeometry()
	const velvet = getVelvet(props.velvetColor)
	const velvetShadow = getVelvetShadow(props.velvetColor)
	const rhinestone = getRhinestone()

	return (
		<group>
			<RococoLegs geometry={geometry} frameMaterial={props.frameMaterial} />
			<Part geometry={geometry.seatBase} material={velvet} position={[0, 0.39, 0.03]} />
			<Part geometry={geometry.apron} material={props.frameMaterial} />
			<Part geometry={geometry.medallion} material={props.frameMaterial} position={[0, 0.29, 0.33]} />
			<Part geometry={geometry.seat} material={velvet} position={[0, 0.45, 0.04]} />
			<Part geometry={geometry.seatDimples} material={velvetShadow} />
			<Part geometry={geometry.seatButtons} material={rhinestone} />
			<Part geometry={geometry.back} material={velvet} />
			<Part geometry={geometry.backDimples} material={velvetShadow} />
			<Part geometry={geometry.backButtons} material={rhinestone} />
			<Part geometry={geometry.frontTrim} material={props.frameMaterial} />
			<Part geometry={geometry.rearTrim} material={props.frameMaterial} />
			<RococoArms geometry={geometry} velvet={velvet} frameMaterial={props.frameMaterial} />
			<RococoCrest geometry={geometry} frameMaterial={props.frameMaterial} />
		</group>
	)
}

export const RococoRoyal = () => {
	return <RococoSofa velvetColor="#1f4fa3" frameMaterial={getGold()} />
}

export const RococoEmerald = () => {
	return <RococoSofa velvetColor="#1d6b4f" frameMaterial={getGold()} />
}

export const RococoBlush = () => {
	return <RococoSofa velvetColor="#d99aa5" frameMaterial={getMatte('#e8e2d6')} />
}

// ---------------------------------------------------------------
// Tufted L sectional
// ---------------------------------------------------------------

// Quilted diamond stitching for the throw pillows.
let quiltedMaterial: MeshStandardMaterial | null = null

const getQuiltedMaterial = (): MeshStandardMaterial => {
	if (quiltedMaterial !== null) return quiltedMaterial

	const canvas = document.createElement('canvas')
	canvas.width = 64
	canvas.height = 64
	const context = canvas.getContext('2d')
	if (context !== null) {
		context.fillStyle = '#efe6d6'
		context.fillRect(0, 0, 64, 64)
		context.strokeStyle = '#c9bca6'
		context.lineWidth = 2
		context.beginPath()
		context.moveTo(0, 0)
		context.lineTo(64, 64)
		context.moveTo(64, 0)
		context.lineTo(0, 64)
		context.stroke()
	}

	const texture = new CanvasTexture(canvas)
	texture.colorSpace = SRGBColorSpace
	texture.wrapS = RepeatWrapping
	texture.wrapT = RepeatWrapping
	texture.repeat.set(4, 4)
	quiltedMaterial = new MeshStandardMaterial({ map: texture, roughness: 0.95 })
	return quiltedMaterial
}

// Channel stitching: grooves across a seat cushion's top.
const getChannelGroovePoints = (depth: number): number[] => {
	return buildRange(-depth / 2 + 0.1, depth / 2 - 0.1, 0.11)
}

const getSectionalGeometry = () => {
	return {
		backRunBase: getRoundedBox(2.05, 0.26, 0.92, 0.05),
		returnBase: getRoundedBox(0.95, 0.26, 2.0, 0.05),
		backRest: getRoundedBox(3.0, 0.56, 0.24, 0.08),
		sideRest: getRoundedBox(0.24, 0.56, 1.76, 0.08),
		backRoll: getCachedGeometry('sectional:backRoll', () => new CylinderGeometry(0.09, 0.09, 3.0, 20)),
		sideRoll: getCachedGeometry('sectional:sideRoll', () => new CylinderGeometry(0.09, 0.09, 1.76, 20)),
		seatCushion: getRoundedBox(0.94, 0.15, 0.66, 0.05),
		cornerCushion: getRoundedBox(0.66, 0.15, 0.66, 0.05),
		returnCushion: getRoundedBox(0.66, 0.15, 0.86, 0.05),
		groove: getRoundedBox(0.86, 0.012, 0.014, 0.004),
		returnGroove: getRoundedBox(0.58, 0.012, 0.014, 0.004),
		armBlock: getRoundedBox(0.18, 0.5, 0.92, 0.06),
		armRoll: getCachedGeometry('sectional:armRoll', () => new CylinderGeometry(0.12, 0.12, 0.92, 20)),
		returnArmBlock: getRoundedBox(0.95, 0.5, 0.18, 0.06),
		returnArmRoll: getCachedGeometry('sectional:returnArmRoll', () => new CylinderGeometry(0.12, 0.12, 0.95, 20)),
		pillow: getRoundedBox(0.46, 0.38, 0.12, 0.06),
		lumbar: getRoundedBox(0.52, 0.26, 0.11, 0.05),
		leg: getCachedGeometry('sectional:leg', () => new CylinderGeometry(0.025, 0.02, 0.07, 10)),
		backTufts: getCachedGeometry('sectional:backTufts', () => buildSphereCloud(getSectionalBackTufts(), 0.022)),
		sideTufts: getCachedGeometry('sectional:sideTufts', () => buildSphereCloud(getSectionalSideTufts(), 0.022)),
		armTufts: getCachedGeometry('sectional:armTufts', () => buildSphereCloud(getSectionalArmTufts(), 0.02))
	}
}

const getSectionalBackTufts = (): PointT[] => {
	const points: PointT[] = []
	const rows = [0.66, 0.8]
	for (const y of rows) {
		const isOffsetRow = rows.indexOf(y) % 2 === 1
		const rowStart = isOffsetRow ? -1.1 : -1.18
		for (const x of buildRange(rowStart, 1.3, 0.16)) points.push([x, y, -0.758])
	}
	return points
}

const getSectionalSideTufts = (): PointT[] => {
	const points: PointT[] = []
	const rows = [0.66, 0.8]
	for (const y of rows) {
		const isOffsetRow = rows.indexOf(y) % 2 === 1
		const rowStart = isOffsetRow ? -0.62 : -0.7
		for (const z of buildRange(rowStart, 0.78, 0.16)) points.push([-1.258, y, z])
	}
	return points
}

const getSectionalArmTufts = (): PointT[] => {
	const points: PointT[] = []
	for (const y of [0.42, 0.56]) {
		for (const x of [-1.2, -1.02, -0.84]) points.push([x, y, 1.0])
		for (const z of [-0.8, -0.62, -0.44]) points.push([1.5, y, z])
	}
	return points
}

const sectionalLegSpots: Vector3TupleT[] = [
	[-1.42, 0.035, -0.92],
	[1.42, 0.035, -0.92],
	[1.42, 0.035, -0.18],
	[-1.42, 0.035, 0.92],
	[-0.62, 0.035, 0.92],
	[-0.62, 0.035, -0.18]
]

type CushionSpotT = { position: Vector3TupleT; kind: 'seat' | 'corner' | 'return' }

const sectionalCushions: CushionSpotT[] = [
	{ position: [-0.1, 0.42, -0.42], kind: 'seat' },
	{ position: [0.85, 0.42, -0.42], kind: 'seat' },
	{ position: [-0.92, 0.42, -0.42], kind: 'corner' },
	{ position: [-0.92, 0.42, 0.36], kind: 'return' }
]

type PillowSpotT = { position: Vector3TupleT; rotation: Vector3TupleT; isLumbar: boolean }

const sectionalPillows: PillowSpotT[] = [
	{ position: [-0.95, 0.68, -0.68], rotation: [-0.3, 0.6, 0], isLumbar: false },
	{ position: [0.15, 0.66, -0.68], rotation: [-0.32, 0, 0.06], isLumbar: false },
	{ position: [0.85, 0.62, -0.68], rotation: [-0.3, 0, -0.04], isLumbar: true },
	{ position: [1.2, 0.66, -0.66], rotation: [-0.32, -0.2, 0], isLumbar: false },
	{ position: [-1.12, 0.66, 0.3], rotation: [0, Math.PI / 2, 0.3], isLumbar: false },
	{ position: [-1.12, 0.62, 0.7], rotation: [0, Math.PI / 2, 0.28], isLumbar: true }
]

const SectionalCushion = (props: { spot: CushionSpotT; geometry: ReturnType<typeof getSectionalGeometry>; velvet: Material; stitch: Material }) => {
	const cushionShapes = {
		seat: { cushion: props.geometry.seatCushion, groove: props.geometry.groove, depth: 0.66 },
		corner: { cushion: props.geometry.cornerCushion, groove: props.geometry.returnGroove, depth: 0.66 },
		return: { cushion: props.geometry.returnCushion, groove: props.geometry.returnGroove, depth: 0.86 }
	}
	const cushionShape = cushionShapes[props.spot.kind]
	const cushionGeometry = cushionShape.cushion
	const grooveGeometry = cushionShape.groove
	const grooveDepths = getChannelGroovePoints(cushionShape.depth)

	const grooves = grooveDepths.map((zOffset) => {
		const groovePosition: Vector3TupleT = [0, 0.076, zOffset]
		return <Part key={zOffset} geometry={grooveGeometry} material={props.stitch} position={groovePosition} />
	})

	return (
		<group position={props.spot.position}>
			<Part geometry={cushionGeometry} material={props.velvet} />
			{grooves}
		</group>
	)
}

type SectionalPropsT = {
	velvetColor: string
	pillowMaterial: Material
	legColor: string
}

const TuftedSectional = (props: SectionalPropsT) => {
	const geometry = getSectionalGeometry()
	const velvet = getVelvet(props.velvetColor)
	const velvetShadow = getVelvetShadow(props.velvetColor)
	const legMaterial = getMatte(props.legColor)

	const legs = sectionalLegSpots.map((spot) => {
		return <Part key={spot.join(':')} geometry={geometry.leg} material={legMaterial} position={spot} />
	})

	const cushions = sectionalCushions.map((spot) => {
		return <SectionalCushion key={spot.position.join(':')} spot={spot} geometry={geometry} velvet={velvet} stitch={velvetShadow} />
	})

	const pillows = sectionalPillows.map((spot) => {
		const pillowGeometry = spot.isLumbar ? geometry.lumbar : geometry.pillow
		return <Part key={spot.position.join(':')} geometry={pillowGeometry} material={props.pillowMaterial} position={spot.position} rotation={spot.rotation} />
	})

	return (
		<group>
			{legs}
			<Part geometry={geometry.backRunBase} material={velvet} position={[0.475, 0.2, -0.54]} />
			<Part geometry={geometry.returnBase} material={velvet} position={[-1.025, 0.2, 0]} />
			{cushions}
			<Part geometry={geometry.backRest} material={velvet} position={[0, 0.66, -0.88]} />
			<Part geometry={geometry.backRoll} material={velvet} position={[0, 0.95, -0.88]} rotation={[0, 0, Math.PI / 2]} />
			<Part geometry={geometry.backTufts} material={velvetShadow} />
			<Part geometry={geometry.sideRest} material={velvet} position={[-1.38, 0.66, 0.02]} />
			<Part geometry={geometry.sideRoll} material={velvet} position={[-1.38, 0.95, 0.02]} rotation={[Math.PI / 2, 0, 0]} />
			<Part geometry={geometry.sideTufts} material={velvetShadow} />
			<Part geometry={geometry.armBlock} material={velvet} position={[1.41, 0.42, -0.54]} />
			<Part geometry={geometry.armRoll} material={velvet} position={[1.41, 0.66, -0.54]} rotation={[Math.PI / 2, 0, 0]} />
			<Part geometry={geometry.returnArmBlock} material={velvet} position={[-1.025, 0.42, 0.91]} />
			<Part geometry={geometry.returnArmRoll} material={velvet} position={[-1.025, 0.66, 0.91]} rotation={[0, 0, Math.PI / 2]} />
			<Part geometry={geometry.armTufts} material={velvetShadow} />
			{pillows}
		</group>
	)
}

export const SectionalBlush = () => {
	return <TuftedSectional velvetColor="#c98579" pillowMaterial={getQuiltedMaterial()} legColor="#e8e4dc" />
}

export const SectionalNavy = () => {
	return <TuftedSectional velvetColor="#24356b" pillowMaterial={getQuiltedMaterial()} legColor="#c9a65a" />
}

export const SectionalIvory = () => {
	return <TuftedSectional velvetColor="#e9e1d2" pillowMaterial={getFabric('#9c8a74')} legColor="#3a2c22" />
}
