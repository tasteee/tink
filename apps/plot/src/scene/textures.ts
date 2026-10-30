import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import type { FloorDefT, WallDefT } from '../game/catalog'

const TEXTURE_SIZE = 128

// Deterministic noise so textures look the same every load.
const createRandom = (seed: number): (() => number) => {
	let state = seed
	return () => {
		state = (state * 16807) % 2147483647
		return (state - 1) / 2147483646
	}
}

const createCanvas = (): HTMLCanvasElement => {
	const canvas = document.createElement('canvas')
	canvas.width = TEXTURE_SIZE
	canvas.height = TEXTURE_SIZE
	return canvas
}

const finishTexture = (canvas: HTMLCanvasElement): CanvasTexture => {
	const texture = new CanvasTexture(canvas)
	texture.colorSpace = SRGBColorSpace
	texture.wrapS = RepeatWrapping
	texture.wrapT = RepeatWrapping
	texture.anisotropy = 4
	return texture
}

const drawPlanks = (context: CanvasRenderingContext2D, floorDef: FloorDefT): void => {
	const random = createRandom(11)
	const plankCount = 4
	const plankHeight = TEXTURE_SIZE / plankCount
	const rowIndexes = Array.from({ length: plankCount }, (_unused, index) => index)

	context.fillStyle = floorDef.color
	context.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)

	for (const rowIndex of rowIndexes) {
		const rowTop = rowIndex * plankHeight
		const seamX = Math.floor(random() * TEXTURE_SIZE)
		context.globalAlpha = 0.12 + random() * 0.12
		context.fillStyle = floorDef.accentColor
		context.fillRect(0, rowTop, TEXTURE_SIZE, plankHeight)
		context.globalAlpha = 1
		context.fillStyle = floorDef.accentColor
		context.fillRect(0, rowTop, TEXTURE_SIZE, 2)
		context.fillRect(seamX, rowTop, 2, plankHeight)
	}
}

const drawTiles = (context: CanvasRenderingContext2D, floorDef: FloorDefT): void => {
	const half = TEXTURE_SIZE / 2
	context.fillStyle = floorDef.color
	context.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)
	context.fillStyle = floorDef.accentColor
	context.fillRect(0, 0, half, half)
	context.fillRect(half, half, half, half)
	context.globalAlpha = 0.25
	context.fillStyle = '#000000'
	context.fillRect(0, 0, TEXTURE_SIZE, 1)
	context.fillRect(0, 0, 1, TEXTURE_SIZE)
	context.fillRect(0, half, TEXTURE_SIZE, 1)
	context.fillRect(half, 0, 1, TEXTURE_SIZE)
	context.globalAlpha = 1
}

const drawStone = (context: CanvasRenderingContext2D, floorDef: FloorDefT): void => {
	const random = createRandom(29)
	const slabs = [
		{ x: 0, y: 0, width: 70, height: 56 },
		{ x: 70, y: 0, width: 58, height: 72 },
		{ x: 0, y: 56, width: 44, height: 72 },
		{ x: 44, y: 56, width: 26, height: 72 },
		{ x: 70, y: 72, width: 58, height: 56 }
	]

	context.fillStyle = floorDef.accentColor
	context.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)

	for (const slab of slabs) {
		context.globalAlpha = 0.85 + random() * 0.15
		context.fillStyle = floorDef.color
		context.fillRect(slab.x + 2, slab.y + 2, slab.width - 4, slab.height - 4)
	}

	context.globalAlpha = 1
}

const drawCarpet = (context: CanvasRenderingContext2D, floorDef: FloorDefT): void => {
	const random = createRandom(7)
	const speckleCount = 900
	const speckles = Array.from({ length: speckleCount }, (_unused, index) => index)

	context.fillStyle = floorDef.color
	context.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)
	context.fillStyle = floorDef.accentColor

	for (const _speckle of speckles) {
		const speckleX = random() * TEXTURE_SIZE
		const speckleY = random() * TEXTURE_SIZE
		context.fillRect(speckleX, speckleY, 2, 2)
	}
}

const floorTextureCache = new Map<string, CanvasTexture>()

export const getFloorTexture = (floorDef: FloorDefT): CanvasTexture => {
	const cachedTexture = floorTextureCache.get(floorDef.id)
	if (cachedTexture !== undefined) return cachedTexture

	const canvas = createCanvas()
	const context = canvas.getContext('2d')
	if (context === null) return finishTexture(canvas)

	const painters = { planks: drawPlanks, tiles: drawTiles, stone: drawStone, carpet: drawCarpet }
	painters[floorDef.pattern](context, floorDef)

	const texture = finishTexture(canvas)
	floorTextureCache.set(floorDef.id, texture)
	return texture
}

const wallTextureCache = new Map<string, CanvasTexture>()

// Bricks: four courses per texture, offset every other row.
export const getBrickTexture = (wallDef: WallDefT): CanvasTexture => {
	const cachedTexture = wallTextureCache.get(wallDef.id)
	if (cachedTexture !== undefined) return cachedTexture

	const canvas = createCanvas()
	const context = canvas.getContext('2d')
	if (context === null) return finishTexture(canvas)

	const random = createRandom(53)
	const courseCount = 8
	const courseHeight = TEXTURE_SIZE / courseCount
	const brickWidth = TEXTURE_SIZE / 4
	const courseIndexes = Array.from({ length: courseCount }, (_unused, index) => index)
	const brickIndexes = Array.from({ length: 5 }, (_unused, index) => index)

	context.fillStyle = wallDef.trimColor
	context.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)

	for (const courseIndex of courseIndexes) {
		const isOffsetCourse = courseIndex % 2 === 1
		const courseOffset = isOffsetCourse ? -brickWidth / 2 : 0
		for (const brickIndex of brickIndexes) {
			context.globalAlpha = 0.8 + random() * 0.2
			context.fillStyle = wallDef.color
			const brickX = courseOffset + brickIndex * brickWidth + 1
			const brickY = courseIndex * courseHeight + 1
			context.fillRect(brickX, brickY, brickWidth - 2, courseHeight - 2)
		}
	}

	context.globalAlpha = 1
	const texture = finishTexture(canvas)
	wallTextureCache.set(wallDef.id, texture)
	return texture
}
