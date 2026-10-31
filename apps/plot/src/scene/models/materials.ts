import { Color, MeshPhysicalMaterial, MeshStandardMaterial } from 'three'
import { isHighQuality } from '../../game/quality'

// Shared materials for the medium-detail models. One instance
// per look keeps shader programs and GPU memory down no matter
// how many sofas or trucks are placed.

const materialCache = new Map<string, MeshStandardMaterial>()

const getCached = (cacheKey: string, buildMaterial: () => MeshStandardMaterial): MeshStandardMaterial => {
	const cachedMaterial = materialCache.get(cacheKey)
	if (cachedMaterial !== undefined) return cachedMaterial
	const material = buildMaterial()
	materialCache.set(cacheKey, material)
	return material
}

// Velvet: rough base with a bright sheen at grazing angles.
export const getVelvet = (color: string): MeshStandardMaterial => {
	return getCached(`velvet:${color}`, () => {
		if (!isHighQuality) return new MeshStandardMaterial({ color, roughness: 0.8 })
		const sheenColor = new Color(color).lerp(new Color('#ffffff'), 0.45)
		return new MeshPhysicalMaterial({ color, roughness: 0.85, sheen: 1, sheenRoughness: 0.35, sheenColor })
	})
}

// Darker velvet for tufting creases and button wells.
export const getVelvetShadow = (color: string): MeshStandardMaterial => {
	return getCached(`velvetShadow:${color}`, () => {
		const darkColor = new Color(color).multiplyScalar(0.55)
		return new MeshStandardMaterial({ color: darkColor, roughness: 0.95 })
	})
}

export const getFabric = (color: string): MeshStandardMaterial => {
	return getCached(`fabric:${color}`, () => {
		return new MeshStandardMaterial({ color, roughness: 0.95 })
	})
}

export const getGold = (): MeshStandardMaterial => {
	return getCached('gold', () => {
		const metalness = isHighQuality ? 0.85 : 0.35
		return new MeshStandardMaterial({ color: '#d9b45a', metalness, roughness: 0.32 })
	})
}

export const getChrome = (): MeshStandardMaterial => {
	return getCached('chrome', () => {
		const metalness = isHighQuality ? 1 : 0.4
		return new MeshStandardMaterial({ color: '#e6e8ea', metalness, roughness: 0.25 })
	})
}

export const getRhinestone = (): MeshStandardMaterial => {
	return getCached('rhinestone', () => {
		const metalness = isHighQuality ? 0.9 : 0.3
		return new MeshStandardMaterial({ color: '#f4f6ff', metalness, roughness: 0.05, emissive: '#6f7a99', emissiveIntensity: 0.25 })
	})
}

// Glossy automotive paint with a clear coat layer.
export const getCarPaint = (color: string): MeshStandardMaterial => {
	return getCached(`paint:${color}`, () => {
		if (!isHighQuality) return new MeshStandardMaterial({ color, metalness: 0.1, roughness: 0.4 })
		return new MeshPhysicalMaterial({ color, metalness: 0.15, roughness: 0.38, clearcoat: 1, clearcoatRoughness: 0.08 })
	})
}

export const getGlass = (): MeshStandardMaterial => {
	return getCached('glass', () => {
		const metalness = isHighQuality ? 0.6 : 0.2
		return new MeshStandardMaterial({ color: '#1c2630', metalness, roughness: 0.05, transparent: true, opacity: 0.82 })
	})
}

export const getRubber = (): MeshStandardMaterial => {
	return getCached('rubber', () => {
		return new MeshStandardMaterial({ color: '#1b1c1e', roughness: 0.92 })
	})
}

export const getMatte = (color: string): MeshStandardMaterial => {
	return getCached(`matte:${color}`, () => {
		return new MeshStandardMaterial({ color, roughness: 0.75 })
	})
}

export const getGlow = (color: string, intensity: number): MeshStandardMaterial => {
	return getCached(`glow:${color}:${intensity}`, () => {
		return new MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: 0.3 })
	})
}
