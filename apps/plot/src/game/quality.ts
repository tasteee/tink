// Render quality, chosen once at startup. Low drops shadows,
// antialiasing, the reflection map and the fancier material
// layers, which is what phone GPUs struggle with. Changing it
// reloads the page so every cached material is rebuilt.

export const Quality = {
	high: 'high',
	low: 'low'
} as const

export type QualityT = (typeof Quality)[keyof typeof Quality]

const QUALITY_KEY = 'plot.quality'

const checkIsTouchDevice = (): boolean => {
	return window.matchMedia('(pointer: coarse)').matches
}

const readQuality = (): QualityT => {
	const savedQuality = window.localStorage.getItem(QUALITY_KEY)
	const isSavedHigh = savedQuality === Quality.high
	if (isSavedHigh) return Quality.high
	const isSavedLow = savedQuality === Quality.low
	if (isSavedLow) return Quality.low
	const isTouchDevice = checkIsTouchDevice()
	if (isTouchDevice) return Quality.low
	return Quality.high
}

export const quality = readQuality()
export const isHighQuality = quality === Quality.high
export const isTouchDevice = checkIsTouchDevice()

export const saveQuality = (nextQuality: QualityT): void => {
	window.localStorage.setItem(QUALITY_KEY, nextQuality)
}

export const switchQuality = (nextQuality: QualityT): void => {
	saveQuality(nextQuality)
	window.location.reload()
}
