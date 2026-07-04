import type React from 'react'

// JSX typings for the zest web components when used from React.
//
// React 19 sets unknown JSX props as DOM properties when the custom element
// defines a matching property (Atomico does), otherwise as attributes â€” so we
// can pass camelCase props like `isLoading` directly. @types/react 19 uses
// `export = React` + `export as namespace React`, so the JSX the runtime
// consumes is `React.JSX`; augmenting the global React namespace merges into it
// reliably (a `declare module 'react'` merge does not, given that module shape).

type ZestBase<T = HTMLElement> = React.DetailedHTMLProps<React.HTMLAttributes<T>, T> & {
	class?: string
}

type ZSize = 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs'
type ZColor = 'primary' | 'secondary' | 'muted' | 'neutral' | 'white'
type ZWeight = '900' | '700' | '600' | '400' | '300'

type ZTextProps = ZestBase & {
	size?: ZSize
	color?: ZColor
	weight?: string
	tag?: string
	isItalic?: boolean
	isUnderlined?: boolean
	isStrikethrough?: boolean
	isHidden?: boolean
}

type ZDisplayProps = ZestBase & {
	size?: 'sm' | 'md' | 'lg' | 'xl'
	color?: ZColor
	weight?: string
	tag?: string
	isHidden?: boolean
}

type ZEyebrowProps = ZestBase & {
	tone?: 'primary' | 'secondary' | 'neutral'
	label?: string
	hasRule?: boolean
	fullWidth?: boolean
	isHidden?: boolean
}

type ZButtonProps = ZestBase & {
	size?: 'small' | 'medium' | 'large'
	kind?: 'solid' | 'outline' | 'ghost' | 'soft' | 'plain'
	tone?: 'primary' | 'secondary' | 'neutral' | 'success' | 'warning' | 'danger'
	isHidden?: boolean
	isDisabled?: boolean
	isLoading?: boolean
	isFullWidth?: boolean
	label?: string
	type?: 'button' | 'submit' | 'reset'
}

type ZLinkProps = ZestBase & {
	href?: string
	target?: string
	label?: string
	size?: string
	tone?: string
	underline?: string
	isExternal?: boolean
	isBlock?: boolean
	isDisabled?: boolean
}

type ZCardProps = ZestBase & {
	isFlex?: boolean
	isRow?: boolean
	isColumn?: boolean
	doesLightUpOnHover?: boolean
	gap?: string
	isHidden?: boolean
}

type ZBadgeProps = ZestBase & {
	tone?: 'primary' | 'secondary' | 'neutral' | 'success' | 'warning' | 'danger'
	kind?: 'soft' | 'solid' | 'outline'
	size?: 'small' | 'medium'
	label?: string
	value?: string
	isDot?: boolean
	isSelectable?: boolean
	isSelected?: boolean
	isRemovable?: boolean
	isDisabled?: boolean
	isHidden?: boolean
}

type ZKbdProps = ZestBase & {
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
	label?: string
	isHidden?: boolean
}

type ZSwapProps = ZestBase & {
	kind?: 'stack' | 'beside'
	effect?: 'fade' | 'rotate' | 'flip'
	hasGhost?: boolean
	isActive?: boolean
	isDisabled?: boolean
	isHidden?: boolean
	label?: string
}

type ZListProps = ZestBase & {
	label?: string
	isPlain?: boolean
	isHidden?: boolean
}

type ZListRowProps = ZestBase & {
	isClickable?: boolean
	isHidden?: boolean
}

type ZAuraProps = ZestBase & {
	variant?: 'default' | 'dual' | 'rainbow' | 'holo' | 'gold' | 'silver' | 'glow'
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
	isHidden?: boolean
}

type ZCalloutProps = ZestBase & {
	kind?: 'note' | 'tip' | 'important' | 'warning' | 'caution'
	heading?: string
	isExpandable?: boolean
	isExpanded?: boolean
	isHidden?: boolean
}

type ZFilterProps = ZestBase & {
	tone?: 'primary' | 'secondary' | 'neutral'
	size?: 'small' | 'medium'
	label?: string
	resetLabel?: string
	isDrilldown?: boolean
	isHidden?: boolean
}

type ZStatProps = ZestBase & {
	value?: string
	label?: string
	size?: ZSize
	labelSize?: ZSize
	color?: ZColor
	labelColor?: ZColor
	align?: 'start' | 'center' | 'end'
	isHidden?: boolean
}

// Interactive elements (z-input/z-select/z-badge) emit Atomico CustomEvents that
// React does not auto-bind; prefer the React wrappers in zest/controls.tsx.
// Loosely typed here for completeness.
type ZAnyProps = ZestBase & Record<string, unknown>

export {}

declare global {
	namespace React {
		namespace JSX {
			interface IntrinsicElements {
				// Typography & primitives â€” specifically typed for autocomplete
				'z-heading': ZTextProps
				'z-subheading': ZTextProps
				'z-text': ZTextProps
				'z-label': ZTextProps
				'z-display': ZDisplayProps
				'z-eyebrow': ZEyebrowProps
				'z-button': ZButtonProps
				'z-link': ZLinkProps
				'z-card': ZCardProps & Record<string, unknown>
				// Everything else â€” loosely typed (these are web components driven by
				// reflected props / imperative array props; see the docs pages).
				'z-box': ZAnyProps
				'z-line': ZAnyProps
				'z-separator': ZAnyProps
				'z-stack': ZAnyProps
				'z-grid': ZAnyProps
				'z-cluster': ZAnyProps
				'z-center': ZAnyProps
				'z-container': ZAnyProps
				'z-section': ZAnyProps
				'z-surface': ZAnyProps
				'z-scroll': ZAnyProps
				'z-scroll-area': ZAnyProps
				'z-spacer': ZAnyProps
				'z-button-group': ZAnyProps
				'z-toggle': ZAnyProps
				'z-toggle-group': ZAnyProps
				'z-toggle-group-item': ZAnyProps
				'z-swap': ZSwapProps & Record<string, unknown>
				'z-input': ZAnyProps
				'z-textarea': ZAnyProps
				'z-checkbox': ZAnyProps
				'z-switch': ZAnyProps
				'z-radio': ZAnyProps
				'z-radio-group': ZAnyProps
				'z-slider': ZAnyProps
				'z-range': ZAnyProps
				'z-range-handle': ZAnyProps
				'z-select': ZAnyProps
				'z-combobox': ZAnyProps
				'z-filter': ZFilterProps & Record<string, unknown>
				'z-color-picker': ZAnyProps
				'z-input-otp': ZAnyProps
				'z-badge': ZBadgeProps & Record<string, unknown>
				'z-avatar': ZAnyProps
				'z-progress': ZAnyProps
				'z-skeleton': ZAnyProps
				'z-table': ZAnyProps
				'z-pagination': ZAnyProps
				'z-stat': ZStatProps
				'z-kbd': ZKbdProps
				'z-list': ZListProps & Record<string, unknown>
				'z-list-row': ZListRowProps & Record<string, unknown>
				'z-aura': ZAuraProps & Record<string, unknown>
				'z-breadcrumbs': ZAnyProps
				'z-tabs': ZAnyProps
				'z-collapsible': ZAnyProps
				'z-accordion': ZAnyProps
				'z-menu': ZAnyProps
				'z-nav-menu': ZAnyProps
				'z-sidebar': ZAnyProps
				'z-tooltip': ZAnyProps
				'z-popover': ZAnyProps
				'z-hover-card': ZAnyProps
				'z-dialog': ZAnyProps
				'z-alert-dialog': ZAnyProps
				'z-alert': ZAnyProps
				'z-sheet': ZAnyProps
				'z-drawer': ZAnyProps
				'z-context-menu': ZAnyProps
				'z-toast': ZAnyProps
				'z-command': ZAnyProps
				'z-callout': ZCalloutProps & Record<string, unknown>
				'z-empty-state': ZAnyProps
				'z-code-block': ZAnyProps
				'z-terminal': ZAnyProps
				'z-post-meta': ZAnyProps
				'z-carousel': ZAnyProps
				'z-chart': ZAnyProps
			}
		}
	}
}
