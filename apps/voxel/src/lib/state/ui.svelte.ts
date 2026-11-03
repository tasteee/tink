// App-wide UI state: which room you are in, pointer lock,
// which overlay is open, and toast notices.

export type RouteT = 'gallery' | 'workspace'

export type OverlayT =
	| 'none'
	| 'keymap'
	| 'projectSettings'
	| 'newProject'
	| 'renameProject'
	| 'deleteProject'
	| 'exportProject'
	| 'projectMenu'
	| 'aimMenu'
	| 'nameGroup'
	| 'renameGroup'

export type ToastT = {
	id: number
	message: string
	tone: 'neutral' | 'danger'
}

export const ui = $state({
	route: 'gallery' as RouteT,
	isPointerLocked: false,
	overlay: 'none' as OverlayT,
	// project the gallery overlay acts on
	overlayProjectId: '',
	// group the workspace overlay acts on
	overlayGroupId: '',
	isToolWheelOpen: false,
	toolWheelX: 0,
	toolWheelY: 0,
	isReady: false,
	toasts: [] as ToastT[]
})

let nextToastId = 1

export const showToast = (message: string, tone: ToastT['tone'] = 'neutral'): void => {
	const toastId = nextToastId
	nextToastId += 1
	ui.toasts.push({ id: toastId, message, tone })

	setTimeout(() => {
		ui.toasts = ui.toasts.filter((toast) => toast.id !== toastId)
	}, 2600)
}

// Overlays need the mouse, so they always free the pointer.
export const openOverlay = (overlay: OverlayT): void => {
	ui.overlay = overlay
	ui.isToolWheelOpen = false
	document.exitPointerLock()
}

export const closeOverlay = (): void => {
	ui.overlay = 'none'
}

export const checkIsOverlayOpen = (): boolean => {
	return ui.overlay !== 'none'
}
