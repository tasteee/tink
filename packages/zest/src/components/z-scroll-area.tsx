import { c, css } from 'atomico'

/*
 * z-scroll-area — a scroll container with the design system's slim, themed
 * scrollbars instead of the chunky native ones. Constrain it with `max-height`
 * (or `height`) and let the default slot overflow. `orientation` picks which
 * axis scrolls (vertical default, horizontal, or both). Pure CSS — the styled
 * scrollbar lives inside the shadow root so it never leaks to the page.
 */
const styles = css`
	:host {
		display: block;
		min-height: 0;
	}

	:host([is-hidden]) {
		display: none;
	}

	.viewport {
		box-sizing: border-box;
		max-height: var(--z-scroll-max-height, none);
		height: var(--z-scroll-height, auto);
		overflow: auto;
	}

	/* Firefox only (no ::-webkit-scrollbar). Chromium must not get scrollbar-width
	   or it falls back to the OS bar with its stepper arrows; it uses the custom
	   ::-webkit-scrollbar rules below instead. */
	@supports not selector(::-webkit-scrollbar) {
		.viewport {
			scrollbar-width: thin;
			scrollbar-color: var(--color-neutral-3) transparent;
		}
	}

	:host([orientation='vertical']) .viewport {
		overflow-x: hidden;
		overflow-y: auto;
	}

	:host([orientation='horizontal']) .viewport {
		overflow-x: auto;
		overflow-y: hidden;
	}

	/* WebKit / Chromium */
	.viewport::-webkit-scrollbar {
		width: 8px;
		height: 8px;
	}
	.viewport::-webkit-scrollbar-track {
		background: transparent;
	}
	.viewport::-webkit-scrollbar-thumb {
		background: var(--color-neutral-3);
		border-radius: 999px;
	}
	.viewport::-webkit-scrollbar-thumb:hover {
		background: var(--color-neutral-4);
	}
	.viewport::-webkit-scrollbar-button {
		display: none;
		width: 0;
		height: 0;
	}
	.viewport::-webkit-scrollbar-corner {
		background: transparent;
	}
`

export const ZScrollArea = c(
	(props) => (
		<host
			shadowDom
			style={{
				'--z-scroll-max-height': props.maxHeight || '',
				'--z-scroll-height': props.height || ''
			}}
		>
			<div class="viewport" tabindex="0">
				<slot />
			</div>
		</host>
	),
	{
		props: {
			maxHeight: String,
			height: String,
			orientation: { type: String, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-scroll-area', ZScrollArea)
