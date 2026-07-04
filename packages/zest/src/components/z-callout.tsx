import { c, css } from 'atomico'

/*
 * z-callout — an in-flow documentation admonition (Note / Tip / Important /
 * Warning / Caution). Unlike z-alert (a dismissable, overlay-adjacent status
 * banner), a callout is a content-emphasis block that lives inside prose: a
 * left accent bar tinted by `kind`, a leading icon, an auto-generated label
 * (overridable with `heading`), and slotted body copy. Each kind carries its
 * own hue, icon, and default label; `--callout-color` overrides the accent.
 */
const styles = css`
	:host {
		display: block;
		--callout-color: var(--muted-foreground);
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
		font-size: var(--font-size-small);
		line-height: var(--line-height-body);
		color: var(--muted-foreground);
	}

	/* When the label is suppressed, centre the icon against a single line of
	   body copy so a bare callout doesn't look top-heavy. */
	:host([is-title-hidden]) .callout {
		align-items: center;
	}
	:host([is-title-hidden]) .icon {
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

const LABELS: Record<string, string> = {
	note: 'Note',
	tip: 'Tip',
	important: 'Important',
	warning: 'Warning',
	caution: 'Caution'
}

export const ZCallout = c(
	(props) => {
		const kind = (props.kind as string) || 'note'
		const icon = ICONS[kind] || ICONS.note
		const label = (props.heading as string) || LABELS[kind] || 'Note'
		const isAlert = kind === 'warning' || kind === 'caution'

		return (
			<host shadowDom>
				<div class="callout" role={isAlert ? 'alert' : 'note'}>
					<span class="icon" aria-hidden="true">
						<svg viewBox="0 0 24 24">{icon}</svg>
					</span>
					<div class="content">
						{!props.isTitleHidden && <p class="label">{label}</p>}
						<div class="body">
							<slot />
						</div>
					</div>
				</div>
			</host>
		)
	},
	{
		props: {
			kind: { type: String, reflect: true },
			heading: String,
			isTitleHidden: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-callout', ZCallout)
