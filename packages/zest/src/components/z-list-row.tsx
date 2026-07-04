import { c, css } from 'atomico'

/*
 * z-list-row — one row inside z-list. Lays its slotted children out on a
 * horizontal flex line: the second child grows to fill the row (typical pattern
 * is leading icon/avatar, then a growing title/subtitle block, then trailing
 * actions). `slot` is default `display: contents`, so the slotted elements
 * become flex items of the host directly. Give any child `class="is-grow"` to
 * make it grow too, or `class="is-wrap"` to drop it onto its own full-width
 * line below (the line wraps because the host is `flex-wrap: wrap`).
 */
const styles = css`
	:host {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem 0.875rem;
		padding: 0.75rem 1rem;
		box-sizing: border-box;
	}

	:host([is-hidden]) {
		display: none;
	}

	:host([is-clickable]) {
		cursor: pointer;
		transition: background-color 0.12s ease;
	}
	:host([is-clickable]:hover) {
		background: color-mix(in oklch, var(--foreground) 6%, transparent);
	}

	/* The second child grows to fill the row by default. */
	::slotted(:nth-child(2)) {
		flex: 1;
		min-width: 0;
	}

	/* Opt an additional child into growing. */
	::slotted(.is-grow) {
		flex: 1;
		min-width: 0;
	}

	/* Drop a child onto its own full-width line beneath the rest. */
	::slotted(.is-wrap) {
		flex-basis: 100%;
		min-width: 0;
	}

	::slotted(svg),
	::slotted(img) {
		flex-shrink: 0;
	}
`

export const ZListRow = c(
	() => (
		<host shadowDom>
			<slot />
		</host>
	),
	{
		props: {
			isClickable: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-list-row', ZListRow)
