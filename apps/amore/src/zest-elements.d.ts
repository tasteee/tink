import type { JSX as SolidJSX } from 'solid-js'

// JSX typings for zest web components in SolidJS. Custom elements (any tag
// with a hyphen) get every prop set as a JS property by Solid's compiler, not
// stringified as an attribute — Atomico's `useProp` reflects attribute and
// property together, so plain values, arrays (`options`), and booleans
// (`isDisabled`) all just work. Interactive elements emit Atomico
// CustomEvents (`change`, `input`, ...) — listen with `on:change`/`on:input`.
//
// Loosely typed on purpose (Record<string, any>): these are web components
// driven by reflected attributes/properties, not a typed React-style API.
// See packages/zest/docs for each element's actual prop/event surface.
type ZestElementProps = SolidJSX.HTMLAttributes<HTMLElement> & Record<string, any>

declare module 'solid-js' {
	namespace JSX {
		interface IntrinsicElements {
			'z-heading': ZestElementProps
			'z-subheading': ZestElementProps
			'z-text': ZestElementProps
			'z-label': ZestElementProps
			'z-button': ZestElementProps
			'z-link': ZestElementProps
			'z-card': ZestElementProps
			'z-box': ZestElementProps
			'z-line': ZestElementProps
			'z-separator': ZestElementProps
			'z-stack': ZestElementProps
			'z-grid': ZestElementProps
			'z-cluster': ZestElementProps
			'z-center': ZestElementProps
			'z-container': ZestElementProps
			'z-section': ZestElementProps
			'z-surface': ZestElementProps
			'z-draggable': ZestElementProps
			'z-drop-target': ZestElementProps
			'z-scroll': ZestElementProps
			'z-scroll-area': ZestElementProps
			'z-spacer': ZestElementProps
			'z-button-group': ZestElementProps
			'z-toggle': ZestElementProps
			'z-toggle-group': ZestElementProps
			'z-toggle-group-item': ZestElementProps
			'z-input': ZestElementProps
			'z-textarea': ZestElementProps
			'z-checkbox': ZestElementProps
			'z-switch': ZestElementProps
			'z-radio': ZestElementProps
			'z-radio-group': ZestElementProps
			'z-slider': ZestElementProps
			'z-range': ZestElementProps
			'z-range-handle': ZestElementProps
			'z-select': ZestElementProps
			'z-combobox': ZestElementProps
			'z-color-picker': ZestElementProps
			'z-input-otp': ZestElementProps
			'z-badge': ZestElementProps
			'z-avatar': ZestElementProps
			'z-progress': ZestElementProps
			'z-skeleton': ZestElementProps
			'z-table': ZestElementProps
			'z-pagination': ZestElementProps
			'z-stat': ZestElementProps
			'z-breadcrumbs': ZestElementProps
			'z-tabs': ZestElementProps
			'z-collapsible': ZestElementProps
			'z-accordion': ZestElementProps
			'z-menu': ZestElementProps
			'z-nav-menu': ZestElementProps
			'z-sidebar': ZestElementProps
			'z-tooltip': ZestElementProps
			'z-popover': ZestElementProps
			'z-hover-card': ZestElementProps
			'z-dialog': ZestElementProps
			'z-alert-dialog': ZestElementProps
			'z-alert': ZestElementProps
			'z-sheet': ZestElementProps
			'z-drawer': ZestElementProps
			'z-context-menu': ZestElementProps
			'z-toast': ZestElementProps
			'z-command': ZestElementProps
			'z-empty-state': ZestElementProps
			'z-code-block': ZestElementProps
			'z-post-meta': ZestElementProps
			'z-carousel': ZestElementProps
			'z-chart': ZestElementProps
			'z-piano-roll': ZestElementProps
			'z-pattern-roll': ZestElementProps
		}
	}
}

export {}
