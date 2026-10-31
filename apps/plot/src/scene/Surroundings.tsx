import { HALF_LOT, LOT_SIZE } from '../game/constants'
import { ObjectModel } from './models/registry'
import type { Vector3TupleT } from './models/parts'

const SIDEWALK_WIDTH = 1.4
const ROAD_WIDTH = 4.2
const sidewalkZ = HALF_LOT + SIDEWALK_WIDTH / 2
const roadZ = HALF_LOT + SIDEWALK_WIDTH + ROAD_WIDTH / 2
const dashOffsets = [-24, -18, -12, -6, 0, 6, 12, 18, 24]

// Decorative neighbourhood trees outside the lot.
const backdropTrees: { defId: string; position: Vector3TupleT }[] = [
	{ defId: 'pineTree', position: [-12, 0, -11] },
	{ defId: 'oakTree', position: [-10.5, 0, -4] },
	{ defId: 'pineTree', position: [-13, 0, 3] },
	{ defId: 'birchTree', position: [-11, 0, 7] },
	{ defId: 'oakTree', position: [-4, 0, -12] },
	{ defId: 'pineTree', position: [3, 0, -11.5] },
	{ defId: 'cherryTree', position: [9, 0, -12] },
	{ defId: 'pineTree', position: [12, 0, -9] },
	{ defId: 'oakTree', position: [11, 0, -1] },
	{ defId: 'birchTree', position: [12.5, 0, 5] },
	{ defId: 'pineTree', position: [-7, 0, 17] },
	{ defId: 'oakTree', position: [6, 0, 17.5] }
]

const RoadDash = (props: { offset: number }) => {
	const position: Vector3TupleT = [props.offset, 0.015, roadZ]

	return (
		<mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
			<planeGeometry args={[2.2, 0.14]} />
			<meshStandardMaterial color="#e9e1c9" />
		</mesh>
	)
}

export const Surroundings = () => {
	const dashes = dashOffsets.map((offset) => {
		return <RoadDash key={offset} offset={offset} />
	})

	const trees = backdropTrees.map((tree, index) => {
		return (
			<group key={index} position={tree.position}>
				<ObjectModel defId={tree.defId} seed={index * 1.7} />
			</group>
		)
	})

	return (
		<group>
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
				<planeGeometry args={[220, 220]} />
				<meshStandardMaterial color="#5b8a42" roughness={1} />
			</mesh>
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, sidewalkZ]} receiveShadow>
				<planeGeometry args={[LOT_SIZE + 60, SIDEWALK_WIDTH]} />
				<meshStandardMaterial color="#c9c4b8" roughness={1} />
			</mesh>
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, roadZ]} receiveShadow>
				<planeGeometry args={[LOT_SIZE + 60, ROAD_WIDTH]} />
				<meshStandardMaterial color="#4a4d52" roughness={1} />
			</mesh>
			{dashes}
			{trees}
		</group>
	)
}
