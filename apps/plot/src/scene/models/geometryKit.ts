import { BufferGeometry, CatmullRomCurve3, SphereGeometry, TubeGeometry, Vector3 } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// Geometry helpers for the medium-detail models. Every result
// is cached by its arguments, so a hundred placed sofas share
// one set of buffers.

const geometryCache = new Map<string, BufferGeometry>()

export const getCachedGeometry = (cacheKey: string, buildGeometry: () => BufferGeometry): BufferGeometry => {
	const cachedGeometry = geometryCache.get(cacheKey)
	if (cachedGeometry !== undefined) return cachedGeometry
	const geometry = buildGeometry()
	geometryCache.set(cacheKey, geometry)
	return geometry
}

export const getRoundedBox = (width: number, height: number, depth: number, radius: number): BufferGeometry => {
	const cacheKey = `roundedBox:${width}:${height}:${depth}:${radius}`
	return getCachedGeometry(cacheKey, () => {
		return new RoundedBoxGeometry(width, height, depth, 3, radius)
	})
}

export type PointT = [number, number, number]

// One merged mesh of small spheres, e.g. tufting buttons.
export const buildSphereCloud = (points: PointT[], radius: number): BufferGeometry => {
	const spheres = points.map((point) => {
		const sphere = new SphereGeometry(radius, 8, 6)
		sphere.translate(point[0], point[1], point[2])
		return sphere
	})
	const merged = mergeGeometries(spheres)
	for (const sphere of spheres) sphere.dispose()
	return merged
}

export const buildTube = (points: PointT[], radius: number, isClosed: boolean): BufferGeometry => {
	const curvePoints = points.map((point) => new Vector3(point[0], point[1], point[2]))
	const curve = new CatmullRomCurve3(curvePoints, isClosed, 'centripetal')
	const segmentCount = Math.max(24, points.length * 6)
	return new TubeGeometry(curve, segmentCount, radius, 8, isClosed)
}

export const buildRange = (start: number, end: number, step: number): number[] => {
	const count = Math.floor((end - start) / step + 0.0001) + 1
	return Array.from({ length: Math.max(0, count) }, (_unused, index) => start + index * step)
}
