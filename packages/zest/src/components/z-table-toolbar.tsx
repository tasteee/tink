import { c, css, event, useHost, useRef, useEffect } from 'atomico'
import { floatingSurfaceStyles, floatingToolbarStyles, floatingIconButtonStyles } from '../shared/editor-overlay-styles'
import { computePosition, autoUpdate, rectAnchor, AnyProp, type Placement } from '../shared/overlay'
import { useVisibilityPhase } from '../shared/transition'

/*
 * z-table-toolbar — appears above a table whenever the cursor sits in any
 * cell. Positioned the same way as z-selection-toolbar (anchorRect + isOpen);
 * actions come from an `items` array of generic buttons:
 *   toolbar.items = [{ value: 'insert-row', icon, label: 'Insert row' }, ...]
 * Fires `action` with { value }.
 *
 * z-table-axis-handle (second export below) is the small pill that teleports
 * along the table's top edge (columns) or left edge (rows) as you hover an
 * axis — the same teleporting-singleton shape as z-gutter-handle. Clicking the
 * grip selects the whole row/column; the +/− buttons insert-after / remove it.
 *   const axis = document.querySelector('z-table-axis-handle')
 *   axis.axis = 'column'
 *   axis.anchorRect = headerCellRect
 *   axis.isOpen = true
 */
const styles = css`
	:host {
		position: fixed;
		inset: 0;
		z-index: var(--z-toolbar, 40);
		pointer-events: none;
	}
`

type TableActionItemT = {
	value?: string
	label?: string
	icon?: string
	isDisabled?: boolean
}

export const ZTableToolbar = c(
	(props) => {
		const floatRef = useRef<HTMLDivElement>()
		const isOpen = Boolean(props.isOpen)
		const phase = useVisibilityPhase(isOpen)
		const items: TableActionItemT[] = Array.isArray(props.items) ? (props.items as TableActionItemT[]) : []

		useEffect(() => {
			const floating = floatRef.current
			if (!floating || !isOpen || !props.anchorRect) return
			const anchor = rectAnchor(props.anchorRect as { x: number; y: number; width: number; height: number })
			const update = () => {
				const pos = computePosition(anchor, floating, { placement: (props.placement as Placement) || 'top', offset: props.offset ?? 10 })
				floating.style.left = `${pos.x}px`
				floating.style.top = `${pos.y}px`
			}
			return autoUpdate(anchor, floating, update)
		}, [isOpen, props.anchorRect, props.placement, props.offset])

		const surfaceClass = ['surface']
			.concat(phase === 'open' ? ['is-open'] : [])
			.concat(phase === 'closing' ? ['is-closing'] : [])
			.join(' ')

		if (phase === 'closed' && !isOpen) return <host shadowDom></host>

		return (
			<host shadowDom>
				<div ref={floatRef} class={surfaceClass} role="toolbar" aria-label={props.label || 'Table actions'}>
					{items.map((item, index) => (
						<button
							key={item.value || index}
							type="button"
							class="icon-button"
							aria-label={item.label || item.value}
							disabled={item.isDisabled}
							onclick={() => props.action({ value: item.value || item.label || '' })}
						>
							{item.icon ? <span innerHTML={item.icon} /> : item.label}
						</button>
					))}
				</div>
			</host>
		)
	},
	{
		props: {
			items: { type: Array },
			anchorRect: AnyProp,
			placement: { type: String, reflect: true },
			offset: { type: Number },
			label: String,
			isOpen: { type: Boolean, reflect: true },
			action: event<{ value: string }>({ bubbles: true, composed: true })
		},
		styles: [floatingSurfaceStyles, floatingToolbarStyles, floatingIconButtonStyles, styles]
	}
)

customElements.define('z-table-toolbar', ZTableToolbar)

const axisHandleStyles = css`
	:host {
		position: fixed;
		left: 0;
		top: 0;
		z-index: var(--z-toolbar, 40);
		display: flex;
		align-items: center;
		gap: 1px;
		padding: 0.125rem;
		background: var(--popover);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		opacity: 0;
		transform: translateY(4px);
		pointer-events: none;
	}

	:host([axis='column']) {
		flex-direction: column;
	}

	:host(.is-open) {
		opacity: 1;
		transform: translateY(0);
		transition:
			opacity 120ms ease-out,
			transform 120ms ease-out;
		pointer-events: auto;
	}

	:host(.is-closing) {
		opacity: 0;
		transform: translateY(0);
		transition: opacity 80ms ease-out;
		pointer-events: none;
	}

	.grip {
		background: color-mix(in oklch, var(--foreground) 6%, transparent);
	}

	.grip.is-active {
		background: color-mix(in oklch, var(--accent, var(--primary)) 16%, transparent);
		color: var(--accent, var(--primary));
	}
`

export const ZTableAxisHandle = c(
	(props) => {
		const host = useHost()
		const isOpen = Boolean(props.isOpen)
		const phase = useVisibilityPhase(isOpen)

		useEffect(() => {
			const el = host.current as HTMLElement
			if (!el || !props.anchorRect) return
			const rect = props.anchorRect as { x: number; y: number; width: number; height: number }
			el.style.left = `${rect.x}px`
			el.style.top = `${rect.y}px`
		}, [props.anchorRect])

		useEffect(() => {
			const el = host.current as HTMLElement
			el.classList.toggle('is-open', phase === 'open')
			el.classList.toggle('is-closing', phase === 'closing')
		}, [phase])

		const axisLabel = props.axis === 'column' ? 'column' : 'row'

		return (
			<host shadowDom>
				<button
					type="button"
					class={['icon-button', 'grip'].concat(props.isSelected ? ['is-active'] : []).join(' ')}
					aria-label={`Select ${axisLabel}`}
					aria-pressed={props.isSelected ? 'true' : 'false'}
					onclick={() => props.select()}
				>
					⋮⋮
				</button>
				<button type="button" class="icon-button" aria-label={`Insert ${axisLabel} after`} onclick={() => props.insertafter()}>
					+
				</button>
				<button type="button" class="icon-button" aria-label={`Remove ${axisLabel}`} onclick={() => props.remove()}>
					×
				</button>
			</host>
		)
	},
	{
		props: {
			axis: { type: String, reflect: true },
			anchorRect: AnyProp,
			isOpen: { type: Boolean, reflect: true },
			isSelected: { type: Boolean, reflect: true },
			select: event<void>({ bubbles: true, composed: true }),
			insertafter: event<void>({ bubbles: true, composed: true }),
			remove: event<void>({ bubbles: true, composed: true })
		},
		styles: [floatingIconButtonStyles, axisHandleStyles]
	}
)

customElements.define('z-table-axis-handle', ZTableAxisHandle)
