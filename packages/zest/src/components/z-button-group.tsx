import { c, css } from 'atomico'

const styles = css`
	:host {
		display: flex;
		width: fit-content;
		align-items: stretch;
		user-select: none;
		-webkit-user-select: none;
	}

	:host([is-vertical]) {
		flex-direction: column;
	}

	::slotted(*) {
		--z-button-radius: 0;
		flex-shrink: 0;
	}

	::slotted(:only-child) {
		--z-button-radius: var(--radius-md);
	}

	:host(:not([is-vertical])) ::slotted(:first-child) {
		--z-button-radius: var(--radius-md) 0 0 var(--radius-md);
	}

	:host(:not([is-vertical])) ::slotted(:last-child) {
		--z-button-radius: 0 var(--radius-md) var(--radius-md) 0;
	}

	:host(:not([is-vertical])) ::slotted(:not(:first-child)) {
		margin-left: -1px;
	}

	:host([is-vertical]) ::slotted(:first-child) {
		--z-button-radius: var(--radius-md) var(--radius-md) 0 0;
	}

	:host([is-vertical]) ::slotted(:last-child) {
		--z-button-radius: 0 0 var(--radius-md) var(--radius-md);
	}

	:host([is-vertical]) ::slotted(:not(:first-child)) {
		margin-top: -1px;
	}

	/* Equal width down the stack. align-items: stretch doesn't reliably stretch
	   the inline-flex button hosts across the column's cross axis, so the widest
	   label (e.g. "Bottom") would otherwise leave the narrower ones ragged. The
	   group is width: fit-content, so 100% resolves to the widest item's width. */
	:host([is-vertical]) ::slotted(*) {
		width: 100%;
	}

	/* Stacking ladder: earlier items paint above later ones so each item shows
	   its own trailing border at the seam instead of being covered by the next
	   item. The focused item jumps above all so its full border is never clipped. */
	::slotted(*) {
		position: relative;
		z-index: 1;
	}
	::slotted(:nth-child(1)) {
		z-index: 9;
	}
	::slotted(:nth-child(2)) {
		z-index: 8;
	}
	::slotted(:nth-child(3)) {
		z-index: 7;
	}
	::slotted(:nth-child(4)) {
		z-index: 6;
	}
	::slotted(:nth-child(5)) {
		z-index: 5;
	}
	::slotted(:nth-child(6)) {
		z-index: 4;
	}
	::slotted(:nth-child(7)) {
		z-index: 3;
	}
	::slotted(:nth-child(8)) {
		z-index: 2;
	}
	::slotted(:focus-visible) {
		z-index: 20;
	}
`

export const ZButtonGroup = c(
	(props) => (
		<host shadowDom role="group">
			<slot />
		</host>
	),
	{
		props: {
			isVertical: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-button-group', ZButtonGroup)
