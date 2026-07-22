import { c, css, event, useHost, useRef, useState, useEffect } from 'atomico'
import { floatingSurfaceStyles, floatingToolbarStyles, floatingIconButtonStyles } from '../shared/editor-overlay-styles'
import { computePosition, autoUpdate, rectAnchor, AnyProp, type Placement } from '../shared/overlay'
import { useVisibilityPhase } from '../shared/transition'

/*
 * z-bubble-menu — a floating contextual menu with three variants, switched via
 * `variant`. One instance per variant is the simplest setup (a singleton per
 * variant, same shape as z-toast/z-selection-toolbar); show whichever variant
 * applies and hide the rest:
 *   <z-bubble-menu variant="link"></z-bubble-menu>
 * Positioned the same way as z-selection-toolbar (anchorRect + isOpen). When a
 * link is under the cursor, show the "link" bubble instead of
 * z-selection-toolbar — this component doesn't coordinate that on its own,
 * since it has no way to know a plain selection toolbar exists elsewhere; the
 * host decides which one to open and keeps them mutually exclusive.
 *
 * variant="link": inline URL field + open/unlink. Fires `linkchange` { url },
 *   `linkopen`, `linkunlink`.
 * variant="image": align + caption toggle + replace/delete. Fires
 *   `imagealign` { align }, `imagecaptiontoggle`, `imagereplace`, `imagedelete`.
 * variant="table-cell": row/column insert+delete + merge. Fires
 *   `tableinsertrow` { position }, `tabledeleterow`, `tableinsertcolumn` { position },
 *   `tabledeletecolumn`, `tablemerge`.
 */
const styles = css`
	:host {
		position: fixed;
		inset: 0;
		z-index: var(--z-menu, 50);
		pointer-events: none;
	}

	.link-field {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0 0.375rem;
	}

	.link-field input {
		width: 14rem;
		max-width: 40vw;
		background: transparent;
		border: 0;
		outline: none;
		color: var(--foreground);
		font-family: inherit;
		font-size: var(--font-size-small);
	}
`

type AlignT = 'left' | 'center' | 'right'
type RowColPositionT = 'before' | 'after'

export const ZBubbleMenu = c(
	(props) => {
		const host = useHost()
		const floatRef = useRef<HTMLDivElement>()
		const isOpen = Boolean(props.isOpen)
		const phase = useVisibilityPhase(isOpen)
		const [draftUrl, setDraftUrl] = useState(String(props.url || ''))

		useEffect(() => {
			setDraftUrl(String(props.url || ''))
		}, [props.url, isOpen])

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

		const commitUrl = () => {
			if (draftUrl !== props.url) props.linkchange({ url: draftUrl })
		}

		const renderLinkControls = () => (
			<div class="link-field">
				<input
					type="text"
					value={draftUrl}
					placeholder="https://…"
					aria-label="Link URL"
					oninput={(inputEvent: any) => setDraftUrl(inputEvent.target.value)}
					onblur={commitUrl}
					onkeydown={(keyboardEvent: KeyboardEvent) => {
						if (keyboardEvent.key === 'Enter') (keyboardEvent.target as HTMLInputElement).blur()
					}}
				/>
				<button type="button" class="icon-button" aria-label="Open link" onclick={() => props.linkopen()}>
					<svg viewBox="0 0 24 24">
						<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
						<polyline points="15 3 21 3 21 9" />
						<line x1="10" y1="14" x2="21" y2="3" />
					</svg>
				</button>
				<button type="button" class="icon-button" aria-label="Remove link" onclick={() => props.linkunlink()}>
					<svg viewBox="0 0 24 24">
						<path d="M9 15l6-6" />
						<path d="M11 6l1-1a3.5 3.5 0 1 1 5 5l-1 1" />
						<path d="M13 18l-1 1a3.5 3.5 0 1 1-5-5l1-1" />
					</svg>
				</button>
			</div>
		)

		const renderImageControls = () => (
			<div>
				{(['left', 'center', 'right'] as AlignT[]).map((align) => (
					<button
						key={align}
						type="button"
						class={['icon-button'].concat(props.align === align ? ['is-active'] : []).join(' ')}
						aria-label={`Align ${align}`}
						aria-pressed={props.align === align ? 'true' : 'false'}
						onclick={() => props.imagealign({ align })}
					>
						{align[0].toUpperCase()}
					</button>
				))}
				<div class="sep" role="separator" />
				<button
					type="button"
					class={['icon-button'].concat(props.hasCaption ? ['is-active'] : []).join(' ')}
					aria-label="Toggle caption"
					aria-pressed={props.hasCaption ? 'true' : 'false'}
					onclick={() => props.imagecaptiontoggle()}
				>
					Aa
				</button>
				<button type="button" class="icon-button" aria-label="Replace image" onclick={() => props.imagereplace()}>
					<svg viewBox="0 0 24 24">
						<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
					</svg>
				</button>
				<button type="button" class="icon-button" aria-label="Delete image" onclick={() => props.imagedelete()}>
					<svg viewBox="0 0 24 24">
						<polyline points="3 6 5 6 21 6" />
						<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
					</svg>
				</button>
			</div>
		)

		const renderTableCellControls = () => (
			<div>
				<button type="button" class="icon-button" aria-label="Insert row above" onclick={() => props.tableinsertrow({ position: 'before' as RowColPositionT })}>
					+Row↑
				</button>
				<button type="button" class="icon-button" aria-label="Insert row below" onclick={() => props.tableinsertrow({ position: 'after' as RowColPositionT })}>
					+Row↓
				</button>
				<button type="button" class="icon-button" aria-label="Delete row" onclick={() => props.tabledeleterow()}>
					−Row
				</button>
				<div class="sep" role="separator" />
				<button type="button" class="icon-button" aria-label="Insert column left" onclick={() => props.tableinsertcolumn({ position: 'before' as RowColPositionT })}>
					+Col←
				</button>
				<button type="button" class="icon-button" aria-label="Insert column right" onclick={() => props.tableinsertcolumn({ position: 'after' as RowColPositionT })}>
					+Col→
				</button>
				<button type="button" class="icon-button" aria-label="Delete column" onclick={() => props.tabledeletecolumn()}>
					−Col
				</button>
				<div class="sep" role="separator" />
				<button type="button" class="icon-button" aria-label="Merge cells" onclick={() => props.tablemerge()}>
					Merge
				</button>
			</div>
		)

		const resolveControls = () => {
			if (props.variant === 'image') return renderImageControls()
			if (props.variant === 'table-cell') return renderTableCellControls()
			return renderLinkControls()
		}

		const surfaceClass = ['surface']
			.concat(phase === 'open' ? ['is-open'] : [])
			.concat(phase === 'closing' ? ['is-closing'] : [])
			.join(' ')

		if (phase === 'closed' && !isOpen) return <host shadowDom></host>

		return (
			<host shadowDom>
				<div ref={floatRef} class={surfaceClass} role="toolbar" aria-label={`${props.variant || 'link'} bubble menu`} onmousedown={(mouseEvent: MouseEvent) => mouseEvent.preventDefault()}>
					{resolveControls()}
				</div>
			</host>
		)
	},
	{
		props: {
			variant: { type: String, reflect: true },
			anchorRect: AnyProp,
			placement: { type: String, reflect: true },
			offset: { type: Number },
			isOpen: { type: Boolean, reflect: true },
			url: { type: String },
			align: { type: String },
			hasCaption: { type: Boolean },
			linkchange: event<{ url: string }>({ bubbles: true, composed: true }),
			linkopen: event<void>({ bubbles: true, composed: true }),
			linkunlink: event<void>({ bubbles: true, composed: true }),
			imagealign: event<{ align: AlignT }>({ bubbles: true, composed: true }),
			imagecaptiontoggle: event<void>({ bubbles: true, composed: true }),
			imagereplace: event<void>({ bubbles: true, composed: true }),
			imagedelete: event<void>({ bubbles: true, composed: true }),
			tableinsertrow: event<{ position: RowColPositionT }>({ bubbles: true, composed: true }),
			tabledeleterow: event<void>({ bubbles: true, composed: true }),
			tableinsertcolumn: event<{ position: RowColPositionT }>({ bubbles: true, composed: true }),
			tabledeletecolumn: event<void>({ bubbles: true, composed: true }),
			tablemerge: event<void>({ bubbles: true, composed: true })
		},
		styles: [floatingSurfaceStyles, floatingToolbarStyles, floatingIconButtonStyles, styles]
	}
)

customElements.define('z-bubble-menu', ZBubbleMenu)
