import { Ball, Block, Cone, Cylinder, Sway } from './parts'
import type { Vector3TupleT } from './parts'

export type ModelPropsT = { seed: number }

const BARK = '#6b4a32'
const DARK_BARK = '#4f3624'

export const OakTree = (props: ModelPropsT) => {
	return (
		<group>
			<Cylinder radiusTop={0.09} radiusBottom={0.15} height={1.3} position={[0, 0.65, 0]} color={BARK} />
			<Cylinder radiusTop={0.04} radiusBottom={0.07} height={0.6} position={[0.18, 1.25, 0]} rotation={[0, 0, -0.7]} color={BARK} />
			<Sway phase={props.seed}>
				<Ball radius={0.62} position={[0, 1.85, 0]} color="#4f8a3c" detail={1} />
				<Ball radius={0.46} position={[0.42, 1.6, 0.12]} color="#5b9a45" />
				<Ball radius={0.44} position={[-0.38, 1.66, -0.16]} color="#47803a" />
				<Ball radius={0.38} position={[0.06, 2.3, 0.18]} color="#62a24b" />
			</Sway>
		</group>
	)
}

export const PineTree = (props: ModelPropsT) => {
	return (
		<group>
			<Cylinder radiusTop={0.07} radiusBottom={0.11} height={0.7} position={[0, 0.35, 0]} color={DARK_BARK} />
			<Sway phase={props.seed} amount={0.015}>
				<Cone radius={0.72} height={1.0} position={[0, 1.0, 0]} color="#2c6544" />
				<Cone radius={0.57} height={0.9} position={[0, 1.55, 0]} color="#327150" />
				<Cone radius={0.4} height={0.8} position={[0, 2.05, 0]} color="#3a7d59" />
				<Cone radius={0.2} height={0.45} position={[0, 2.48, 0]} color="#42885f" />
			</Sway>
		</group>
	)
}

const birchBandHeights = [0.35, 0.72, 1.1, 1.5, 1.85]

const BirchBand = (props: { height: number }) => {
	const position: Vector3TupleT = [0, props.height, 0]
	return <Cylinder radiusTop={0.072} radiusBottom={0.072} height={0.05} position={position} color="#2b2b2b" />
}

export const BirchTree = (props: ModelPropsT) => {
	const bands = birchBandHeights.map((bandHeight) => {
		return <BirchBand key={bandHeight} height={bandHeight} />
	})

	return (
		<group>
			<Cylinder radiusTop={0.05} radiusBottom={0.07} height={2.2} position={[0, 1.1, 0]} color="#f1eee6" />
			{bands}
			<Sway phase={props.seed} amount={0.035}>
				<Ball radius={0.42} position={[0, 2.25, 0]} scale={[1, 1.35, 1]} color="#b8c95a" />
				<Ball radius={0.32} position={[0.28, 1.85, 0.08]} scale={[1, 1.3, 1]} color="#a3b84c" />
				<Ball radius={0.3} position={[-0.24, 1.95, -0.1]} scale={[1, 1.3, 1]} color="#c5d46a" />
			</Sway>
		</group>
	)
}

// Palm trunk: stacked segments drifting sideways so it leans.
const palmSegments = [0, 1, 2, 3, 4, 5]
const palmFrondAngles = [0, 1, 2, 3, 4, 5, 6]

const PalmSegment = (props: { index: number }) => {
	const lean = props.index * props.index * 0.012
	const height = 0.2 + props.index * 0.38
	const radius = 0.11 - props.index * 0.008
	const position: Vector3TupleT = [lean, height, 0]
	const rotation: Vector3TupleT = [0, 0, -props.index * 0.035]
	return <Cylinder radiusTop={radius * 0.85} radiusBottom={radius} height={0.4} position={position} rotation={rotation} color="#9b7a52" segments={6} />
}

const PalmFrond = (props: { index: number }) => {
	const angle = (props.index / palmFrondAngles.length) * Math.PI * 2
	const rotation: Vector3TupleT = [0, angle, 0]

	return (
		<group rotation={rotation}>
			<Block size={[0.95, 0.03, 0.26]} position={[0.42, -0.12, 0]} rotation={[0, 0, -0.38]} color="#4e9a5f" />
		</group>
	)
}

export const PalmTree = (props: ModelPropsT) => {
	const segments = palmSegments.map((index) => {
		return <PalmSegment key={index} index={index} />
	})

	const fronds = palmFrondAngles.map((index) => {
		return <PalmFrond key={index} index={index} />
	})

	return (
		<group>
			{segments}
			<group position={[0.32, 2.35, 0]}>
				<Sway phase={props.seed} amount={0.05} speed={1.6}>
					{fronds}
					<Ball radius={0.08} position={[0.06, -0.12, 0.06]} color="#6b4a2a" />
					<Ball radius={0.08} position={[-0.06, -0.12, 0.02]} color="#6b4a2a" />
				</Sway>
			</group>
		</group>
	)
}

export const CherryTree = (props: ModelPropsT) => {
	return (
		<group>
			<Cylinder radiusTop={0.08} radiusBottom={0.13} height={1.1} position={[0, 0.55, 0]} color={DARK_BARK} />
			<Cylinder radiusTop={0.04} radiusBottom={0.06} height={0.7} position={[-0.2, 1.25, 0.05]} rotation={[0.2, 0, 0.6]} color={DARK_BARK} />
			<Cylinder radiusTop={0.04} radiusBottom={0.06} height={0.7} position={[0.2, 1.25, -0.05]} rotation={[-0.2, 0, -0.6]} color={DARK_BARK} />
			<Sway phase={props.seed}>
				<Ball radius={0.5} position={[0, 1.8, 0]} color="#eaa6bd" detail={1} />
				<Ball radius={0.4} position={[-0.45, 1.6, 0.1]} color="#f2bfd0" />
				<Ball radius={0.38} position={[0.45, 1.62, -0.08]} color="#e293ad" />
				<Ball radius={0.3} position={[0.05, 2.15, 0.25]} color="#f6cddb" />
			</Sway>
		</group>
	)
}

export const Bush = (props: ModelPropsT) => {
	return (
		<Sway phase={props.seed} amount={0.02}>
			<Ball radius={0.34} position={[0, 0.3, 0]} color="#3f7d3a" detail={1} />
			<Ball radius={0.26} position={[0.24, 0.24, 0.1]} color="#4a8b43" />
			<Ball radius={0.24} position={[-0.22, 0.22, -0.08]} color="#37703a" />
		</Sway>
	)
}

const flowerColors = ['#e6c14f', '#e7708f', '#f4f1ea', '#9b7fd6', '#ef8a4c']
const flowerSpots = [
	[-0.28, -0.26],
	[0, -0.3],
	[0.28, -0.24],
	[-0.3, 0],
	[-0.04, 0.02],
	[0.26, 0.04],
	[-0.24, 0.28],
	[0.04, 0.26],
	[0.3, 0.3]
]

const Flower = (props: { spotIndex: number; seed: number }) => {
	const spot = flowerSpots[props.spotIndex]
	const colorIndex = (props.spotIndex + props.seed) % flowerColors.length
	const stemHeight = 0.18 + (props.spotIndex % 3) * 0.05
	const stemPosition: Vector3TupleT = [spot[0], 0.1 + stemHeight / 2, spot[1]]
	const bloomPosition: Vector3TupleT = [spot[0], 0.12 + stemHeight, spot[1]]

	return (
		<group>
			<Cylinder radiusTop={0.012} radiusBottom={0.012} height={stemHeight} position={stemPosition} color="#4c8a3f" segments={4} />
			<Ball radius={0.065} position={bloomPosition} color={flowerColors[colorIndex]} />
		</group>
	)
}

export const FlowerBed = (props: ModelPropsT) => {
	const flowers = flowerSpots.map((_spot, spotIndex) => {
		return <Flower key={spotIndex} spotIndex={spotIndex} seed={props.seed} />
	})

	return (
		<group>
			<Block size={[0.9, 0.12, 0.9]} position={[0, 0.06, 0]} color="#7a5a3e" />
			<Block size={[0.82, 0.04, 0.82]} position={[0, 0.12, 0]} color="#4b3526" />
			<Sway phase={props.seed} amount={0.04} speed={2}>
				{flowers}
			</Sway>
		</group>
	)
}
