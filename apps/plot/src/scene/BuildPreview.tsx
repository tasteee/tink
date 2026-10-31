import { WALL_HEIGHT, WALL_THICKNESS } from '../game/constants'
import { getFloorDef, getWallDef, ToolId } from '../game/catalog'
import { checkPlacement, PlacementProblem } from '../game/actions'
import { getAnchorForTile, getFootprintCenter, getFootprintSize } from '../game/footprint'
import { buildEdgeKey, buildTileKey, EdgeAxis, getEdgesOnLine, getTilesInRect, tileToWorld, vertexToWorld } from '../game/grid'
import { StrokeKind, useChoices, useHover, useIsWallsDown, usePlacementRotation, useStroke, useTool, useWorld } from '../game/store'
import type { StrokeT } from '../game/store'
import { FLOOR_THICKNESS } from './Floors'
import { FootprintPad } from './PlacedObjects'
import { ObjectModel } from './models/registry'
import type { Vector3TupleT } from './models/parts'

const VALID_COLOR = '#5fd38d'
const INVALID_COLOR = '#ef6f6f'
const noRaycast = () => null

const FloorStrokePreview = (props: { stroke: StrokeT; floorId: string }) => {
	const floorDef = getFloorDef(props.floorId)
	const start = { x: props.stroke.startX, z: props.stroke.startZ }
	const end = { x: props.stroke.endX, z: props.stroke.endZ }
	const tiles = getTilesInRect(start, end)

	const tileMeshes = tiles.map((tile) => {
		const position: Vector3TupleT = [tileToWorld(tile.x), FLOOR_THICKNESS + 0.01, tileToWorld(tile.z)]
		return (
			<mesh key={buildTileKey(tile)} position={position} raycast={noRaycast}>
				<boxGeometry args={[0.96, 0.03, 0.96]} />
				<meshBasicMaterial color={floorDef.color} transparent opacity={0.75} depthWrite={false} />
			</mesh>
		)
	})

	return <group>{tileMeshes}</group>
}

const WallStrokePreview = (props: { stroke: StrokeT; wallId: string; height: number }) => {
	const wallDef = getWallDef(props.wallId)
	const start = { x: props.stroke.startX, z: props.stroke.startZ }
	const end = { x: props.stroke.endX, z: props.stroke.endZ }
	const edges = getEdgesOnLine(start, end)
	const startMarker: Vector3TupleT = [vertexToWorld(start.x), 0.1, vertexToWorld(start.z)]

	const edgeMeshes = edges.map((edge) => {
		const isAlongX = edge.axis === EdgeAxis.x
		const centerX = isAlongX ? vertexToWorld(edge.x) + 0.5 : vertexToWorld(edge.x)
		const centerZ = isAlongX ? vertexToWorld(edge.z) : vertexToWorld(edge.z) + 0.5
		const size: Vector3TupleT = isAlongX ? [1, props.height, WALL_THICKNESS] : [WALL_THICKNESS, props.height, 1]
		const position: Vector3TupleT = [centerX, props.height / 2, centerZ]
		return (
			<mesh key={buildEdgeKey(edge)} position={position} raycast={noRaycast}>
				<boxGeometry args={size} />
				<meshBasicMaterial color={wallDef.color} transparent opacity={0.6} depthWrite={false} />
			</mesh>
		)
	})

	return (
		<group>
			<mesh position={startMarker} raycast={noRaycast}>
				<sphereGeometry args={[0.12, 12, 8]} />
				<meshBasicMaterial color={VALID_COLOR} />
			</mesh>
			{edgeMeshes}
		</group>
	)
}

const ObjectHoverGhost = () => {
	const tool = useTool()
	const hover = useHover()
	const world = useWorld()
	const rotation = usePlacementRotation()

	const choices = useChoices()
	const isPlaceTool = tool === ToolId.place
	const shouldShow = isPlaceTool && hover.isVisible
	if (!shouldShow) return null

	const defId = choices.object
	const anchor = getAnchorForTile(defId, hover, rotation)
	const problem = checkPlacement(world, defId, anchor, rotation, '')
	const isValid = problem === PlacementProblem.none
	const padColor = isValid ? VALID_COLOR : INVALID_COLOR
	const center = getFootprintCenter(defId, anchor, rotation)
	const size = getFootprintSize(defId, rotation)
	const position: Vector3TupleT = [center.x, FLOOR_THICKNESS, center.z]
	const modelRotation: Vector3TupleT = [0, -rotation * (Math.PI / 2), 0]

	return (
		<group position={position}>
			<FootprintPad width={size.width} depth={size.depth} color={padColor} opacity={0.5} />
			<group rotation={modelRotation}>
				<ObjectModel defId={defId} seed={0} />
			</group>
		</group>
	)
}

export const BuildPreview = () => {
	const stroke = useStroke()
	const choices = useChoices()
	const isWallsDown = useIsWallsDown()
	const previewWallHeight = isWallsDown ? 0.6 : WALL_HEIGHT
	const isFloorStroke = stroke.kind === StrokeKind.floor
	const isWallStroke = stroke.kind === StrokeKind.wall

	return (
		<group>
			{isFloorStroke && <FloorStrokePreview stroke={stroke} floorId={choices.floor} />}
			{isWallStroke && <WallStrokePreview stroke={stroke} wallId={choices.wall} height={previewWallHeight} />}
			<ObjectHoverGhost />
		</group>
	)
}
