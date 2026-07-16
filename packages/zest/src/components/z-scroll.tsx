import { c, css } from 'atomico'
import { baseStyles, insetProps, insetVars } from '../shared/layout-schema'
import { themedScrollbarStyles } from '../shared/scrollbar-styles'

/*
 * z-scroll — an overflow container with the design system's slim themed
 * scrollbars. `direction` picks the scrolling axis (vertical default,
 * horizontal, or both), `max-height` / `max-width` constrain it, `scrollbar`
 * tunes the bar (auto / thin / hidden) and `overscroll` sets the
 * overscroll-behavior. `inset` pads the inner viewport.
 */
const styles = css`
	:host {
		display: block;
		min-height: 0;
	}

	.viewport {
		box-sizing: border-box;
		max-height: var(--z-scroll-max-height, none);
		max-width: var(--z-scroll-max-width, none);
		padding-top: var(--z-scroll-pad-top, 0);
		padding-bottom: var(--z-scroll-pad-bottom, 0);
		padding-left: var(--z-scroll-pad-left, 0);
		padding-right: var(--z-scroll-pad-right, 0);
		overflow-x: hidden;
		overflow-y: auto;
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

	:host([direction='horizontal']) .viewport {
		overflow-x: auto;
		overflow-y: hidden;
	}
	:host([direction='both']) .viewport {
		overflow: auto;
	}

	:host([scrollbar='auto']) .viewport {
		scrollbar-width: auto;
	}
	:host([scrollbar='hidden']) .viewport {
		scrollbar-width: none;
	}
	:host([scrollbar='hidden']) .viewport::-webkit-scrollbar {
		display: none;
	}

	:host([overscroll='auto']) .viewport {
		overscroll-behavior: auto;
	}
	:host([overscroll='contain']) .viewport {
		overscroll-behavior: contain;
	}
	:host([overscroll='none']) .viewport {
		overscroll-behavior: none;
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

const getHostStyle = (props: {
	maxHeight?: string
	maxWidth?: string
} & Parameters<typeof insetVars>[0]): Record<string, string> => {
	const style: Record<string, string> = { ...insetVars(props, '--z-scroll') }
	if (props.maxHeight) style['--z-scroll-max-height'] = props.maxHeight
	if (props.maxWidth) style['--z-scroll-max-width'] = props.maxWidth
	return style
}

export const ZScroll = c(
	(props) => (
		<host shadowDom style={getHostStyle(props)}>
			<div class='viewport' tabindex='0'>
				<slot />
			</div>
		</host>
	),
	{
		props: {
			direction: { type: String, reflect: true },
			maxHeight: String,
			maxWidth: String,
			overscroll: { type: String, reflect: true },
			scrollbar: { type: String, reflect: true },
			...insetProps
		},
		styles: [baseStyles, themedScrollbarStyles, styles]
	}
)

customElements.define('z-scroll', ZScroll)
