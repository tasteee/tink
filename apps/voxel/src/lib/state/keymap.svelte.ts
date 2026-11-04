// Every keyboard action goes through this one keymap.
// A binding is a combo string like "Ctrl+Shift+KeyZ".
// Held keys (movement) match by code alone, so Shift boost
// or other modifiers never block flying.

export type ActionIdT =
	| 'moveForward'
	| 'moveBack'
	| 'moveLeft'
	| 'moveRight'
	| 'flyUp'
	| 'flyDown'
	| 'boost'
	| 'toolWheel'
	| 'interact'
	| 'actionPlace'
	| 'actionErase'
	| 'actionPaint'
	| 'actionSelect'
	| 'actionExtrude'
	| 'actionObject'
	| 'actionPivot'
	| 'shapeBlock'
	| 'shapeLine'
	| 'shapeSquare'
	| 'shapeFill'
	| 'shapeStamp'
	| 'toggleErase'
	| 'toggleMouse'
	| 'toggleRenderView'
	| 'undo'
	| 'redo'
	| 'rotate'
	| 'rotateTilt'
	| 'nudgeLeft'
	| 'nudgeRight'
	| 'nudgeForward'
	| 'nudgeBack'
	| 'nudgeUp'
	| 'nudgeDown'
	| 'groupSelection'
	| 'deleteSelection'
	| 'clearSelection'
	| 'toggleColors'
	| 'toggleGroups'
	| 'backToGallery'

export type ActionInfoT = {
	id: ActionIdT
	label: string
	section: 'Move' | 'Build' | 'Groups' | 'App'
	isHeld: boolean
}

export const ACTIONS: ActionInfoT[] = [
	{ id: 'moveForward', label: 'Move forward', section: 'Move', isHeld: true },
	{ id: 'moveBack', label: 'Move back', section: 'Move', isHeld: true },
	{ id: 'moveLeft', label: 'Move left', section: 'Move', isHeld: true },
	{ id: 'moveRight', label: 'Move right', section: 'Move', isHeld: true },
	{ id: 'flyUp', label: 'Fly up', section: 'Move', isHeld: true },
	{ id: 'flyDown', label: 'Fly down', section: 'Move', isHeld: true },
	{ id: 'boost', label: 'Fly faster', section: 'Move', isHeld: true },
	{ id: 'toolWheel', label: 'Tool wheel (hold)', section: 'Build', isHeld: false },
	{ id: 'interact', label: 'Menu for aimed thing', section: 'Build', isHeld: false },
	{ id: 'actionPlace', label: 'Action: place', section: 'Build', isHeld: false },
	{ id: 'actionErase', label: 'Action: erase', section: 'Build', isHeld: false },
	{ id: 'actionPaint', label: 'Action: paint', section: 'Build', isHeld: false },
	{ id: 'actionSelect', label: 'Action: select', section: 'Build', isHeld: false },
	{ id: 'actionExtrude', label: 'Action: extrude', section: 'Build', isHeld: false },
	{ id: 'shapeBlock', label: 'Shape: block', section: 'Build', isHeld: false },
	{ id: 'shapeLine', label: 'Shape: line', section: 'Build', isHeld: false },
	{ id: 'shapeSquare', label: 'Shape: square', section: 'Build', isHeld: false },
	{ id: 'shapeFill', label: 'Shape: fill', section: 'Build', isHeld: false },
	{ id: 'shapeStamp', label: 'Shape: prefab stamp', section: 'Build', isHeld: false },
	{ id: 'actionObject', label: 'Mode: object', section: 'Build', isHeld: false },
	{ id: 'actionPivot', label: 'Mode: pivot', section: 'Build', isHeld: false },
	{ id: 'toggleErase', label: 'Swap place / erase', section: 'Build', isHeld: false },
	{ id: 'rotate', label: 'Rotate stamp / group', section: 'Build', isHeld: false },
	{ id: 'rotateTilt', label: 'Tilt group', section: 'Groups', isHeld: false },
	{ id: 'nudgeLeft', label: 'Nudge left', section: 'Groups', isHeld: false },
	{ id: 'nudgeRight', label: 'Nudge right', section: 'Groups', isHeld: false },
	{ id: 'nudgeForward', label: 'Nudge forward', section: 'Groups', isHeld: false },
	{ id: 'nudgeBack', label: 'Nudge back', section: 'Groups', isHeld: false },
	{ id: 'nudgeUp', label: 'Nudge up', section: 'Groups', isHeld: false },
	{ id: 'nudgeDown', label: 'Nudge down', section: 'Groups', isHeld: false },
	{ id: 'groupSelection', label: 'Group selection', section: 'Groups', isHeld: false },
	{ id: 'deleteSelection', label: 'Delete selection', section: 'Groups', isHeld: false },
	{ id: 'clearSelection', label: 'Clear selection', section: 'Groups', isHeld: false },
	{ id: 'toggleMouse', label: 'Free mouse / resume flying', section: 'App', isHeld: false },
	{ id: 'toggleRenderView', label: 'Toggle render view', section: 'App', isHeld: false },
	{ id: 'toggleColors', label: 'Toggle colors panel', section: 'App', isHeld: false },
	{ id: 'toggleGroups', label: 'Toggle groups panel', section: 'App', isHeld: false },
	{ id: 'undo', label: 'Undo', section: 'App', isHeld: false },
	{ id: 'redo', label: 'Redo', section: 'App', isHeld: false },
	{ id: 'backToGallery', label: 'Back to gallery', section: 'App', isHeld: false }
]

export const DEFAULT_BINDINGS: Record<ActionIdT, string> = {
	moveForward: 'KeyW',
	moveBack: 'KeyS',
	moveLeft: 'KeyA',
	moveRight: 'KeyD',
	flyUp: 'Space',
	flyDown: 'KeyC',
	boost: 'ShiftLeft',
	toolWheel: 'Tab',
	interact: 'KeyE',
	actionPlace: 'Digit1',
	actionErase: 'Digit2',
	actionPaint: 'Digit3',
	actionSelect: 'Digit4',
	actionExtrude: 'Digit5',
	shapeBlock: 'Digit6',
	shapeLine: 'Digit7',
	shapeSquare: 'Digit8',
	shapeFill: 'Digit9',
	shapeStamp: 'Digit0',
	actionObject: 'KeyO',
	actionPivot: 'KeyP',
	toggleErase: 'KeyX',
	toggleMouse: 'KeyF',
	toggleRenderView: 'KeyV',
	undo: 'Ctrl+KeyZ',
	redo: 'Ctrl+Shift+KeyZ',
	rotate: 'KeyR',
	rotateTilt: 'Shift+KeyR',
	nudgeLeft: 'ArrowLeft',
	nudgeRight: 'ArrowRight',
	nudgeForward: 'ArrowUp',
	nudgeBack: 'ArrowDown',
	nudgeUp: 'PageUp',
	nudgeDown: 'PageDown',
	groupSelection: 'KeyG',
	deleteSelection: 'Delete',
	clearSelection: 'KeyQ',
	toggleColors: 'KeyK',
	toggleGroups: 'KeyL',
	backToGallery: 'KeyH'
}

const STORAGE_KEY = 'voxel-editor:keymap'

const readSavedBindings = (): Partial<Record<ActionIdT, string>> => {
	try {
		const savedText = window.localStorage.getItem(STORAGE_KEY)
		if (savedText === null) return {}
		return JSON.parse(savedText)
	} catch {
		return {}
	}
}

export const keymap = $state<Record<ActionIdT, string>>({ ...DEFAULT_BINDINGS, ...readSavedBindings() })

const saveBindings = (): void => {
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(keymap))
	} catch {
		// Storage can be blocked; the keymap still works for this visit.
	}
}

export const setBinding = (actionId: ActionIdT, combo: string): void => {
	keymap[actionId] = combo
	saveBindings()
}

export const resetBindings = (): void => {
	Object.assign(keymap, DEFAULT_BINDINGS)
	saveBindings()
}

const MODIFIER_CODES = ['ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight']

export const checkIsModifierCode = (code: string): boolean => {
	return MODIFIER_CODES.includes(code)
}

// Builds the combo string for a keyboard event.
export const getComboFromEvent = (keyEvent: KeyboardEvent): string => {
	const isModifierOnly = checkIsModifierCode(keyEvent.code)
	if (isModifierOnly) return keyEvent.code
	const parts: string[] = []
	const hasControl = keyEvent.ctrlKey || keyEvent.metaKey
	if (hasControl) parts.push('Ctrl')
	if (keyEvent.altKey) parts.push('Alt')
	if (keyEvent.shiftKey) parts.push('Shift')
	parts.push(keyEvent.code)
	return parts.join('+')
}

// The action an event triggers. Held actions are skipped here.
export const findPressedAction = (keyEvent: KeyboardEvent): ActionIdT | null => {
	const combo = getComboFromEvent(keyEvent)
	const pressActions = ACTIONS.filter((action) => !action.isHeld)
	const matchedAction = pressActions.find((action) => keymap[action.id] === combo)
	return matchedAction?.id ?? null
}

export const checkIsHeldAction = (actionId: ActionIdT, heldCodes: Set<string>): boolean => {
	const binding = keymap[actionId]
	const comboParts = binding.split('+')
	const code = comboParts[comboParts.length - 1]
	return heldCodes.has(code)
}

const CODE_LABELS: Record<string, string> = {
	Space: 'Space',
	ShiftLeft: 'Shift',
	ShiftRight: 'Shift',
	ControlLeft: 'Ctrl',
	AltLeft: 'Alt',
	ArrowLeft: '←',
	ArrowRight: '→',
	ArrowUp: '↑',
	ArrowDown: '↓',
	PageUp: 'PgUp',
	PageDown: 'PgDn',
	Backspace: '⌫',
	Escape: 'Esc'
}

const formatCode = (code: string): string => {
	const knownLabel = CODE_LABELS[code]
	if (knownLabel) return knownLabel
	const isLetter = code.startsWith('Key')
	if (isLetter) return code.slice(3)
	const isDigit = code.startsWith('Digit')
	if (isDigit) return code.slice(5)
	return code
}

// "Ctrl+Shift+KeyZ" -> ["Ctrl", "Shift", "Z"]
export const formatComboParts = (combo: string): string[] => {
	return combo.split('+').map(formatCode)
}

export const getActionLabelKeys = (actionId: ActionIdT): string => {
	return formatComboParts(keymap[actionId]).join(' ')
}
