import { BoxGeometry, MeshStandardMaterial } from 'three'
import { getFloorDef } from '../game/catalog'
import { parseTileKey, tileToWorld } from '../game/grid'
import { useWorld } from '../game/store'
import { getFloorTexture } from './textures'

export const FLOOR_THICKNESS = 0.04

const floorGeometry = new BoxGeometry(1, FLOOR_THICKNESS, 1)
const floorMaterialCache = new Map<string, MeshStandardMaterial>()

export const getFloorMaterial = (floorId: string): MeshStandardMaterial => {
	const cachedMaterial = floorMaterialCache.get(floorId)
	if (cachedMaterial !== undefined) return cachedMaterial

	const floorDef = getFloorDef(floorId)
	const isCarpet = floorDef.pattern === 'carpet'
	const roughness = isCarpet ? 1 : 0.7
	const material = new MeshStandardMaterial({ map: getFloorTexture(floorDef), roughness })
	floorMaterialCache.set(floorId, material)
	return material
}

type FloorTilePropsT = {
	tileKey: string
	floorId: string
}

const FloorTile = (props: FloorTilePropsT) => {
	const tile = parseTileKey(props.tileKey)
	const position: [number, number, number] = [tileToWorld(tile.x), FLOOR_THICKNESS / 2, tileToWorld(tile.z)]
	const material = getFloorMaterial(props.floorId)
	return <mesh geometry={floorGeometry} material={material} position={position} receiveShadow />
}

export const Floors = () => {
	const world = useWorld()
	const floorEntries = Object.entries(world.floors)

	const tiles = floorEntries.map((entry) => {
		const tileKey = entry[0]
		const floorId = entry[1]
		return <FloorTile key={tileKey} tileKey={tileKey} floorId={floorId} />
	})

	return <group>{tiles}</group>
}
