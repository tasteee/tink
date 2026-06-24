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

type ZChipProps = {
	label: string
	value: string
	isSelected?: boolean
	onSelect?: (selected: boolean, value?: string) => void
	isRemovable?: boolean
	onRemove?: (value?: string) => void
	children?: ReactNode
}

export const ZChip = ({ label, value, isSelected, onSelect, isRemovable, onRemove }: ZChipProps) => {
	const ref = useRef<HTMLElement>(null)
	useCustomEvent<{ value?: string; selected: boolean }>(ref, 'select', (detail) =>
		onSelect?.(detail.selected, detail.value)
	)
	useCustomEvent<{ value?: string }>(ref, 'remove', (detail) => onRemove?.(detail.value))
	return (
		<z-chip
			ref={ref}
			label={label}
			value={value}
			isSelectable={!!onSelect}
			isSelected={isSelected}
			isRemovable={isRemovable}
		/>
	)
}
