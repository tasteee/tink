import { oneOf } from './prop-types'

/*
 * Shared variant surface for z-toggle-button-group and z-toggle-button-group-item.
 *
 * These used to be nine booleans — is-purple/is-pink/is-neutral,
 * is-small/is-medium/is-large, is-ghost/is-outlined — one flag per value,
 * across three sets where only one member could ever be true. They are now
 * three enums on the library's own vocabulary. That is also what makes a
 * group-level accent work: a flag can only describe the element carrying it,
 * so setting a colour on the group did nothing before.
 *
 * is-icon stays a boolean — it is a shape modifier that composes with any
 * kind, unlike the three above.
 */
export const toggleVariantProps = {
	tone: { type: oneOf('neutral', 'primary', 'secondary', 'success', 'warning', 'danger'), reflect: true },
	size: { type: String, reflect: true },
	kind: { type: String, reflect: true },
	isIcon: { type: Boolean, reflect: true }
} as const

type ToggleVariantPropsT = {
	tone?: string
	size?: string
	kind?: string
	isIcon?: boolean
}

const TONE_CLASSES: Record<string, string> = {
	primary: 'is-primary',
	secondary: 'is-secondary',
	neutral: 'is-neutral',
	success: 'is-success',
	warning: 'is-warning',
	danger: 'is-danger'
}

const SIZE_CLASSES: Record<string, string> = {
	xs: 'is-xs',
	sm: 'is-sm',
	md: 'is-md',
	lg: 'is-lg'
}

const KIND_CLASSES: Record<string, string> = {
	solid: 'is-solid',
	outline: 'is-outline',
	ghost: 'is-ghost',
	soft: 'is-soft',
	plain: 'is-plain'
}

/*
 * Unlike z-button's resolvers, these return undefined when the prop is unset
 * rather than falling back to a default class. Absence means "defer to
 * whatever the var() fallback chain resolves to" — an inherited
 * z-toggle-button-group value, or the built-in ghost/neutral/md default baked into
 * toggle-styles.ts.
 */
export const resolveOwnToggleAccentClass = (props: ToggleVariantPropsT): string | undefined => {
	if (!props.tone) return undefined
	return TONE_CLASSES[props.tone]
}

export const resolveOwnToggleSizeClass = (props: ToggleVariantPropsT): string | undefined => {
	if (!props.size) return undefined
	return SIZE_CLASSES[props.size]
}

export const resolveOwnToggleKindClass = (props: ToggleVariantPropsT): string | undefined => {
	if (!props.kind) return undefined
	return KIND_CLASSES[props.kind]
}

export const resolveToggleButtonClass = (props: ToggleVariantPropsT): string => {
	const iconClass = props.isIcon ? 'is-icon' : undefined

	const classes = [
		resolveOwnToggleKindClass(props),
		resolveOwnToggleAccentClass(props),
		resolveOwnToggleSizeClass(props),
		iconClass
	]

	return classes.filter(Boolean).join(' ')
}
