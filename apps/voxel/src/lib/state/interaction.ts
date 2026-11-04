import { getNormalAxis, scaleVec, toCellKeyFromVec } from '../model/cellKey'
import { castVoxelRay } from '../model/raycast'
import type { AimT } from '../model/raycast'
import { buildLineCells, buildPrefabCells, buildRectangleCells, findConnectedCells, findConnectedSurface, findPrefab } from '../model/shapes'
import { getCell, voxelDoc } from '../model/voxelDoc'
import type { AxisT, Vec3T } from '../model/types'
import {
	applyExtrude,
	checkCanPaintAt,
	checkCanPlaceAt,
	checkCanRemoveAt,
	checkCanSelectAt,
	checkIsCellEditable,
	checkIsVisibleSolid,
	deleteSelection,
	editor,
	findColorRegion,
	getMeta,
	moveGroup,
	nudgeGroupPivot,
	paintCells,
	paintSelection,
	pickColorFromCell,
	placeCells,
	planExtrude,
	removeCells,
	rotateGroup,
	runSelectionEdit,
	selectGroup,
	selection,
	setGroupPivot
} from './editor.svelte'
import type { ExtrudePlanT } from './editor.svelte'
import { cameraRig, input } from './input'
import { checkActionTakesShape, checkIsStampActive } from './tools'
import { openOverlay, showToast, ui } from './ui.svelte'

// Live pointer + preview state, read every frame by the scene.
// Versions let the scene skip work when nothing changed.
// How the ghost is drawn: new voxels, carved voxels, or a
// marker on voxels that already exist.
export type GhostKindT = 'add' | 'remove' | 'paint' | 'select'

export const live = {
	aim: null as AimT | null,
	aimVersion: 0,
	ghostCells: [] as Vec3T[],
	ghostKind: 'add' as GhostKindT,
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

// The cell a tool acts on: where a block lands when placing,
// the voxel under the pointer for every other action.
const getTargetCell = (aim: AimT): Vec3T | null => {
	const isPlacing = editor.action === 'place'
	if (isPlacing) return aim.placeCell
	const isVoxel = aim.kind === 'voxel'
	if (isVoxel) return aim.cell
	return null
}

const checkIsErasing = (): boolean => {
	return editor.action === 'erase'
}

const buildStampCells = (anchor: Vec3T, normal: Vec3T, depth: number, direction: Vec3T): Vec3T[] => {
	const prefab = findPrefab(editor.prefabId)
	return buildPrefabCells(prefab, anchor, normal, editor.prefabTurns, depth, direction)
}

const getHoverStamp = (aim: AimT): Vec3T[] => {
	if (!checkIsErasing()) return buildStampCells(aim.placeCell, aim.normal, 1, aim.normal)
	const isVoxel = aim.kind === 'voxel'
	if (!isVoxel) return []
	return buildStampCells(aim.cell, aim.normal, 1, scaleVec(aim.normal, -1))
}

const getExtrudeGhost = (plan: ExtrudePlanT): Vec3T[] => {
	const hasAdds = plan.adds.length > 0
	if (hasAdds) return plan.adds
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
	const takesShape = checkActionTakesShape(editor.action)
	if (!takesShape) return []
	const shape = editor.shape
	if (shape === 'fill') return []
	if (shape === 'stamp') return getHoverStamp(aim)
	const target = getTargetCell(aim)
	if (!target) return session.anchor ? [session.anchor] : []
	if (shape === 'block') return [target]

	if (shape === 'line') {
		if (!session.anchor) return [target]
		return buildLineCells(session.anchor, target)
	}

	if (shape === 'square') {
		if (!session.anchor) return [target]
		return buildRectangleCells(session.anchor, session.anchorNormal, target)
	}

	return []
}

// Keeps only cells the tool can actually change, so the ghost
// shows exactly what a click will do.
const filterUsefulCells = (cells: Vec3T[], kind: GhostKindT): Vec3T[] => {
	if (kind === 'remove') return cells.filter(checkCanRemoveAt)
	if (kind === 'paint') return cells.filter(checkCanPaintAt)
	if (kind === 'select') return cells.filter(checkCanSelectAt)
	return cells.filter(checkCanPlaceAt)
}

const getGhostKind = (): GhostKindT => {
	const isExtrudeDrag = session.isDragging && session.dragKind === 'extrude'

	if (isExtrudeDrag) {
		const isShrinking = getDragDistance() < 0
		return isShrinking ? 'remove' : 'add'
	}

	const action = editor.action
	if (action === 'erase') return 'remove'
	if (action === 'paint') return 'paint'
	if (action === 'select') return 'select'
	return 'add'
}

const buildGhostSignature = (aim: AimT | null): string => {
	const aimPart = aim ? `${aim.kind}:${aim.cell.join()}:${aim.normal.join()}` : 'none'
	const anchorPart = session.anchor ? session.anchor.join() : '-'
	const dragPart = session.isDragging ? `${session.dragKind}:${getDragDistance()}` : '-'
	const toolPart = `${editor.action}:${editor.shape}:${editor.prefabId}:${editor.prefabTurns}`
	return `${aimPart}|${anchorPart}|${dragPart}|${toolPart}|${editor.docVersion}`
}

const refreshGhost = (): void => {
	const nextSignature = buildGhostSignature(live.aim)
	const isSame = nextSignature === ghostSignature
	if (isSame) return
	ghostSignature = nextSignature
	const ghostKind = getGhostKind()
	const rawCells = computeGhostCells(live.aim)
	live.ghostCells = filterUsefulCells(rawCells, ghostKind)
	live.ghostKind = ghostKind
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

// Runs the current action on cells a shape produced.
const applyActionToCells = (label: string, cells: Vec3T[], isAdditive: boolean): void => {
	const action = editor.action
	if (action === 'erase') return removeCells(label, cells)
	if (action === 'paint') return paintCells(label, cells)
	if (action === 'select') return selectCells(cells, isAdditive)
	placeCells(label, cells)
}

const selectCells = (cells: Vec3T[], isAdditive: boolean): void => {
	runSelectionEdit('selection', () => {
		if (!isAdditive) selection.clear()
		for (const cell of cells) selection.add(toCellKeyFromVec(cell))
	})
}

const handleBlockClick = (aim: AimT, modifiers: ClickModifiersT): void => {
	const action = editor.action
	if (action === 'place') return placeCells('place block', [aim.placeCell])
	if (action === 'select') return handleSelectBlockClick(aim, modifiers.isShift)
	const isVoxel = aim.kind === 'voxel'
	if (!isVoxel) return
	if (action === 'erase') return removeCells('erase block', [aim.cell])
	paintCells('paint block', [aim.cell])
}

const commitGhost = (label: string, isAdditive: boolean): void => {
	applyActionToCells(label, live.ghostCells, isAdditive)
}

const handleTwoClickShape = (aim: AimT, modifiers: ClickModifiersT): void => {
	const target = getTargetCell(aim)
	if (!target) return

	if (!session.anchor) {
		session.anchor = target
		session.anchorNormal = aim.normal
		return
	}

	commitGhost(`${editor.action} ${editor.shape}`, modifiers.isShift)
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
	const isCarveWithoutVoxel = checkIsErasing() && !isVoxel
	if (isCarveWithoutVoxel) return
	session.isDragging = true
	session.dragKind = 'stamp'
	session.anchorNormal = aim.normal
	session.stampAnchor = checkIsErasing() ? aim.cell : aim.placeCell
	session.stampDirection = checkIsErasing() ? scaleVec(aim.normal, -1) : aim.normal
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

	commitGhost('stamp', false)
}

const DOUBLE_CLICK_MS = 320

const handleSelectBlockClick = (aim: AimT, isAdditive: boolean): void => {
	const isVoxel = aim.kind === 'voxel'

	if (!isVoxel) {
		runSelectionEdit('clear selection', () => selection.clear())
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
		runSelectionEdit('select connected', () => {
			for (const connectedCell of connected) selection.add(toCellKeyFromVec(connectedCell))
		})
		return
	}

	runSelectionEdit('selection', () => {
		if (!isAdditive) selection.clear()
		const isSelected = selection.has(key)

		if (isSelected) {
			selection.delete(key)
			return
		}

		selection.add(key)
	})
}

// Fill: clicking inside the selection acts on the whole
// selection, anywhere else on the connected same-color voxels.
const handleFillClick = (aim: AimT, modifiers: ClickModifiersT): void => {
	const isVoxel = aim.kind === 'voxel'
	if (!isVoxel) return
	const action = editor.action
	const region = findColorRegion(aim.cell)
	const hasSelection = selection.size > 0
	const isInSelection = selection.has(toCellKeyFromVec(aim.cell))
	const shouldUseSelection = hasSelection && isInSelection

	if (action === 'erase') {
		if (shouldUseSelection) return deleteSelection()
		return removeCells('erase fill', region)
	}

	if (action === 'paint') {
		if (shouldUseSelection) return paintSelection()
		return paintCells('paint fill', region)
	}

	const selectableRegion = region.filter(checkCanSelectAt)
	const hasSelectable = selectableRegion.length > 0

	if (!hasSelectable) {
		showToast('Edit mode works inside the active group')
		return
	}

	selectCells(selectableRegion, modifiers.isShift)
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

export type ClickModifiersT = {
	isAlt: boolean
	isShift: boolean
}

export const handleWorkspacePress = (modifiers: ClickModifiersT): void => {
	const aim = live.aim
	if (!aim) return
	const isEyedropper = modifiers.isAlt && aim.kind === 'voxel'
	if (isEyedropper) return pickColorFromCell(aim.cell)
	const action = editor.action
	if (action === 'extrude') return startExtrude(aim)
	if (action === 'object') return handleObjectClick(aim)
	if (action === 'pivot') return handlePivotClick(aim)
	const shape = editor.shape
	if (shape === 'block') return handleBlockClick(aim, modifiers)
	if (shape === 'line') return handleTwoClickShape(aim, modifiers)
	if (shape === 'square') return handleTwoClickShape(aim, modifiers)
	if (shape === 'fill') return handleFillClick(aim, modifiers)
	if (shape === 'stamp') return startStamp(aim)
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
	const isPivotTool = editor.action === 'pivot'
	if (isPivotTool) return nudgeGroupPivot(getPivotTargetGroupId(), step)
	const hasSelectedGroup = editor.selectedGroupId !== ''
	const isObjectTool = editor.action === 'object'
	const canMoveGroup = isObjectTool && hasSelectedGroup
	if (canMoveGroup) moveGroup(editor.selectedGroupId, step)
}

// R rotates the stamp, or the selected group about Y.
export const handleRotate = (): void => {
	const isStamp = checkIsStampActive(editor.action, editor.shape)

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
