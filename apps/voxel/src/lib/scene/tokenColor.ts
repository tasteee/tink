import { Color, SRGBColorSpace } from 'three'

// Reads a zest token (e.g. --accent) as a three.js color, so
// the 3D scene stays on the same palette as the UI. Tokens are
// oklch, so the browser resolves them through a 1px canvas.
const tokenCache = new Map<string, Color>()
let probeContext: CanvasRenderingContext2D | null = null

const getProbeContext = (): CanvasRenderingContext2D | null => {
	if (probeContext) return probeContext
	const canvas = document.createElement('canvas')
	canvas.width = 1
	canvas.height = 1
	probeContext = canvas.getContext('2d', { willReadFrequently: true })
	return probeContext
}

const resolveCssColor = (cssColor: string): Color => {
	const context = getProbeContext()
	if (!context) return new Color(0.5, 0.5, 0.5)
	context.clearRect(0, 0, 1, 1)
	context.fillStyle = cssColor
	context.fillRect(0, 0, 1, 1)
	const pixel = context.getImageData(0, 0, 1, 1).data
	return new Color().setRGB(pixel[0] / 255, pixel[1] / 255, pixel[2] / 255, SRGBColorSpace)
}

export const readTokenColor = (tokenName: string): Color => {
	const cachedColor = tokenCache.get(tokenName)
	if (cachedColor) return cachedColor
	const probe = document.createElement('span')
	probe.style.color = `var(${tokenName})`
	document.body.appendChild(probe)
	const computedColor = getComputedStyle(probe).color
	probe.remove()
	const resolvedColor = resolveCssColor(computedColor)
	tokenCache.set(tokenName, resolvedColor)
	return resolvedColor
}
