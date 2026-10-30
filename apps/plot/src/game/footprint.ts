import { getObjectDef } from './catalog'
import { buildEdgeKey, EdgeAxis, isTileInLot, tileToWorld } from './grid'
import type { TileT } from './grid'

// rotation counts quarter turns (0..3). Odd turns swap the
// footprint's width and depth.
export type PlacedObjectT = {
	id: string
	defId: string
	x: number
	z: number
	rotation: number
}

export type FootprintSizeT = { width: number; depth: number }

export const getFootprintSize = (defId: string, rotation: number): FootprintSizeT => {
	const objectDef = getObjectDef(defId)
	const isQuarterTurned = rotation % 2 === 1
	if (isQuarterTurned) return { width: objectDef.depth, depth: objectDef.width }
	return { width: objectDef.width, depth: objectDef.depth }
}

export const getFootprintTiles = (defId: string, anchor: TileT, rotation: number): TileT[] => {
	const size = getFootprintSize(defId, rotation)
	const xOffsets = Array.from({ length: size.width }, (_unused, offset) => offset)
	const zOffsets = Array.from({ length: size.depth }, (_unused, offset) => offset)
	const tiles: TileT[] = []

	for (const xOffset of xOffsets) {
		for (const zOffset of zOffsets) tiles.push({ x: anchor.x + xOffset, z: anchor.z + zOffset })
	}

	return tiles
}

export const isFootprintInLot = (tiles: TileT[]): boolean => {
	return tiles.every(isTileInLot)
}

// Edges strictly inside a multi-tile footprint. A wall on
// one of these would slice straight through the object.
export const getInternalEdgeKeys = (tiles: TileT[]): string[] => {
	const tileKeys = new Set(tiles.map((tile) => `${tile.x},${tile.z}`))
	const edgeKeys: string[] = []

	for (const tile of tiles) {
		const hasRightNeighbour = tileKeys.has(`${tile.x + 1},${tile.z}`)
		const hasFrontNeighbour = tileKeys.has(`${tile.x},${tile.z + 1}`)
		if (hasRightNeighbour) edgeKeys.push(buildEdgeKey({ axis: EdgeAxis.z, x: tile.x + 1, z: tile.z }))
		if (hasFrontNeighbour) edgeKeys.push(buildEdgeKey({ axis: EdgeAxis.x, x: tile.x, z: tile.z + 1 }))
	}

	return edgeKeys
}

export type WorldPointT = { x: number; z: number }

export const getFootprintCenter = (defId: string, anchor: TileT, rotation: number): WorldPointT => {
	const size = getFootprintSize(defId, rotation)
	const centerX = tileToWorld(anchor.x) + (size.width - 1) / 2
	const centerZ = tileToWorld(anchor.z) + (size.depth - 1) / 2
	return { x: centerX, z: centerZ }
}

// Anchors a footprint so the tile under the finger sits
// inside it, keeping multi-tile objects from hanging off
// the lot edge.
export const getAnchorForTile = (defId: string, tile: TileT, rotation: number): TileT => {
	const size = getFootprintSize(defId, rotation)
	const anchorX = tile.x - Math.floor((size.width - 1) / 2)
	const anchorZ = tile.z - Math.floor((size.depth - 1) / 2)
	return { x: anchorX, z: anchorZ }
}
