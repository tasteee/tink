import { useEffect, useRef, type ReactNode } from 'react'

// React wrappers for the interactive zest elements. They bridge two gaps React
// doesn't handle for custom elements: Atomico CustomEvents (input/change/select)
// aren't auto-bound to onX props, and array/value data is best set as a property.

type SelectOption = { label: string; value: string }

// Attach a listener for an Atomico CustomEvent<{...}> on a custom element.
const useCustomEvent = <D,>(
	ref: React.RefObject<HTMLElement | null>,
	name: string,
	handler: (detail: D) => void
) => {
	const saved = useRef(handler)
	useEffect(() => {
		saved.current = handler
	})
	useEffect(() => {
		const el = ref.current
		if (!el) return
		const listener = (e: Event) => saved.current((e as CustomEvent<D>).detail)
		el.addEventListener(name, listener)
		return () => el.removeEventListener(name, listener)
	}, [ref, name])
}

type ZInputProps = {
	value: string
	onValue: (value: string) => void
	placeholder?: string
	type?: string
	size?: string
}

export const ZInput = ({ value, onValue, placeholder, type, size }: ZInputProps) => {
	const ref = useRef<HTMLElement>(null)
	useCustomEvent<{ value: string }>(ref, 'input', (detail) => onValue(detail.value))
	return <z-input ref={ref} value={value} placeholder={placeholder} type={type} size={size} />
}

type ZSelectProps = {
	value: string
	options: SelectOption[]
	onValue: (value: string) => void
	placeholder?: string
	size?: string
}

export const ZSelect = ({ value, options, onValue, placeholder, size }: ZSelectProps) => {
	const ref = useRef<HTMLElement>(null)
	useCustomEvent<{ value: string }>(ref, 'change', (detail) => onValue(detail.value))
	// `options` is an Atomico array prop; React 19 sets it as a property.
	return <z-select ref={ref} value={value} options={options} placeholder={placeholder} size={size} />
}

type ZBadgeProps = {
	label: string
	value: string
	tone?: 'primary' | 'secondary' | 'neutral' | 'success' | 'warning' | 'danger'
	kind?: 'soft' | 'solid' | 'outline'
	isSelected?: boolean
	onSelect?: (selected: boolean, value?: string) => void
	isRemovable?: boolean
	onRemove?: (value?: string) => void
	children?: ReactNode
}

// React wrapper for an interactive z-badge (selectable/removable tag — formerly
// z-chip). Bridges the Atomico `select`/`remove` CustomEvents to onX callbacks.
export const ZBadge = ({ label, value, tone, kind, isSelected, onSelect, isRemovable, onRemove }: ZBadgeProps) => {
	const ref = useRef<HTMLElement>(null)
	useCustomEvent<{ value?: string; selected: boolean }>(ref, 'select', (detail) =>
		onSelect?.(detail.selected, detail.value)
	)
	useCustomEvent<{ value?: string }>(ref, 'remove', (detail) => onRemove?.(detail.value))
	return (
		<z-badge
			ref={ref}
			label={label}
			value={value}
			tone={tone}
			kind={kind ?? 'outline'}
			isSelectable={!!onSelect}
			isSelected={isSelected}
			isRemovable={isRemovable}
		/>
	)
}
