import { c, css } from 'atomico'

/*
 * z-range-handle — a declarative handle for z-range. It renders nothing on its
 * own; z-range reads its value plus optional min/max/step/tone and paints the
 * unified track. The first handle is the left/lower one, the second is the
 * right/upper one. When min/max are omitted they inherit the parent z-range's
 * domain; when set they are clamped to that domain. z-range mirrors the live
 * value back onto `value` so reading `handleEl.value` always stays truthful.
 */
const styles = css`
	:host {
		display: none;
	}
`

export const ZRangeHandle = c(
	() => <host />,
	{
		props: {
			value: { type: Number, reflect: true },
			min: { type: Number, reflect: true },
			max: { type: Number, reflect: true },
			step: { type: Number, reflect: true },
			tone: { type: String, reflect: true },
			label: String
		},
		styles
	}
)

customElements.define('z-range-handle', ZRangeHandle)
