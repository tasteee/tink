import { deleteSelection, editor, redo, selection, undo } from './editor.svelte'
import { gallery, NEW_PEDESTAL_ID, persistLayout } from './gallery.svelte'
import { MOUSE_SENSITIVITY, input, resetHeldInput } from './input'
import {
	cancelToolSession,
	checkIsSessionBusy,
	handleInteract,
	handleNudge,
	handleRotate,
	handleTilt,
	handleWorkspacePress,
	handleWorkspaceRelease
} from './interaction'
import { findPressedAction, keymap } from './keymap.svelte'
import type { ActionIdT } from './keymap.svelte'
import { openProject, returnToGallery } from './navigation'
import { TOOLS } from './tools'
import type { ToolIdT } from './tools'
import { checkIsOverlayOpen, openOverlay, showToast, ui } from './ui.svelte'
import { WHEEL_ITEMS, WHEEL_RADIUS, getWheelIndex } from './wheel'

// Wires keyboard + mouse to the app. All key handling goes
// through the keymap, so every key is rebindable.

let lockTarget: HTMLElement | null = null

export const setLockTarget = (element: HTMLElement | null): void => {
	lockTarget = element
}

export const requestFlying = (): void => {
	const isBlocked = checkIsOverlayOpen() || lockTarget === null
	if (isBlocked) return
	lockTarget?.requestPointerLock()
}

export const setTool = (toolId: ToolIdT): void => {
	cancelToolSession()
	editor.tool = toolId
}

export const toggleMouseMode = (): void => {
	if (ui.isPointerLocked) {
		document.exitPointerLock()
		return
	}

	requestFlying()
}

const handlePointerLockError = (): void => {
	showToast('Could not capture the mouse yet. Try again in a moment')
}

const checkIsTypingTarget = (keyEvent: KeyboardEvent): boolean => {
	const path = keyEvent.composedPath()

	return path.some((target) => {
		const isElement = target instanceof HTMLElement
		if (!isElement) return false
		const isField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT'
		return isField || target.isContentEditable
	})
}

const TOOL_ACTIONS: Partial<Record<ActionIdT, ToolIdT>> = {}
for (const tool of TOOLS) TOOL_ACTIONS[tool.actionId] = tool.id

const runWorkspaceAction = (actionId: ActionIdT): boolean => {
	const toolId = TOOL_ACTIONS[actionId]

	if (toolId) {
		setTool(toolId)
		return true
	}

	if (actionId === 'clearSelection') {
		selection.clear()
		return true
	}

	if (actionId === 'toggleDelete') {
		editor.isDeleteMode = !editor.isDeleteMode
		return true
	}

	if (actionId === 'toggleRenderView') {
		editor.viewMode = editor.viewMode === 'flat' ? 'render' : 'flat'
		return true
	}

	if (actionId === 'undo') {
		cancelToolSession()
		undo()
		return true
	}

	if (actionId === 'redo') {
		cancelToolSession()
		redo()
		return true
	}

	if (actionId === 'interact') {
		cancelToolSession()
		handleInteract()
		return true
	}

	if (actionId === 'rotate') {
		handleRotate()
		return true
	}

	if (actionId === 'rotateTilt') {
		handleTilt()
		return true
	}

	if (actionId === 'nudgeLeft') return runNudge('left')
	if (actionId === 'nudgeRight') return runNudge('right')
	if (actionId === 'nudgeForward') return runNudge('forward')
	if (actionId === 'nudgeBack') return runNudge('back')
	if (actionId === 'nudgeUp') return runNudge('up')
	if (actionId === 'nudgeDown') return runNudge('down')

	if (actionId === 'groupSelection') {
		const hasSelection = selection.size > 0

		if (!hasSelection) {
			showToast('Select voxels first (tool 6)')
			return true
		}

		openOverlay('nameGroup')
		return true
	}

	if (actionId === 'deleteSelection') {
		deleteSelection()
		return true
	}

	if (actionId === 'toggleColors') {
		editor.isColorsOpen = !editor.isColorsOpen
		return true
	}

	if (actionId === 'toggleGroups') {
		editor.isGroupsOpen = !editor.isGroupsOpen
		return true
	}

	if (actionId === 'backToGallery') {
		returnToGallery()
		return true
	}

	return false
}

const runNudge = (nudge: 'left' | 'right' | 'forward' | 'back' | 'up' | 'down'): boolean => {
	handleNudge(nudge)
	return true
}

const handleGalleryInteract = (): void => {
	const aimedId = gallery.aimedId
	const hasAim = aimedId !== ''
	if (!hasAim) return
	ui.overlayProjectId = aimedId
	openOverlay('projectMenu')
}

const runGalleryAction = (actionId: ActionIdT): boolean => {
	if (actionId === 'interact') {
		handleGalleryInteract()
		return true
	}

	return false
}

const openToolWheel = (): void => {
	ui.isToolWheelOpen = true
	ui.toolWheelX = 0
	ui.toolWheelY = 0
}

const closeToolWheel = (): void => {
	const isOpen = ui.isToolWheelOpen
	if (!isOpen) return
	ui.isToolWheelOpen = false
	const pickedIndex = getWheelIndex(ui.toolWheelX, ui.toolWheelY)
	const hasPick = pickedIndex >= 0
	if (!hasPick) return
	chooseWheelItem(pickedIndex)
}

export const chooseWheelItem = (itemIndex: number): void => {
	ui.isToolWheelOpen = false
	const pickedItem = WHEEL_ITEMS[itemIndex]
	if (!pickedItem) return
	const isGallery = pickedItem.id === 'gallery'

	if (isGallery) {
		returnToGallery()
		return
	}

	setTool(pickedItem.id as ToolIdT)
}

const checkIsWheelKey = (keyEvent: KeyboardEvent): boolean => {
	return keymap.toolWheel === keyEvent.code
}

const handleKeyDown = (keyEvent: KeyboardEvent): void => {
	const isTyping = checkIsTypingTarget(keyEvent)
	if (isTyping) return
	const isOverlayOpen = checkIsOverlayOpen()
	if (isOverlayOpen) return
	input.heldCodes.add(keyEvent.code)
	const isWorkspace = ui.route === 'workspace'
	const isWheelKey = checkIsWheelKey(keyEvent)

	if (isWheelKey) {
		keyEvent.preventDefault()
		const shouldOpen = isWorkspace && !keyEvent.repeat
		if (shouldOpen) openToolWheel()
		return
	}

	const isEscape = keyEvent.code === 'Escape'

	if (isEscape) {
		cancelToolSession()
		return
	}

	const isFlyKey = keyEvent.code === keymap.flyUp || keyEvent.code === keymap.flyDown
	if (isFlyKey) keyEvent.preventDefault()
	if (keyEvent.repeat) return
	const actionId = findPressedAction(keyEvent)
	if (actionId === null) return
	const isMouseToggle = actionId === 'toggleMouse'

	if (isMouseToggle) {
		keyEvent.preventDefault()
		toggleMouseMode()
		return
	}

	const wasHandled = isWorkspace ? runWorkspaceAction(actionId) : runGalleryAction(actionId)
	if (wasHandled) keyEvent.preventDefault()
}

const handleKeyUp = (keyEvent: KeyboardEvent): void => {
	input.heldCodes.delete(keyEvent.code)
	const isWheelKey = checkIsWheelKey(keyEvent)
	if (isWheelKey) closeToolWheel()
}

const clampToWheel = (flickX: number, flickY: number): [number, number] => {
	const distance = Math.hypot(flickX, flickY)
	const isInside = distance <= WHEEL_RADIUS
	if (isInside) return [flickX, flickY]
	const ratio = WHEEL_RADIUS / distance
	return [flickX * ratio, flickY * ratio]
}

// Chrome can report one huge jump right after locking, and
// rare spikes later. Those would whip the camera around.
const MAX_MOVE_PER_EVENT = 240
let shouldSkipNextMove = false

const checkIsMoveSpike = (mouseEvent: MouseEvent): boolean => {
	if (shouldSkipNextMove) {
		shouldSkipNextMove = false
		return true
	}

	const isSpikeX = Math.abs(mouseEvent.movementX) > MAX_MOVE_PER_EVENT
	const isSpikeY = Math.abs(mouseEvent.movementY) > MAX_MOVE_PER_EVENT
	return isSpikeX || isSpikeY
}

const handleMouseMove = (mouseEvent: MouseEvent): void => {
	if (!ui.isPointerLocked) return
	const isSpike = checkIsMoveSpike(mouseEvent)
	if (isSpike) return

	if (ui.isToolWheelOpen) {
		const flick = clampToWheel(ui.toolWheelX + mouseEvent.movementX, ui.toolWheelY + mouseEvent.movementY)
		ui.toolWheelX = flick[0]
		ui.toolWheelY = flick[1]
		return
	}

	if (input.isLookFrozen) {
		input.dragDeltaY += mouseEvent.movementY
		return
	}

	input.lookDeltaX += mouseEvent.movementX * MOUSE_SENSITIVITY
	input.lookDeltaY += mouseEvent.movementY * MOUSE_SENSITIVITY
}

const handleGalleryPress = (): void => {
	const movingId = gallery.movingProjectId
	const isMoving = movingId !== ''

	if (isMoving) {
		gallery.movingProjectId = ''
		persistLayout()
		return
	}

	const aimedId = gallery.aimedId
	const isNewPedestal = aimedId === NEW_PEDESTAL_ID
	if (isNewPedestal) return openOverlay('newProject')
	const hasAim = aimedId !== ''
	if (hasAim) openProject(aimedId)
}

const handleMouseDown = (mouseEvent: MouseEvent): void => {
	const isOnTarget = lockTarget !== null && mouseEvent.target === lockTarget
	const isUnlockedClick = !ui.isPointerLocked

	if (isUnlockedClick) {
		if (isOnTarget) requestFlying()
		return
	}

	const isWheelOpen = ui.isToolWheelOpen
	if (isWheelOpen) return
	const isPrimary = mouseEvent.button === 0
	const isSecondary = mouseEvent.button === 2
	const isWorkspace = ui.route === 'workspace'

	if (isSecondary) {
		cancelToolSession()
		const isMoving = gallery.movingProjectId !== ''
		if (isMoving) gallery.movingProjectId = ''
		return
	}

	if (!isPrimary) return
	if (!isWorkspace) return handleGalleryPress()
	handleWorkspacePress({ isAlt: mouseEvent.altKey, isShift: mouseEvent.shiftKey })
}

const handleMouseUp = (mouseEvent: MouseEvent): void => {
	const isPrimary = mouseEvent.button === 0
	if (!isPrimary) return
	const isWorkspace = ui.route === 'workspace'
	if (isWorkspace) handleWorkspaceRelease()
}

const handlePointerLockChange = (): void => {
	const isLocked = document.pointerLockElement !== null
	ui.isPointerLocked = isLocked
	shouldSkipNextMove = isLocked
	if (isLocked) return
	ui.isToolWheelOpen = false
	const isBusy = checkIsSessionBusy()
	if (isBusy) cancelToolSession()
	resetHeldInput()
}

const preventContextMenu = (mouseEvent: MouseEvent): void => {
	const isOnTarget = mouseEvent.target === lockTarget
	if (isOnTarget) mouseEvent.preventDefault()
}

export const setupControls = (): (() => void) => {
	window.addEventListener('keydown', handleKeyDown)
	window.addEventListener('keyup', handleKeyUp)
	window.addEventListener('mousemove', handleMouseMove)
	window.addEventListener('mousedown', handleMouseDown)
	window.addEventListener('mouseup', handleMouseUp)
	window.addEventListener('blur', resetHeldInput)
	window.addEventListener('contextmenu', preventContextMenu)
	document.addEventListener('pointerlockchange', handlePointerLockChange)
	document.addEventListener('pointerlockerror', handlePointerLockError)

	return () => {
		window.removeEventListener('keydown', handleKeyDown)
		window.removeEventListener('keyup', handleKeyUp)
		window.removeEventListener('mousemove', handleMouseMove)
		window.removeEventListener('mousedown', handleMouseDown)
		window.removeEventListener('mouseup', handleMouseUp)
		window.removeEventListener('blur', resetHeldInput)
		window.removeEventListener('contextmenu', preventContextMenu)
		document.removeEventListener('pointerlockchange', handlePointerLockChange)
		document.removeEventListener('pointerlockerror', handlePointerLockError)
	}
}
