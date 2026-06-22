export const toggleVariantProps = {
	isPurple: { type: Boolean, reflect: true },
	isPink: { type: Boolean, reflect: true },
	isNeutral: { type: Boolean, reflect: true },
	isSmall: { type: Boolean, reflect: true },
	isMedium: { type: Boolean, reflect: true },
	isLarge: { type: Boolean, reflect: true },
	isIcon: { type: Boolean, reflect: true },
	isGhost: { type: Boolean, reflect: true },
	isOutlined: { type: Boolean, reflect: true }
} as const

type ToggleVariantPropsT = { [K in keyof typeof toggleVariantProps]?: boolean }

/**
 * Unlike z-button's resolvers, these only return a class when the consumer
 * explicitly set the flag - absence means "defer to whatever the CSS
 * var() fallback chain resolves to" (an inherited z-toggle-group value, or
 * the built-in ghost/neutral/medium default baked into toggle-styles.ts).
 */
export const resolveOwnToggleColorClass = (props: ToggleVariantPropsT): string | undefined => {
	if (props.isPurple) return 'is-purple'
	if (props.isPink) return 'is-pink'
	if (props.isNeutral) return 'is-neutral'
	return undefined
}

export const resolveOwnToggleSizeClass = (props: ToggleVariantPropsT): string | undefined => {
	if (props.isSmall) return 'is-small'
	if (props.isLarge) return 'is-large'
	if (props.isMedium) return 'is-medium'
	return undefined
}

export const resolveOwnToggleKindClass = (props: ToggleVariantPropsT): string | undefined => {
	if (props.isGhost) return 'is-ghost'
	if (props.isOutlined) return 'is-outlined'
	return undefined
}

export const resolveToggleButtonClass = (props: ToggleVariantPropsT): string =>
	[
		resolveOwnToggleKindClass(props),
		resolveOwnToggleColorClass(props),
		resolveOwnToggleSizeClass(props),
		props.isIcon ? 'is-icon' : undefined
	]
		.filter(Boolean)
		.join(' ')
