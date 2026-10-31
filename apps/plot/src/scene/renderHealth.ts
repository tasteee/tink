import type { WebGLRenderer } from 'three'
import { $renderStatus, RenderHealth } from '../game/store'
import { isHighQuality, Quality, saveQuality } from '../game/quality'

const RESTORE_WAIT_MS = 2500

let restoreTimeoutId = 0

const getGpuLabel = (renderer: WebGLRenderer): string => {
	const context = renderer.getContext()
	const debugInfo = context.getExtension('WEBGL_debug_renderer_info')
	if (debugInfo === null) return 'unknown GPU'
	const gpuName = context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
	return String(gpuName)
}

export const markRenderFailed = (detail: string): void => {
	$renderStatus.set({ health: RenderHealth.failed, detail })
}

// Chrome turns 3D off for a site after its GPU crashes, until
// the browser restarts. Check before mounting a canvas so the
// app can explain that instead of crashing.
export const checkCanCreateWebGl = (): boolean => {
	const probeCanvas = document.createElement('canvas')
	const probeContext = probeCanvas.getContext('webgl2')
	const isAvailable = probeContext !== null
	if (!isAvailable) return false
	const loseContext = probeContext.getExtension('WEBGL_lose_context')
	if (loseContext !== null) loseContext.loseContext()
	return true
}

export const blockedWebGlMessage = 'This browser has 3D graphics turned off for this site, usually after a graphics crash. Fully close the browser app (swipe it away), reopen it, then reload.'

// The phone's GPU dropped the context. Never rebuild the canvas
// here: a second context is often refused and that refusal
// would take the whole app down. Fall back to low quality for
// next time and wait to see if the browser restores it.
const handleContextLost = (event: Event): void => {
	event.preventDefault()
	if (isHighQuality) saveQuality(Quality.low)
	$renderStatus.set({ health: RenderHealth.recovering, detail: 'The graphics chip reset. Waiting for it to come back…' })
	window.clearTimeout(restoreTimeoutId)
	restoreTimeoutId = window.setTimeout(() => {
		markRenderFailed('The graphics chip reset and did not come back. Reload to try again in low quality.')
	}, RESTORE_WAIT_MS)
}

const handleContextRestored = (): void => {
	window.clearTimeout(restoreTimeoutId)
	$renderStatus.set({ health: RenderHealth.ok, detail: '' })
}

const readShaderLog = (context: WebGLRenderingContext, shader: WebGLShader): string => {
	const shaderLog = context.getShaderInfoLog(shader) ?? ''
	return shaderLog.trim()
}

export const watchRenderer = (renderer: WebGLRenderer): void => {
	const canvas = renderer.domElement
	canvas.addEventListener('webglcontextlost', handleContextLost)
	canvas.addEventListener('webglcontextrestored', handleContextRestored)

	renderer.debug.onShaderError = (context, program, vertexShader, fragmentShader) => {
		const programLog = (context.getProgramInfoLog(program) ?? '').trim()
		const vertexLog = readShaderLog(context, vertexShader)
		const fragmentLog = readShaderLog(context, fragmentShader)
		const logs = [programLog, vertexLog, fragmentLog].filter((log) => log !== '')
		markRenderFailed(`Shader failed to compile: ${logs.join(' | ').slice(0, 400)}`)
	}

	const gpuLabel = getGpuLabel(renderer)
	$renderStatus.set({ gpuLabel })
}

const describeError = (value: unknown): string => {
	const isError = value instanceof Error
	if (isError) return value.message
	return String(value)
}

// Any uncaught error is surfaced too, so a blank screen is
// never silent.
// ResizeObserver loop warnings are harmless browser noise.
const checkIsHarmless = (message: string): boolean => {
	return message.includes('ResizeObserver')
}

export const watchPageErrors = (): void => {
	window.addEventListener('error', (event) => {
		const message = describeError(event.error ?? event.message)
		const isHarmless = checkIsHarmless(message)
		if (isHarmless) return
		markRenderFailed(message)
	})
	window.addEventListener('unhandledrejection', (event) => {
		markRenderFailed(describeError(event.reason))
	})
}

export const describeCanvasError = describeError
