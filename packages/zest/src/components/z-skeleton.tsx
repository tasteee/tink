import { interactionStyles } from '../shared/interaction-styles'
import { defineElement } from '../shared/define-element'
import { c, css } from 'atomico'
import { oneOf } from '../shared/prop-types'

/*
 * z-skeleton, a loading placeholder. A faint surface with a slow shimmer that
 * sweeps across it. Shapes: text (default, a rounded line), circle, and rect.
 * Width/height accept any CSS length; `lines` repeats the text shape. No
 * shadows, the shimmer is a gradient, not elevation. The sweep defaults to the
 * surface lifted 0.09 in oklch lightness, so it reads as a highlight in every
 * theme rather than a foreground smear that inverts between light and dark;
 * override it wholesale with `--skeleton-shimmer`.
 */
const styles = css`
	:host {
		display: block;
	}

	:host([is-hidden]) {
		display: none;
	}

	:host([is-inline]) {
		display: inline-block;
	}

	.skeleton {
		position: relative;
		overflow: hidden;
		background: var(--skeleton, var(--color-neutral-3));
		border-radius: var(--radius-sm);
	}

	.skeleton.is-text {
		height: 0.75rem;
		border-radius: 999px;
	}
	.skeleton.is-circle {
		border-radius: 999px;
		width: 2.5rem;
		height: 2.5rem;
	}
	.skeleton.is-rect {
		border-radius: var(--radius-md);
		min-height: 6rem;
	}

	.skeleton::after {
		content: '';
		position: absolute;
		inset: 0;
		transform: translateX(-100%);
		will-change: transform;
		background: linear-gradient(
			90deg,
			transparent 15%,
			var(--skeleton-shimmer, oklch(from var(--skeleton, var(--color-neutral-3)) calc(l + 0.09) c h)) 50%,
			transparent 85%
		);
		animation: z-skeleton-shimmer 1.5s linear infinite;
	}

	.stack {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}
	.stack .skeleton:last-child {
		width: 70%;
	}

	@keyframes z-skeleton-shimmer {
		100% {
			transform: translateX(100%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.skeleton::after {
			animation: none;
		}
	}
`

export const ZSkeleton = c(
	(props) => {
		const shape = props.shape || 'text'
		const lines = props.lines && props.lines > 1 ? props.lines : 1

		const style: Record<string, string> = {}
		if (props.width) style.width = props.width
		if (props.height) style.height = props.height
		// a circle should be square by default if only one dimension is given
		if (shape === 'circle' && props.width && !props.height) style.height = props.width
		const hostWidth = props.width || (shape === 'circle' ? '2.5rem' : props.isInline ? '6rem' : '100%')

		const item = (key?: number) => <div key={key} class={`skeleton is-${shape}`} style={style}></div>

		return (
			<host shadowDom style={{ width: hostWidth }} aria-busy="true" aria-live="polite">
				{lines > 1 ? <div class="stack">{Array.from({ length: lines }).map((_, index) => item(index))}</div> : item()}
			</host>
		)
	},
	{
		props: {
			shape: { type: oneOf('text', 'circle', 'rect'), reflect: true },
			width: String,
			height: String,
			lines: { type: Number, reflect: true },
			isInline: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles: [styles, interactionStyles]
	}
)

defineElement('z-skeleton', ZSkeleton)
