import { c, css, event } from 'atomico'

/*
 * z-image-message — one or more images sent in a message. Single image renders
 * full-width (capped); multiples become an album grid, with a "+N" overlay when
 * there are more than four. Clicking emits `open` {index, src} (wire to a
 * lightbox). Data-driven:
 *
 *   el.images = [{ src, alt }, …]        // or a single `src` attribute
 */
type Img = { src: string; alt?: string }

const styles = css`
	:host {
		display: block;
		max-width: 20rem;
	}
	:host([is-hidden]) {
		display: none;
	}
	.grid {
		display: grid;
		gap: 2px;
		border-radius: var(--radius-md);
		overflow: hidden;
	}
	.grid.n1 {
		grid-template-columns: 1fr;
	}
	.grid.n2 {
		grid-template-columns: 1fr 1fr;
	}
	.grid.n3,
	.grid.n4 {
		grid-template-columns: 1fr 1fr;
	}
	.cell {
		position: relative;
		border: none;
		padding: 0;
		cursor: pointer;
		background: color-mix(in oklch, var(--foreground) 8%, transparent);
		aspect-ratio: 1;
		overflow: hidden;
	}
	.grid.n1 .cell {
		aspect-ratio: 4 / 3;
	}
	/* first image spans both columns when there are three */
	.grid.n3 .cell:first-child {
		grid-column: 1 / -1;
		aspect-ratio: 16 / 9;
	}
	.cell img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.more {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in oklch, black 55%, transparent);
		color: white;
		font-size: 1.25rem;
		font-weight: 700;
	}
`

export const ZImageMessage = c(
	(props) => {
		const list: Img[] = Array.isArray(props.images)
			? (props.images as Img[])
			: props.src
				? [{ src: props.src as string, alt: props.alt as string }]
				: []

		const max = 4
		const shown = list.slice(0, max)
		const extra = list.length - shown.length
		const n = Math.min(shown.length, 4)

		return (
			<host shadowDom>
				<div class={`grid n${n}`}>
					{shown.map((img, i) => (
						<button
							key={i}
							class="cell"
							type="button"
							aria-label={img.alt || `Image ${i + 1}`}
							onclick={() => props.open({ index: i, src: img.src })}
						>
							<img src={img.src} alt={img.alt || ''} loading="lazy" />
							{i === shown.length - 1 && extra > 0 && <span class="more">+{extra}</span>}
						</button>
					))}
				</div>
			</host>
		)
	},
	{
		props: {
			images: { type: Array },
			src: { type: String, reflect: true },
			alt: { type: String, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			open: event<{ index: number; src: string }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-image-message', ZImageMessage)
