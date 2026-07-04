import { c, css, useProp, useState, useRef, useEffect } from 'atomico'

/*
 * z-callout — an in-flow documentation admonition (Note / Tip / Important /
 * Warning / Caution). Unlike z-alert (a dismissable, overlay-adjacent status
 * banner), a callout is a content-emphasis block that lives inside prose: a
 * left accent bar tinted by `kind`, a leading icon, an optional `heading`, and
 * slotted body copy. Each kind carries its own hue and icon; `--callout-color`
 * overrides the accent.
 *
 * A `heading` is opt-in: when omitted the callout renders compact (icon centred
 * against the body, no label row). Set `is-expandable` to clamp the body to two
 * lines with an inline "Show more" affordance at the end of the second line; the
 * toggle only appears when the copy actually overflows, and flips to "Show less"
 * once opened. `is-expanded` reflects (and controls) the open state.
 */
const styles = css`
	:host {
		display: block;
		--callout-color: var(--muted-foreground);
		/* Opaque twin of the callout fill (below), used behind the "Show more"
		   fade. The fill itself keeps a transparent base so the block blends over
		   any surface; the fade approximates the default --background surface. */
		--callout-fade: color-mix(in oklch, var(--callout-color) 7%, var(--background));
	}

	:host([kind='note']) {
		--callout-color: var(--purple);
	}
	:host([kind='tip']) {
		--callout-color: var(--success);
	}
	:host([kind='important']) {
		--callout-color: var(--accent-alt);
	}
	:host([kind='warning']) {
		--callout-color: var(--warning);
	}
	:host([kind='caution']) {
		--callout-color: var(--destructive);
	}

	:host([is-hidden]) {
		display: none;
	}

	.callout {
		display: flex;
		gap: 0.75rem;
		box-sizing: border-box;
		padding: var(--space-md) var(--space-base);
		/* srgb: oklch would drift the chromatic accent when mixed against the
		   hue-carrying --border (matches z-alert). */
		border: 1px solid color-mix(in srgb, var(--callout-color) 25%, var(--border));
		border-left: 3px solid var(--callout-color);
		border-radius: var(--radius-md);
		background: color-mix(in oklch, var(--callout-color) 7%, transparent);
		color: var(--foreground);
	}

	.icon {
		display: inline-flex;
		flex-shrink: 0;
		width: 1.125rem;
		height: 1.125rem;
		margin-top: 0.0625rem;
		color: var(--callout-color);
	}

	.icon svg {
		width: 100%;
		height: 100%;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;
	}

	.content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.label {
		margin: 0;
		font-size: var(--font-size-small);
		font-weight: 600;
		line-height: 1.4;
		letter-spacing: 0.01em;
		color: var(--callout-color);
	}

	.body {
		position: relative;
		font-size: var(--font-size-small);
		line-height: var(--line-height-body);
		color: var(--muted-foreground);
	}

	/* Collapsed: clamp the slotted copy to two lines. The <slot> defaults to
	   display:contents, so the assigned nodes are laid out directly inside the
	   -webkit-box and the line clamp counts their text lines. */
	.body.is-clamped .text {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}

	.toggle {
		margin: 0;
		padding: 0;
		border: 0;
		background: transparent;
		font: inherit;
		font-weight: 600;
		color: var(--callout-color);
		cursor: pointer;
	}

	.toggle:hover {
		text-decoration: underline;
	}

	.toggle:focus-visible {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: 2px;
		border-radius: var(--radius-sm);
	}

	/* Collapsed toggle rides the end of the second line, lifted out of the flow
	   and floated right with a fade so it reads as trailing the truncated copy. */
	.body.is-clamped .toggle {
		position: absolute;
		right: 0;
		bottom: 0;
		padding-left: 2.75rem;
		background: linear-gradient(to right, transparent, var(--callout-fade) 45%);
	}

	/* Expanded toggle drops to its own line beneath the full copy. */
	.body:not(.is-clamped) .toggle {
		display: inline-block;
		margin-top: 0.35rem;
	}

	/* No heading + copy that fits: centre the icon so a bare callout isn't
	   top-heavy. Suppressed once the body clamps/expands to multiple lines. */
	.callout.is-compact {
		align-items: center;
	}
	.callout.is-compact .icon {
		margin-top: 0;
	}
`

const ICONS: Record<string, any> = {
	// lowercase "i" — dot above, stroke below
	note: (
		<g>
			<circle cx="12" cy="12" r="9" />
			<line x1="12" y1="8" x2="12" y2="8.01" />
			<line x1="12" y1="11" x2="12" y2="16" />
		</g>
	),
	// lightbulb
	tip: (
		<g>
			<path d="M9 18h6" />
			<path d="M10 21h4" />
			<path d="M12 3a6 6 0 0 0-4 10.5c.6.55 1 1.3 1 2.5h6c0-1.2.4-1.95 1-2.5A6 6 0 0 0 12 3Z" />
		</g>
	),
	// exclamation "!" in a circle — stroke above, dot below (mirrors note)
	important: (
		<g>
			<circle cx="12" cy="12" r="9" />
			<line x1="12" y1="8" x2="12" y2="13" />
			<line x1="12" y1="16" x2="12" y2="16.01" />
		</g>
	),
	// triangle "!"
	warning: (
		<g>
			<path d="M12 3 2 20h20L12 3Z" />
			<line x1="12" y1="10" x2="12" y2="14" />
			<line x1="12" y1="17" x2="12" y2="17.01" />
		</g>
	),
	// octagon "!" (stop)
	caution: (
		<g>
			<path d="M8 3h8l5 5v8l-5 5H8l-5-5V8l5-5Z" />
			<line x1="12" y1="8" x2="12" y2="13" />
			<line x1="12" y1="16" x2="12" y2="16.01" />
		</g>
	)
}

export const ZCallout = c(
	(props) => {
		const [isExpanded, setIsExpanded] = useProp<boolean>('isExpanded')
		const [overflowing, setOverflowing] = useState(false)
		const textRef = useRef<HTMLElement>()

		const kind = (props.kind as string) || 'note'
		const icon = ICONS[kind] || ICONS.note
		const heading = props.heading as string | undefined
		const isAlert = kind === 'warning' || kind === 'caution'

		// Measure whether the slotted copy runs past two lines. scrollHeight
		// reports the full content height even while the box is line-clamped, so
		// the comparison is independent of the collapsed/expanded state. Re-run on
		// resize (reflow may change line count) and on slotchange (copy changes).
		useEffect(() => {
			const el = textRef.current
			if (!props.isExpandable || !el) {
				setOverflowing(false)
				return
			}
			const measure = () => {
				const cs = getComputedStyle(el)
				const lineHeight = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.6
				setOverflowing(el.scrollHeight > lineHeight * 2 + 1)
			}
			measure()
			const ro = new ResizeObserver(measure)
			ro.observe(el)
			const slot = el.querySelector('slot')
			slot?.addEventListener('slotchange', measure)
			return () => {
				ro.disconnect()
				slot?.removeEventListener('slotchange', measure)
			}
		}, [props.isExpandable])

		const showToggle = props.isExpandable && overflowing
		const isClamped = showToggle && !isExpanded
		const isCompact = !heading && !overflowing

		return (
			<host shadowDom>
				<div class={`callout${isCompact ? ' is-compact' : ''}`} role={isAlert ? 'alert' : 'note'}>
					<span class="icon" aria-hidden="true">
						<svg viewBox="0 0 24 24">{icon}</svg>
					</span>
					<div class="content">
						{heading && <p class="label">{heading}</p>}
						<div class={`body${isClamped ? ' is-clamped' : ''}`}>
							<div class="text" ref={textRef}>
								<slot />
							</div>
							{showToggle && (
								<button
									type="button"
									class="toggle"
									aria-expanded={isExpanded ? 'true' : 'false'}
									onclick={() => setIsExpanded(!isExpanded)}
								>
									{isExpanded ? 'Show less' : 'Show more'}
								</button>
							)}
						</div>
					</div>
				</div>
			</host>
		)
	},
	{
		props: {
			kind: { type: String, reflect: true },
			heading: { type: String, reflect: true },
			isExpandable: { type: Boolean, reflect: true },
			isExpanded: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-callout', ZCallout)
