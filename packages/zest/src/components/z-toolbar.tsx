import { defineElement } from '../shared/define-element'
import { c, css, useHost, useEffect } from 'atomico'
import { themedScrollbarStyles } from '../shared/scrollbar-styles'
import { oneOf } from '../shared/prop-types'

/*
 * z-toolbar, a horizontal (or `direction="vertical"`) action strip with real toolbar
 * semantics: role="toolbar" + roving tabindex, so the whole bar is a single tab
 * stop and arrow keys (Home/End) move focus across its controls. Holds slotted
 * z-button / z-toggle-button / z-toolbar-group, divided by z-separator.
 *
 *   <z-toolbar>
 *     <z-button kind="ghost">Bold</z-button>
 *     <z-button kind="ghost">Italic</z-button>
 *   </z-toolbar>
 *
 * `overflow` handles a too-narrow bar: `scroll` or `wrap` now; `menu` (collapse
 * extras into a trailing ⋯) is stubbed. Used by the chat composer, message
 * hover-actions, dashboard page headers, and editor tool strips.
 */
const styles = css`
	:host {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		min-width: 0;
	}
	:host([direction='vertical']) {
		flex-direction: column;
		align-items: stretch;
	}
	:host([size='sm']) {
		gap: var(--space-xs);
	}
	:host([size='lg']) {
		gap: var(--space-md);
	}
	:host([overflow='scroll']) {
		overflow: auto;
		scrollbar-width: none;
	}
	:host([overflow='scroll'])::-webkit-scrollbar {
		display: none;
	}
	:host([overflow='wrap']) {
		flex-wrap: wrap;
	}
	:host([is-disabled]) {
		opacity: 0.5;
		pointer-events: none;
	}
	.overflow {
		margin-inline-start: auto;
	}
`

// Controls that participate in roving tabindex (light-DOM slotted children).
const FOCUSABLE = 'z-button, z-toggle-button, z-toggle-button-group-item, z-tool-button, [role="button"], button, a[href]'

export const ZToolbar = c(
	(props) => {
		const host = useHost()

		useEffect(() => {
			const el = host.current as HTMLElement
			const items = () => [...el.querySelectorAll<HTMLElement>(FOCUSABLE)]

			const setRoving = (activeIdx = 0) =>
				items().forEach((item, i) => (item.tabIndex = i === activeIdx ? 0 : -1))

			const onKeyDown = (e: KeyboardEvent) => {
				const list = items()
				if (!list.length) return
				const cur = list.indexOf(e.target as HTMLElement)
				if (cur < 0) return
				const isVertical = props.direction === 'vertical'
				const next = isVertical ? 'ArrowDown' : 'ArrowRight'
				const prev = isVertical ? 'ArrowUp' : 'ArrowLeft'
				let to = cur
				if (e.key === next) to = (cur + 1) % list.length
				else if (e.key === prev) to = (cur - 1 + list.length) % list.length
				else if (e.key === 'Home') to = 0
				else if (e.key === 'End') to = list.length - 1
				else return
				e.preventDefault()
				setRoving(to)
				list[to].focus()
			}

			// keep the roving stop on whatever the user last interacted with
			const onFocusIn = (e: FocusEvent) => {
				const list = items()
				const idx = list.indexOf(e.target as HTMLElement)
				if (idx >= 0) setRoving(idx)
			}

			setRoving()
			el.addEventListener('keydown', onKeyDown)
			el.addEventListener('focusin', onFocusIn)
			const mo = new MutationObserver(() => setRoving())
			mo.observe(el, { childList: true, subtree: true })

			return () => {
				el.removeEventListener('keydown', onKeyDown)
				el.removeEventListener('focusin', onFocusIn)
				mo.disconnect()
			}
		}, [props.direction, props.overflow])

		return (
			<host
				shadowDom
				role='toolbar'
				aria-orientation={props.direction === 'vertical' ? 'vertical' : 'horizontal'}
			>
				<slot />
				<div class='overflow'>
					<slot name='overflow' />
				</div>
			</host>
		)
	},
	{
		props: {
			size: { type: oneOf('sm', 'md', 'lg'), reflect: true },
			direction: { type: oneOf('horizontal', 'vertical'), reflect: true },
			overflow: { type: String, reflect: true },
			isDisabled: { type: Boolean, reflect: true }
		},
		styles: [themedScrollbarStyles, styles]
	}
)

defineElement('z-toolbar', ZToolbar)
