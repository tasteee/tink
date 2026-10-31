import { datass } from 'datass'
import { SAVE_KEY } from './constants'
import { ToolId } from './catalog'
import type { ToolIdT } from './catalog'
import type { PlacedObjectT } from './footprint'
import { buildStarterWorld } from './starterWorld'

// floors: tileKey -> floorDefId
// walls: edgeKey -> wallDefId
export type WorldT = {
	floors: Record<string, string>
	walls: Record<string, string>
	objects: PlacedObjectT[]
	funds: number
}

export type CatalogChoicesT = {
	floor: string
	wall: string
	plant: string
	furniture: string
}

export const StrokeKind = {
	none: 'none',
	floor: 'floor',
	wall: 'wall'
} as const

export type StrokeKindT = (typeof StrokeKind)[keyof typeof StrokeKind]

// A press-and-drag in floor or wall mode. Start/end are
// tile coordinates for floors and vertex coordinates for walls.
export type StrokeT = {
	kind: StrokeKindT
	startX: number
	startZ: number
	endX: number
	endZ: number
}

export type HoverT = { isVisible: boolean; x: number; z: number }

export type NoticeT = { message: string; stamp: number }

const isWorldShape = (value: unknown): value is WorldT => {
	const isObject = typeof value === 'object' && value !== null
	if (!isObject) return false
	const hasObjects = Array.isArray(Reflect.get(value, 'objects'))
	const hasFunds = typeof Reflect.get(value, 'funds') === 'number'
	const hasFloors = typeof Reflect.get(value, 'floors') === 'object'
	const hasWalls = typeof Reflect.get(value, 'walls') === 'object'
	return hasObjects && hasFunds && hasFloors && hasWalls
}

// JSON.parse is the one call here that throws on bad input,
// so it is the one place we catch.
const parseJson = (text: string): unknown => {
	try {
		return JSON.parse(text)
	} catch {
		return null
	}
}

const loadSavedWorld = (): WorldT => {
	const savedText = window.localStorage.getItem(SAVE_KEY)
	if (savedText === null) return buildStarterWorld()

	const parsedWorld = parseJson(savedText)
	const isValidWorld = isWorldShape(parsedWorld)
	if (!isValidWorld) return buildStarterWorld()
	return parsedWorld
}

const saveWorld = (world: WorldT): void => {
	const worldText = JSON.stringify(world)
	window.localStorage.setItem(SAVE_KEY, worldText)
}

export const $world = datass.object<WorldT>(loadSavedWorld())
$world.watch((_previousWorld, nextWorld) => {
	saveWorld(nextWorld)
})

export const $tool = datass.string<ToolIdT>(ToolId.look)

const toolIds: string[] = Object.values(ToolId)

const checkIsToolId = (value: string): value is ToolIdT => {
	return toolIds.includes(value)
}

// Non-React read of the active tool, narrowed to ToolIdT.
export const getActiveTool = (): ToolIdT => {
	const toolValue = $tool.state
	const isKnownTool = checkIsToolId(toolValue)
	if (isKnownTool) return toolValue
	return ToolId.look
}
export const $choices = datass.object<CatalogChoicesT>({
	floor: 'oak',
	wall: 'plaster',
	plant: 'oakTree',
	furniture: 'sofa'
})
export const $placementRotation = datass.number(0)
export const $stroke = datass.object<StrokeT>({ kind: 'none', startX: 0, startZ: 0, endX: 0, endZ: 0 })
export const $hover = datass.object<HoverT>({ isVisible: false, x: 0, z: 0 })
export const $selectedObjectId = datass.string('')
export const $isWallsDown = datass.boolean(false)
export const $isNight = datass.boolean(false)
export const $notice = datass.object<NoticeT>({ message: '', stamp: 0 })
export const $historySize = datass.number(0)

// datass `use()` is untyped, so each store gets a typed hook.
export const useWorld = (): WorldT => {
	return $world.use()
}

export const useTool = (): ToolIdT => {
	return $tool.use()
}

export const useChoices = (): CatalogChoicesT => {
	return $choices.use()
}

export const usePlacementRotation = (): number => {
	return $placementRotation.use()
}

export const useStroke = (): StrokeT => {
	return $stroke.use()
}

export const useHover = (): HoverT => {
	return $hover.use()
}

export const useSelectedObjectId = (): string => {
	return $selectedObjectId.use()
}

export const useIsWallsDown = (): boolean => {
	return $isWallsDown.use()
}

export const useIsNight = (): boolean => {
	return $isNight.use()
}

export const useNotice = (): NoticeT => {
	return $notice.use()
}

export const useHistorySize = (): number => {
	return $historySize.use()
}

export const RenderHealth = {
	ok: 'ok',
	recovering: 'recovering',
	failed: 'failed'
} as const

export type RenderHealthT = (typeof RenderHealth)[keyof typeof RenderHealth]

// What the 3D view is doing, plus the GPU name, so a phone
// that shows a blank scene can say why on screen.
export type RenderStatusT = {
	health: RenderHealthT
	detail: string
	gpuLabel: string
}

export const $renderStatus = datass.object<RenderStatusT>({ health: 'ok', detail: '', gpuLabel: '' })

// Bumping this remounts the Canvas with a fresh WebGL context.
export const $canvasGeneration = datass.number(0)

export const useRenderStatus = (): RenderStatusT => {
	return $renderStatus.use()
}

export const useCanvasGeneration = (): number => {
	return $canvasGeneration.use()
}
