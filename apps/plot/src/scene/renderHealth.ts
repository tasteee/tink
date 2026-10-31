import type { WebGLRenderer } from 'three'
import { $canvasGeneration, $renderStatus, RenderHealth } from '../game/store'

const RESTORE_WAIT_MS = 1500
const MAX_REMOUNTS = 3

let remountCount = 0
let restoreTimeoutId = 0

// Phones get a lighter load: fewer pixels and a smaller
// shadow map, the two biggest GPU memory costs here.
export const checkIsTouchDevice = (): boolean => {
	return window.matchMedia('(pointer: coarse)').matches
}

const getGpuLabel = (renderer: WebGLRenderer): string => {
	const context = renderer.getContext()
	const debugInfo = context.getExtension('WEBGL_debug_renderer_info')
	if (debugInfo === null) return 'unknown GPU'
	const gpuName = context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
	return String(gpuName)
}

const markFailed = (detail: string): void => {
	$renderStatus.set({ health: RenderHealth.failed, detail })
}

const remountOrFail = (): void => {
	const canRemount = remountCount < MAX_REMOUNTS
	if (!canRemount) {
		markFailed('The graphics context was lost and could not be restored.')
		return
	}

	remountCount += 1
	$canvasGeneration.set($canvasGeneration.state + 1)
}

const handleContextLost = (event: Event): void => {
	// Without preventDefault the browser never restores it.
	event.preventDefault()
	$renderStatus.set({ health: RenderHealth.recovering, detail: 'Graphics context lost. Restoring…' })
	window.clearTimeout(restoreTimeoutId)
	restoreTimeoutId = window.setTimeout(remountOrFail, RESTORE_WAIT_MS)
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
		markFailed(`Shader failed to compile: ${logs.join(' | ').slice(0, 400)}`)
	}

	const gpuLabel = getGpuLabel(renderer)
	const isLost = renderer.getContext().isContextLost()
	if (isLost) {
		$renderStatus.set({ health: RenderHealth.recovering, detail: 'Graphics context lost. Restoring…', gpuLabel })
		return
	}
	$renderStatus.set({ health: RenderHealth.ok, detail: '', gpuLabel })
}

const describeError = (value: unknown): string => {
	const isError = value instanceof Error
	if (isError) return value.message
	return String(value)
}

// Any uncaught error is surfaced too, so a blank screen is
// never silent.
export const watchPageErrors = (): void => {
	window.addEventListener('error', (event) => {
		markFailed(describeError(event.error ?? event.message))
	})
	window.addEventListener('unhandledrejection', (event) => {
		markFailed(describeError(event.reason))
	})
}
