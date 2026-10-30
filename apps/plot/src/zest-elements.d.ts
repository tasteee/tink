import type React from 'react'

// JSX typings for the zest elements the HUD uses. React 19
// passes camelCase props straight to the element properties
// Atomico defines. Augmenting the global React namespace needs
// `interface` for declaration merging.

type ZestBaseT<ElementT = HTMLElement> = React.DetailedHTMLProps<React.HTMLAttributes<ElementT>, ElementT> & {
	class?: string
}

type ZButtonPropsT = ZestBaseT & {
	size?: 'small' | 'medium' | 'large'
	kind?: 'solid' | 'outline' | 'ghost' | 'soft' | 'plain'
	tone?: 'primary' | 'secondary' | 'neutral' | 'success' | 'warning' | 'danger'
	isDisabled?: boolean
	isFullWidth?: boolean
	label?: string
}

type ZTextPropsT = ZestBaseT & {
	size?: 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs'
	color?: 'primary' | 'secondary' | 'muted' | 'neutral' | 'white'
	weight?: string
	tag?: string
}

type ZSeparatorPropsT = ZestBaseT & {
	isVertical?: boolean
}

export {}

declare global {
	namespace React {
		namespace JSX {
			interface IntrinsicElements {
				'z-button': ZButtonPropsT
				'z-text': ZTextPropsT
				'z-separator': ZSeparatorPropsT
			}
		}
	}
}
