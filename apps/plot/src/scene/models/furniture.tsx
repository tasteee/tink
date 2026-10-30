import { useIsNight } from '../../game/store'
import { Ball, Block, Cone, Cylinder } from './parts'
import type { Vector3TupleT } from './parts'
import type { ModelPropsT } from './trees'

// Furniture is modelled facing +Z, centered on its footprint.

const LEG_COLOR = '#3a2c22'

type LegsPropsT = {
	width: number
	depth: number
	height: number
	color: string
}

const Legs = (props: LegsPropsT) => {
	const halfWidth = props.width / 2
	const halfDepth = props.depth / 2
	const legY = props.height / 2
	const corners: Vector3TupleT[] = [
		[-halfWidth, legY, -halfDepth],
		[halfWidth, legY, -halfDepth],
		[-halfWidth, legY, halfDepth],
		[halfWidth, legY, halfDepth]
	]

	const legs = corners.map((corner) => {
		const legKey = corner.join(':')
		return <Block key={legKey} size={[0.06, props.height, 0.06]} position={corner} color={props.color} />
	})

	return <group>{legs}</group>
}

type SeatPropsT = {
	width: number
	color: string
	cushionColor: string
	cushionCount: number
}

// Shared sofa / armchair body.
const UpholsteredSeat = (props: SeatPropsT) => {
	const innerWidth = props.width - 0.3
	const cushionWidth = innerWidth / props.cushionCount
	const armX = props.width / 2 - 0.08
	const cushionIndexes = Array.from({ length: props.cushionCount }, (_unused, index) => index)

	const cushions = cushionIndexes.map((index) => {
		const cushionX = -innerWidth / 2 + cushionWidth * (index + 0.5)
		const position: Vector3TupleT = [cushionX, 0.42, 0.06]
		return <Block key={index} size={[cushionWidth - 0.03, 0.12, 0.6]} position={position} color={props.cushionColor} />
	})

	return (
		<group>
			<Legs width={props.width - 0.16} depth={0.64} height={0.12} color={LEG_COLOR} />
			<Block size={[props.width, 0.24, 0.78]} position={[0, 0.24, 0]} color={props.color} />
			{cushions}
			<Block size={[props.width, 0.5, 0.18]} position={[0, 0.6, -0.3]} color={props.color} />
			<Block size={[0.16, 0.34, 0.78]} position={[-armX, 0.45, 0]} color={props.color} />
			<Block size={[0.16, 0.34, 0.78]} position={[armX, 0.45, 0]} color={props.color} />
		</group>
	)
}

export const Sofa = () => {
	return <UpholsteredSeat width={1.8} color="#4f6ea8" cushionColor="#6a88c2" cushionCount={2} />
}

export const Armchair = () => {
	return <UpholsteredSeat width={0.86} color="#b86d47" cushionColor="#d08660" cushionCount={1} />
}

export const DiningTable = () => {
	return (
		<group>
			<Legs width={1.6} depth={0.62} height={0.72} color="#7d5435" />
			<Block size={[1.82, 0.06, 0.84]} position={[0, 0.75, 0]} color="#9a6a43" roughness={0.6} />
			<Cylinder radiusTop={0.08} radiusBottom={0.06} height={0.16} position={[0.3, 0.86, 0]} color="#e9e4da" />
			<Ball radius={0.08} position={[0.3, 0.98, 0]} color="#e7708f" />
			<Block size={[0.36, 0.01, 0.26]} position={[-0.4, 0.785, 0]} color="#efe7d8" />
		</group>
	)
}

export const Chair = () => {
	return (
		<group>
			<Legs width={0.4} depth={0.4} height={0.44} color="#8a6240" />
			<Block size={[0.48, 0.05, 0.48]} position={[0, 0.46, 0]} color="#b48a5e" />
			<Block size={[0.48, 0.5, 0.05]} position={[0, 0.74, -0.22]} color="#b48a5e" />
		</group>
	)
}

// Single bed: footprint is 1 wide by 2 deep, headboard at -Z.
export const Bed = () => {
	return (
		<group>
			<Block size={[0.95, 0.26, 1.92]} position={[0, 0.17, 0]} color="#8a6240" />
			<Block size={[0.95, 0.9, 0.08]} position={[0, 0.45, -0.94]} color="#7a5236" />
			<Block size={[0.88, 0.16, 1.82]} position={[0, 0.38, 0.02]} color="#f5f2ec" />
			<Block size={[0.92, 0.06, 1.12]} position={[0, 0.48, 0.38]} color="#9b7fd6" />
			<Block size={[0.92, 0.07, 0.12]} position={[0, 0.48, -0.2]} color="#f0ecf7" />
			<Block size={[0.6, 0.12, 0.3]} position={[0, 0.52, -0.68]} color="#ffffff" />
		</group>
	)
}

const bookColors = ['#c4553f', '#3f6fae', '#e1b64a', '#4c8a5a', '#8b5fa8', '#d9d3c7']
const shelfHeights = [0.22, 0.66, 1.1, 1.54]

const BookRow = (props: { shelfIndex: number }) => {
	const bookIndexes = [0, 1, 2, 3, 4, 5, 6]
	const shelfY = shelfHeights[props.shelfIndex]

	const books = bookIndexes.map((bookIndex) => {
		const colorIndex = (bookIndex * 3 + props.shelfIndex) % bookColors.length
		const bookHeight = 0.26 + ((bookIndex + props.shelfIndex) % 3) * 0.04
		const bookX = -0.34 + bookIndex * 0.1
		const position: Vector3TupleT = [bookX, shelfY + bookHeight / 2, 0.02]
		return <Block key={bookIndex} size={[0.08, bookHeight, 0.24]} position={position} color={bookColors[colorIndex]} />
	})

	return <group>{books}</group>
}

export const Bookshelf = () => {
	const rows = shelfHeights.map((_height, shelfIndex) => {
		return <BookRow key={shelfIndex} shelfIndex={shelfIndex} />
	})

	const shelves = shelfHeights.map((shelfHeight) => {
		const position: Vector3TupleT = [0, shelfHeight - 0.02, 0]
		return <Block key={shelfHeight} size={[0.84, 0.04, 0.32]} position={position} color="#7a5236" />
	})

	return (
		<group position={[0, 0, -0.28]}>
			<Block size={[0.9, 1.9, 0.04]} position={[0, 0.95, -0.16]} color="#5f3f29" />
			<Block size={[0.04, 1.9, 0.36]} position={[-0.43, 0.95, 0]} color="#7a5236" />
			<Block size={[0.04, 1.9, 0.36]} position={[0.43, 0.95, 0]} color="#7a5236" />
			<Block size={[0.9, 0.04, 0.36]} position={[0, 1.9, 0]} color="#7a5236" />
			{shelves}
			{rows}
		</group>
	)
}

export const FloorLamp = () => {
	const isNight = useIsNight()
	const bulbGlow = isNight ? 2.5 : 0.2
	const shadeGlow = isNight ? 0.9 : 0

	return (
		<group>
			<Cylinder radiusTop={0.16} radiusBottom={0.18} height={0.04} position={[0, 0.02, 0]} color="#2e2e33" segments={12} />
			<Cylinder radiusTop={0.02} radiusBottom={0.02} height={1.4} position={[0, 0.72, 0]} color="#2e2e33" segments={6} />
			<Cylinder radiusTop={0.14} radiusBottom={0.24} height={0.3} position={[0, 1.5, 0]} color="#f3e3b8" segments={10} emissive="#ffcf7a" emissiveIntensity={shadeGlow} />
			<Cylinder radiusTop={0.05} radiusBottom={0.05} height={0.08} position={[0, 1.38, 0]} color="#fff6d8" emissive="#ffd98a" emissiveIntensity={bulbGlow} />
			{isNight && <pointLight position={[0, 1.35, 0]} color="#ffcf7a" intensity={6} distance={6} decay={1.6} />}
		</group>
	)
}

const leafAngles = [0, 1, 2, 3, 4]

const Leaf = (props: { index: number }) => {
	const angle = (props.index / leafAngles.length) * Math.PI * 2
	const rotation: Vector3TupleT = [0, angle, 0]

	return (
		<group rotation={rotation}>
			<Cone radius={0.07} height={0.55} position={[0.1, 0.62, 0]} rotation={[0, 0, -0.45]} color="#5f9a55" segments={4} />
		</group>
	)
}

export const PottedPlant = () => {
	const leaves = leafAngles.map((index) => {
		return <Leaf key={index} index={index} />
	})

	return (
		<group>
			<Cylinder radiusTop={0.2} radiusBottom={0.15} height={0.36} position={[0, 0.18, 0]} color="#c46d4a" segments={10} />
			<Cylinder radiusTop={0.18} radiusBottom={0.18} height={0.02} position={[0, 0.35, 0]} color="#4b3526" segments={10} />
			{leaves}
			<Ball radius={0.12} position={[0, 0.5, 0]} color="#4f8a46" />
		</group>
	)
}
