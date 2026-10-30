import { MeshStandardMaterial } from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { FENCE_HEIGHT, TAP_SLOP_PIXELS, WALL_DOWN_HEIGHT, WALL_HEIGHT, WALL_THICKNESS } from '../game/constants'
import { getWallDef, ToolId, WallStyle } from '../game/catalog'
import type { WallDefT } from '../game/catalog'
import { EdgeAxis, parseEdgeKey, vertexToWorld } from '../game/grid'
import type { EdgeT } from '../game/grid'
import { removeWall } from '../game/actions'
import { getActiveTool, useIsWallsDown, useWorld } from '../game/store'
import { getBrickTexture } from './textures'
import { Block } from './models/parts'
import type { Vector3TupleT } from './models/parts'

const wallMaterialCache = new Map<string, MeshStandardMaterial>()

const getWallMaterial = (wallDef: WallDefT): MeshStandardMaterial => {
	const cachedMaterial = wallMaterialCache.get(wallDef.id)
	if (cachedMaterial !== undefined) return cachedMaterial

	const isBrick = wallDef.style === WallStyle.brick
	const material = new MeshStandardMaterial({ color: wallDef.color, roughness: 0.9 })
	if (isBrick) {
		const brickTexture = getBrickTexture(wallDef)
		brickTexture.repeat.set(1, WALL_HEIGHT)
		material.map = brickTexture
		material.color.set('#ffffff')
	}

	wallMaterialCache.set(wallDef.id, material)
	return material
}

// Center of an edge in world space, plus its run direction.
const getEdgeCenter = (edge: EdgeT): { x: number; z: number; isAlongX: boolean } => {
	const isAlongX = edge.axis === EdgeAxis.x
	const startX = vertexToWorld(edge.x)
	const startZ = vertexToWorld(edge.z)
	if (isAlongX) return { x: startX + 0.5, z: startZ, isAlongX }
	return { x: startX, z: startZ + 0.5, isAlongX }
}

const handleWallClick = (event: ThreeEvent<MouseEvent>, edgeKey: string) => {
	const isDrag = event.delta > TAP_SLOP_PIXELS
	if (isDrag) return
	const isBulldozeTool = getActiveTool() === ToolId.bulldoze
	if (!isBulldozeTool) return
	event.stopPropagation()
	removeWall(edgeKey)
}

type WallSegmentPropsT = {
	edgeKey: string
	wallDef: WallDefT
	height: number
}

const SolidWallSegment = (props: WallSegmentPropsT) => {
	const edge = parseEdgeKey(props.edgeKey)
	const center = getEdgeCenter(edge)
	const length = 1 - WALL_THICKNESS
	const size: Vector3TupleT = center.isAlongX ? [length, props.height, WALL_THICKNESS] : [WALL_THICKNESS, props.height, length]
	const capSize: Vector3TupleT = center.isAlongX ? [length, 0.05, WALL_THICKNESS + 0.03] : [WALL_THICKNESS + 0.03, 0.05, length]
	const position: Vector3TupleT = [center.x, props.height / 2, center.z]
	const capPosition: Vector3TupleT = [center.x, props.height, center.z]
	const material = getWallMaterial(props.wallDef)

	const handleClick = (event: ThreeEvent<MouseEvent>) => {
		handleWallClick(event, props.edgeKey)
	}

	return (
		<group onClick={handleClick}>
			<mesh position={position} material={material} castShadow receiveShadow>
				<boxGeometry args={size} />
			</mesh>
			<Block size={capSize} position={capPosition} color={props.wallDef.trimColor} />
		</group>
	)
}

const picketOffsets = [-0.33, -0.11, 0.11, 0.33]

const FenceSegment = (props: WallSegmentPropsT) => {
	const edge = parseEdgeKey(props.edgeKey)
	const center = getEdgeCenter(edge)
	const rotationY = center.isAlongX ? 0 : Math.PI / 2
	const position: Vector3TupleT = [center.x, 0, center.z]
	const rotation: Vector3TupleT = [0, rotationY, 0]

	const handleClick = (event: ThreeEvent<MouseEvent>) => {
		handleWallClick(event, props.edgeKey)
	}

	const pickets = picketOffsets.map((offset) => {
		return (
			<group key={offset} position={[offset, 0, 0]}>
				<Block size={[0.1, FENCE_HEIGHT - 0.1, 0.04]} position={[0, (FENCE_HEIGHT - 0.1) / 2, 0]} color={props.wallDef.color} />
				<Block size={[0.07, 0.07, 0.04]} position={[0, FENCE_HEIGHT - 0.08, 0]} rotation={[0, 0, Math.PI / 4]} color={props.wallDef.color} />
			</group>
		)
	})

	return (
		<group position={position} rotation={rotation} onClick={handleClick}>
			{pickets}
			<Block size={[0.92, 0.07, 0.03]} position={[0, 0.25, -0.035]} color={props.wallDef.trimColor} />
			<Block size={[0.92, 0.07, 0.03]} position={[0, FENCE_HEIGHT - 0.3, -0.035]} color={props.wallDef.trimColor} />
		</group>
	)
}

type PostT = { vertexKey: string; x: number; z: number; wallDef: WallDefT }

// Square posts at every wall corner and end so runs join
// cleanly without overlapping faces.
const collectPosts = (walls: Record<string, string>): PostT[] => {
	const postsByVertex = new Map<string, PostT>()

	for (const entry of Object.entries(walls)) {
		const edge = parseEdgeKey(entry[0])
		const wallDef = getWallDef(entry[1])
		const isAlongX = edge.axis === EdgeAxis.x
		const endX = isAlongX ? edge.x + 1 : edge.x
		const endZ = isAlongX ? edge.z : edge.z + 1
		const ends = [
			{ x: edge.x, z: edge.z },
			{ x: endX, z: endZ }
		]

		for (const end of ends) {
			const vertexKey = `${end.x},${end.z}`
			const existingPost = postsByVertex.get(vertexKey)
			const isExistingSolid = existingPost !== undefined && existingPost.wallDef.style !== WallStyle.fence
			if (isExistingSolid) continue
			postsByVertex.set(vertexKey, { vertexKey, x: end.x, z: end.z, wallDef })
		}
	}

	return Array.from(postsByVertex.values())
}

const WallPost = (props: { post: PostT; wallHeight: number }) => {
	const isFence = props.post.wallDef.style === WallStyle.fence
	const height = isFence ? FENCE_HEIGHT + 0.08 : props.wallHeight
	const thickness = isFence ? 0.1 : WALL_THICKNESS
	const position: Vector3TupleT = [vertexToWorld(props.post.x), height / 2, vertexToWorld(props.post.z)]
	const material = getWallMaterial(props.post.wallDef)
	const capPosition: Vector3TupleT = [position[0], height, position[2]]
	const hasCap = !isFence

	return (
		<group>
			<mesh position={position} material={material} castShadow receiveShadow>
				<boxGeometry args={[thickness, height, thickness]} />
			</mesh>
			{hasCap && <Block size={[thickness + 0.03, 0.05, thickness + 0.03]} position={capPosition} color={props.post.wallDef.trimColor} />}
		</group>
	)
}

export const Walls = () => {
	const world = useWorld()
	const isWallsDown = useIsWallsDown()
	const wallHeight = isWallsDown ? WALL_DOWN_HEIGHT : WALL_HEIGHT
	const posts = collectPosts(world.walls)

	const segments = Object.entries(world.walls).map((entry) => {
		const edgeKey = entry[0]
		const wallDef = getWallDef(entry[1])
		const isFence = wallDef.style === WallStyle.fence
		if (isFence) return <FenceSegment key={edgeKey} edgeKey={edgeKey} wallDef={wallDef} height={FENCE_HEIGHT} />
		return <SolidWallSegment key={edgeKey} edgeKey={edgeKey} wallDef={wallDef} height={wallHeight} />
	})

	const postMeshes = posts.map((post) => {
		return <WallPost key={post.vertexKey} post={post} wallHeight={wallHeight} />
	})

	return (
		<group>
			{segments}
			{postMeshes}
		</group>
	)
}

