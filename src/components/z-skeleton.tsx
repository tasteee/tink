import { c, css } from 'atomico'

/*
 * z-skeleton — a loading placeholder. A faint surface with a slow shimmer that
 * sweeps across it. Shapes: text (default, a rounded line), circle, and rect.
 * Width/height accept any CSS length; `lines` repeats the text shape. No
 * shadows — the shimmer is a gradient, not elevation.
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
	}
	.skeleton.is-rect {
		border-radius: var(--radius-md);
	}

	.skeleton::after {
		content: '';
		position: absolute;
		inset: 0;
		transform: translateX(-100%);
		background: linear-gradient(
			90deg,
			transparent,
			color-mix(in oklch, var(--foreground) 8%, transparent),
			transparent
		);
		animation: z-skeleton-shimmer 1.5s infinite;
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

		const item = <div class={`skeleton is-${shape}`} style={style}></div>

		return (
			<host shadowDom aria-busy="true" aria-live="polite">
				{lines > 1 ? <div class="stack">{Array.from({ length: lines }).map(() => item)}</div> : item}
			</host>
		)
	},
	{
		props: {
			shape: { type: String, reflect: true },
			width: String,
			height: String,
			lines: { type: Number, reflect: true },
			isInline: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-skeleton', ZSkeleton)
