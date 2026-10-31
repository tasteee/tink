import { HALF_LOT, LOT_SIZE } from './constants'

// Tiles are addressed by their min corner (0..LOT_SIZE-1).
// Vertices sit on tile corners (0..LOT_SIZE). Walls live on
// edges between two neighbouring vertices.
export type TileT = { x: number; z: number }
export type VertexT = { x: number; z: number }

export const EdgeAxis = {
	x: 'x',
	z: 'z'
} as const

export type EdgeAxisT = (typeof EdgeAxis)[keyof typeof EdgeAxis]

// axis 'x' runs from (x, z) to (x + 1, z).
// axis 'z' runs from (x, z) to (x, z + 1).
export type EdgeT = { axis: EdgeAxisT; x: number; z: number }

export const buildTileKey = (tile: TileT): string => {
	return `${tile.x},${tile.z}`
}

export const parseTileKey = (tileKey: string): TileT => {
	const parts = tileKey.split(',')
	return { x: Number(parts[0]), z: Number(parts[1]) }
}

export const buildEdgeKey = (edge: EdgeT): string => {
	return `${edge.axis}:${edge.x}:${edge.z}`
}

export const parseEdgeKey = (edgeKey: string): EdgeT => {
	const parts = edgeKey.split(':')
	const axis = parts[0] === 'x' ? EdgeAxis.x : EdgeAxis.z
	return { axis, x: Number(parts[1]), z: Number(parts[2]) }
}

export const tileToWorld = (tileCoordinate: number): number => {
	return tileCoordinate - HALF_LOT + 0.5
}

export const vertexToWorld = (vertexCoordinate: number): number => {
	return vertexCoordinate - HALF_LOT
}

const clamp = (value: number, min: number, max: number): number => {
	return Math.min(max, Math.max(min, value))
}

export const worldToTile = (worldX: number, worldZ: number): TileT => {
	const tileX = Math.floor(worldX + HALF_LOT)
	const tileZ = Math.floor(worldZ + HALF_LOT)
	return { x: clamp(tileX, 0, LOT_SIZE - 1), z: clamp(tileZ, 0, LOT_SIZE - 1) }
}

export const worldToVertex = (worldX: number, worldZ: number): VertexT => {
	const vertexX = Math.round(worldX + HALF_LOT)
	const vertexZ = Math.round(worldZ + HALF_LOT)
	return { x: clamp(vertexX, 0, LOT_SIZE), z: clamp(vertexZ, 0, LOT_SIZE) }
}

export const isTileInLot = (tile: TileT): boolean => {
	const isXInside = tile.x >= 0 && tile.x < LOT_SIZE
	const isZInside = tile.z >= 0 && tile.z < LOT_SIZE
	return isXInside && isZInside
}

const buildRange = (from: number, to: number): number[] => {
	const start = Math.min(from, to)
	const length = Math.abs(to - from) + 1
	return Array.from({ length }, (_unused, offset) => start + offset)
}

export const getTilesInRect = (cornerA: TileT, cornerB: TileT): TileT[] => {
	const xValues = buildRange(cornerA.x, cornerB.x)
	const zValues = buildRange(cornerA.z, cornerB.z)
	const tiles: TileT[] = []

	for (const x of xValues) {
		for (const z of zValues) tiles.push({ x, z })
	}

	return tiles
}

// Walls snap to a straight line along whichever axis the
// drag has travelled furthest.
export const snapLineEnd = (start: VertexT, end: VertexT): VertexT => {
	const distanceX = Math.abs(end.x - start.x)
	const distanceZ = Math.abs(end.z - start.z)
	const isAlongX = distanceX >= distanceZ
	if (isAlongX) return { x: end.x, z: start.z }
	return { x: start.x, z: end.z }
}

export const getEdgesOnLine = (start: VertexT, rawEnd: VertexT): EdgeT[] => {
	const end = snapLineEnd(start, rawEnd)
	const isSinglePoint = start.x === end.x && start.z === end.z
	if (isSinglePoint) return []

	const isAlongX = start.z === end.z
	if (isAlongX) {
		const xValues = buildRange(start.x, end.x).slice(0, -1)
		return xValues.map((x) => {
			return { axis: EdgeAxis.x, x, z: start.z }
		})
	}

	const zValues = buildRange(start.z, end.z).slice(0, -1)
	return zValues.map((z) => {
		return { axis: EdgeAxis.z, x: start.x, z }
	})
}

// Unclamped: taps beyond the lot edge stay outside it.
export const worldToRawTile = (worldX: number, worldZ: number): TileT => {
	return { x: Math.floor(worldX + HALF_LOT), z: Math.floor(worldZ + HALF_LOT) }
}
