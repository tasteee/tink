import { getNormalAxis, scaleVec, toCellKeyFromVec } from '../model/cellKey'
import { castVoxelRay } from '../model/raycast'
import type { AimT } from '../model/raycast'
import { buildLineCells, buildPrefabCells, buildRectangleCells, findConnectedCells, findConnectedSurface, findPrefab } from '../model/shapes'
import { getCell, voxelDoc } from '../model/voxelDoc'
import type { AxisT, Vec3T } from '../model/types'
import {
	applyExtrude,
	checkCanPlaceAt,
	checkCanRemoveAt,
	checkIsCellEditable,
	checkIsVisibleSolid,
	deleteSelection,
	editor,
	eraseRegion,
	getMeta,
	moveGroup,
	nudgeGroupPivot,
	paintRegion,
	paintSelection,
	pickColorFromCell,
	placeCells,
	planExtrude,
	removeCells,
	rotateGroup,
	selectGroup,
	selection,
	setGroupPivot
} from './editor.svelte'
import type { ExtrudePlanT } from './editor.svelte'
import { cameraRig, input } from './input'
import { openOverlay, showToast, ui } from './ui.svelte'

// Live pointer + preview state, read every frame by the scene.
// Versions let the scene skip work when nothing changed.
export const live = {
	aim: null as AimT | null,
	aimVersion: 0,
	ghostCells: [] as Vec3T[],
	isGhostRemoval: false,
	ghostVersion: 0
}

// A multi-step tool action in progress.
const session = {
	anchor: null as Vec3T | null,
	anchorNormal: [0, 1, 0] as Vec3T,
	isDragging: false,
	dragKind: 'extrude' as 'extrude' | 'stamp',
	dragSurface: [] as Vec3T[],
	dragNormal: [0, 1, 0] as Vec3T,
	stampAnchor: [0, 0, 0] as Vec3T,
	stampDirection: [0, 1, 0] as Vec3T,
	lastClickTime: 0,
	lastClickKey: -1
}

let ghostSignature = ''

const DRAG_PIXELS_PER_LAYER = 28

export const checkIsSessionBusy = (): boolean => {
	return session.anchor !== null || session.isDragging
}

export const cancelToolSession = (): void => {
	session.anchor = null
	session.isDragging = false
	session.dragSurface = []
	input.isLookFrozen = false
	input.dragDeltaY = 0
	ghostSignature = ''
}

const getDragDistance = (): number => {
	return Math.round(-input.dragDeltaY / DRAG_PIXELS_PER_LAYER)
}

const getStampDepth = (): number => {
	return 1 + Math.max(0, getDragDistance())
}

// The cell a tool acts on: where a block lands when adding,
// the voxel under the pointer when deleting.
const getTargetCell = (aim: AimT): Vec3T | null => {
	if (!editor.isDeleteMode) return aim.placeCell
	const isVoxel = aim.kind === 'voxel'
	if (isVoxel) return aim.cell
	return null
}

const buildStampCells = (anchor: Vec3T, normal: Vec3T, depth: number, direction: Vec3T): Vec3T[] => {
	const prefab = findPrefab(editor.prefabId)
	return buildPrefabCells(prefab, anchor, normal, editor.prefabTurns, depth, direction)
}

const getHoverStamp = (aim: AimT): Vec3T[] => {
	if (!editor.isDeleteMode) return buildStampCells(aim.placeCell, aim.normal, 1, aim.normal)
	const isVoxel = aim.kind === 'voxel'
	if (!isVoxel) return []
	return buildStampCells(aim.cell, aim.normal, 1, scaleVec(aim.normal, -1))
}

const getExtrudeGhost = (plan: ExtrudePlanT): Vec3T[] => {
	const hasAdds = plan.adds.length > 0
	if (hasAdds) return plan.adds.map((add) => add.position)
	return plan.removals
}

let lastExtrudePlan: ExtrudePlanT = { adds: [], removals: [] }

const computeGhostCells = (aim: AimT | null): Vec3T[] => {
	const isExtrudeDrag = session.isDragging && session.dragKind === 'extrude'

	if (isExtrudeDrag) {
		lastExtrudePlan = planExtrude(session.dragSurface, session.dragNormal, getDragDistance())
		return getExtrudeGhost(lastExtrudePlan)
	}

	const isStampDrag = session.isDragging && session.dragKind === 'stamp'
	if (isStampDrag) return buildStampCells(session.stampAnchor, session.anchorNormal, getStampDepth(), session.stampDirection)
	if (!aim) return []
	const target = getTargetCell(aim)
	const tool = editor.tool

	if (tool === 'block') return target ? [target] : []
	if (tool === 'stamp') return getHoverStamp(aim)
	if (!target) return session.anchor ? [session.anchor] : []

	if (tool === 'line') {
		if (!session.anchor) return [target]
		return buildLineCells(session.anchor, target)
	}

	if (tool === 'square') {
		if (!session.anchor) return [target]
		return buildRectangleCells(session.anchor, session.anchorNormal, target)
	}

	return []
}

// Keeps only cells the tool can actually change, so the ghost
// shows exactly what a click will do.
const filterUsefulCells = (cells: Vec3T[], isRemoval: boolean): Vec3T[] => {
	if (isRemoval) return cells.filter(checkCanRemoveAt)
	return cells.filter(checkCanPlaceAt)
}

const getGhostIsRemoval = (): boolean => {
	const isExtrudeDrag = session.isDragging && session.dragKind === 'extrude'
	if (!isExtrudeDrag) return editor.isDeleteMode
	return getDragDistance() < 0
}

const buildGhostSignature = (aim: AimT | null): string => {
	const aimPart = aim ? `${aim.kind}:${aim.cell.join()}:${aim.normal.join()}` : 'none'
	const anchorPart = session.anchor ? session.anchor.join() : '-'
	const dragPart = session.isDragging ? `${session.dragKind}:${getDragDistance()}` : '-'
	const toolPart = `${editor.tool}:${editor.isDeleteMode}:${editor.prefabId}:${editor.prefabTurns}`
	return `${aimPart}|${anchorPart}|${dragPart}|${toolPart}|${editor.docVersion}`
}

const refreshGhost = (): void => {
	const nextSignature = buildGhostSignature(live.aim)
	const isSame = nextSignature === ghostSignature
	if (isSame) return
	ghostSignature = nextSignature
	const isRemoval = getGhostIsRemoval()
	const rawCells = computeGhostCells(live.aim)
	live.ghostCells = filterUsefulCells(rawCells, isRemoval)
	live.isGhostRemoval = isRemoval
	live.ghostVersion += 1
}

// Called every frame by the workspace scene.
export const updateWorkspaceAim = (origin: Vec3T, direction: Vec3T): void => {
	const meta = editor.meta
	if (!meta) return

	live.aim = castVoxelRay({
		origin,
		direction,
		roomSize: voxelDoc.roomSize,
		checkIsSolid: checkIsVisibleSolid
	})

	live.aimVersion += 1
	refreshGhost()
}

// ---------- clicks ----------

const handleBlockClick = (aim: AimT): void => {
	if (editor.isDeleteMode) {
		const isVoxel = aim.kind === 'voxel'
		if (isVoxel) removeCells('remove block', [aim.cell])
		return
	}

	placeCells('place block', [aim.placeCell])
}

const commitGhost = (label: string): void => {
	const cells = live.ghostCells
	if (live.isGhostRemoval) return removeCells(label, cells)
	placeCells(label, cells)
}

const handleTwoClickTool = (aim: AimT, label: string): void => {
	const target = getTargetCell(aim)
	if (!target) return

	if (!session.anchor) {
		session.anchor = target
		session.anchorNormal = aim.normal
		return
	}

	commitGhost(label)
	cancelToolSession()
}

const startExtrude = (aim: AimT): void => {
	const isVoxel = aim.kind === 'voxel'

	if (!isVoxel) {
		showToast('Extrude needs a voxel face')
		return
	}

	const surface = findConnectedSurface({
		start: aim.cell,
		normal: aim.normal,
		roomSize: voxelDoc.roomSize,
		checkIsSurfaceCell: (cell) => checkIsCellEditable(getCell(toCellKeyFromVec(cell))),
		checkIsSolid: (cell) => voxelDoc.cells.has(toCellKeyFromVec(cell))
	})

	const hasSurface = surface.length > 0
	if (!hasSurface) return
	session.isDragging = true
	session.dragKind = 'extrude'
	session.dragSurface = surface
	session.dragNormal = aim.normal
	input.isLookFrozen = true
	input.dragDeltaY = 0
}

const startStamp = (aim: AimT): void => {
	const isVoxel = aim.kind === 'voxel'
	const isCarveWithoutVoxel = editor.isDeleteMode && !isVoxel
	if (isCarveWithoutVoxel) return
	session.isDragging = true
	session.dragKind = 'stamp'
	session.anchorNormal = aim.normal
	session.stampAnchor = editor.isDeleteMode ? aim.cell : aim.placeCell
	session.stampDirection = editor.isDeleteMode ? scaleVec(aim.normal, -1) : aim.normal
	input.isLookFrozen = true
	input.dragDeltaY = 0
}

const finishDrag = (): void => {
	const isExtrude = session.dragKind === 'extrude'

	if (isExtrude) {
		const plan = planExtrude(session.dragSurface, session.dragNormal, getDragDistance())
		applyExtrude(plan)
		return
	}

	commitGhost('stamp')
}

const DOUBLE_CLICK_MS = 320

const handleSelectClick = (aim: AimT, isAdditive: boolean): void => {
	const isVoxel = aim.kind === 'voxel'

	if (!isVoxel) {
		selection.clear()
		return
	}

	const key = toCellKeyFromVec(aim.cell)
	const cell = getCell(key)
	if (!cell) return
	const meta = getMeta()
	const isInActiveGroup = cell.groupId === meta.activeGroupId

	if (!isInActiveGroup) {
		showToast('Edit mode works inside the active group')
		return
	}

	const now = performance.now()
	const isDoubleClick = now - session.lastClickTime < DOUBLE_CLICK_MS && session.lastClickKey === key
	session.lastClickTime = now
	session.lastClickKey = key

	if (isDoubleClick) {
		const connected = findConnectedCells(aim.cell, voxelDoc.roomSize, (candidate) => {
			return getCell(toCellKeyFromVec(candidate))?.groupId === cell.groupId
		})
		for (const connectedCell of connected) selection.add(toCellKeyFromVec(connectedCell))
		return
	}

	if (!isAdditive) selection.clear()
	const isSelected = selection.has(key)

	if (isSelected) {
		selection.delete(key)
		return
	}

	selection.add(key)
}

const handleObjectClick = (aim: AimT): void => {
	const isVoxel = aim.kind === 'voxel'

	if (!isVoxel) {
		editor.selectedGroupId = ''
		return
	}

	const cell = getCell(toCellKeyFromVec(aim.cell))
	if (cell) selectGroup(cell.groupId)
}

export const getPivotTargetGroupId = (): string => {
	const hasSelectedGroup = editor.selectedGroupId !== ''
	if (hasSelectedGroup) return editor.selectedGroupId
	return editor.meta?.activeGroupId ?? ''
}

const handlePivotClick = (aim: AimT): void => {
	const isVoxel = aim.kind === 'voxel'
	if (!isVoxel) return
	const groupId = getPivotTargetGroupId()
	const pivot: Vec3T = [aim.cell[0] + 0.5, aim.cell[1] + 0.5, aim.cell[2] + 0.5]
	setGroupPivot(groupId, pivot)
}

// Clicking inside the selection acts on the whole selection.
// Anywhere else it acts on the connected same-color voxels.
const handlePaintClick = (aim: AimT): void => {
	const isVoxel = aim.kind === 'voxel'
	if (!isVoxel) return
	const hasSelection = selection.size > 0
	const isInSelection = selection.has(toCellKeyFromVec(aim.cell))
	const shouldUseSelection = hasSelection && isInSelection

	if (editor.isDeleteMode) {
		if (shouldUseSelection) return deleteSelection()
		eraseRegion(aim.cell)
		return
	}

	if (shouldUseSelection) return paintSelection()
	paintRegion(aim.cell)
}

export type ClickModifiersT = {
	isAlt: boolean
	isShift: boolean
}

export const handleWorkspacePress = (modifiers: ClickModifiersT): void => {
	const aim = live.aim
	if (!aim) return
	const isEyedropper = modifiers.isAlt && aim.kind === 'voxel'
	if (isEyedropper) return pickColorFromCell(aim.cell)
	const tool = editor.tool

	if (tool === 'block') return handleBlockClick(aim)
	if (tool === 'line') return handleTwoClickTool(aim, 'line')
	if (tool === 'square') return handleTwoClickTool(aim, 'square')
	if (tool === 'extrude') return startExtrude(aim)
	if (tool === 'stamp') return startStamp(aim)
	if (tool === 'select') return handleSelectClick(aim, modifiers.isShift)
	if (tool === 'object') return handleObjectClick(aim)
	if (tool === 'pivot') return handlePivotClick(aim)
	if (tool === 'paint') return handlePaintClick(aim)
}

export const handleWorkspaceRelease = (): void => {
	if (!session.isDragging) return
	finishDrag()
	cancelToolSession()
}

// ---------- keyboard actions ----------

// Camera-relative step snapped to the closest world axis.
const getViewStep = (direction: 'left' | 'right' | 'forward' | 'back'): Vec3T => {
	const forwardX = Math.round(-Math.sin(cameraRig.yaw) * 1000) / 1000
	const forwardZ = Math.round(-Math.cos(cameraRig.yaw) * 1000) / 1000
	const isXDominant = Math.abs(forwardX) >= Math.abs(forwardZ)
	const forward: Vec3T = isXDominant ? [Math.sign(forwardX), 0, 0] : [0, 0, Math.sign(forwardZ)]
	const right: Vec3T = [-forward[2], 0, forward[0]]
	if (direction === 'forward') return forward
	if (direction === 'back') return scaleVec(forward, -1)
	if (direction === 'right') return right
	return scaleVec(right, -1)
}

export const getStepForNudge = (nudge: 'left' | 'right' | 'forward' | 'back' | 'up' | 'down'): Vec3T => {
	if (nudge === 'up') return [0, 1, 0]
	if (nudge === 'down') return [0, -1, 0]
	return getViewStep(nudge)
}

export const handleNudge = (nudge: 'left' | 'right' | 'forward' | 'back' | 'up' | 'down'): void => {
	const step = getStepForNudge(nudge)
	const isPivotTool = editor.tool === 'pivot'
	if (isPivotTool) return nudgeGroupPivot(getPivotTargetGroupId(), step)
	const hasSelectedGroup = editor.selectedGroupId !== ''
	const isObjectTool = editor.tool === 'object'
	const canMoveGroup = isObjectTool && hasSelectedGroup
	if (canMoveGroup) moveGroup(editor.selectedGroupId, step)
}

// R rotates the stamp, or the selected group about Y.
export const handleRotate = (): void => {
	const isStamp = editor.tool === 'stamp'

	if (isStamp) {
		editor.prefabTurns = (editor.prefabTurns + 1) % 4
		ghostSignature = ''
		return
	}

	const hasSelectedGroup = editor.selectedGroupId !== ''
	if (hasSelectedGroup) rotateGroup(editor.selectedGroupId, 1)
}

// Tilts around the horizontal axis you are looking across.
export const handleTilt = (): void => {
	const hasSelectedGroup = editor.selectedGroupId !== ''
	if (!hasSelectedGroup) return
	const forward = getViewStep('forward')
	const tiltAxis: AxisT = getNormalAxis(forward) === 0 ? 2 : 0
	rotateGroup(editor.selectedGroupId, tiltAxis)
}

export const handleInteract = (): void => {
	const aim = live.aim
	const isVoxel = aim !== null && aim.kind === 'voxel'
	ui.overlayGroupId = ''

	if (isVoxel && aim) {
		const cell = getCell(toCellKeyFromVec(aim.cell))
		ui.overlayGroupId = cell ? cell.groupId : ''
	}

	openOverlay('aimMenu')
}
