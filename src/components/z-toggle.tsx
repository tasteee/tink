import { c, css, event, useProp } from 'atomico'

const styles = css`
	:host {
		display: inline-flex;
	}

	:host([is-hidden]) {
		display: none;
	}

	button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-family: inherit;
		font-weight: 500;
		white-space: nowrap;
		cursor: pointer;
		line-height: 1;
		box-sizing: border-box;
		background: transparent;
		border: 1px solid var(--toggle-border, transparent);
		color: var(--tone-text, var(--foreground));
		border-radius: var(--z-toggle-radius, var(--radius-md));
		height: var(--toggle-height, 2.5rem);
		padding-inline: var(--toggle-padding-inline, 1rem);
		min-width: var(--toggle-min-width, 2.5rem);
		font-size: var(--toggle-font-size, 0.875rem);
		transition:
			opacity 0.1s ease,
			border-color 0.1s ease,
			background-color 0.1s ease,
			color 0.1s ease;
	}

	button:hover {
		background: color-mix(in oklch, var(--tone-color) 10%, transparent);
	}

	button[data-state='on'] {
		background: var(--tone-color);
		border-color: transparent;
		color: var(--tone-on-foreground, var(--primary-foreground));
	}

	button:focus-visible {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: 2px;
	}

	button:disabled {
		opacity: 0.5;
		pointer-events: none;
	}

	/* sizes: each sets the dimension vars the base button consumes, so is-icon
	   (width: var(--toggle-height)) tracks whichever size is active. */

	button.is-small {
		--toggle-height: 2rem;
		--toggle-padding-inline: 0.75rem;
		--toggle-min-width: 2rem;
		--toggle-font-size: 0.8125rem;
		--toggle-icon-size: 0.875rem;
	}

	button.is-medium {
		--toggle-height: 2.5rem;
		--toggle-padding-inline: 1rem;
		--toggle-min-width: 2.5rem;
		--toggle-font-size: 0.875rem;
		--toggle-icon-size: 1rem;
	}

	button.is-large {
		--toggle-height: 3rem;
		--toggle-padding-inline: 1.25rem;
		--toggle-min-width: 3rem;
		--toggle-font-size: 1rem;
		--toggle-icon-size: 1.125rem;
	}

	button.is-icon {
		padding-inline: 0;
		width: var(--toggle-height, 2.5rem);
	}

	/* tones: each one sets --tone-color, the single accent every kind paints
	   with, plus the resting text color (--tone-text) and the foreground used
	   when pressed (--tone-on-foreground). Mirrors z-button's tone model. */

	button.is-neutral {
		--tone-color: var(--primary);
		--tone-text: var(--foreground);
		--tone-on-foreground: var(--primary-foreground);
	}

	button.is-primary {
		--tone-color: var(--neon-purple);
		--tone-text: var(--neon-purple);
		--tone-on-foreground: var(--primary-foreground);
	}

	button.is-secondary {
		--tone-color: var(--neon-pink);
		--tone-text: var(--neon-pink);
		--tone-on-foreground: var(--primary-foreground);
	}

	/* kinds: paint using --tone-color */

	button.is-ghost {
		--toggle-border: transparent;
	}

	/* off: tone-colored text + a dimmed tone border (border and text agree).
	   on: solid tone fill (inherits the base on-state) with a solid tone border. */
	button.is-outline {
		--toggle-border: color-mix(in oklch, var(--tone-color) 50%, transparent);
	}

	button.is-outline[data-state='on'] {
		border-color: var(--tone-color);
	}

	::slotted(svg) {
		width: var(--toggle-icon-size, 1rem);
		height: var(--toggle-icon-size, 1rem);
		flex-shrink: 0;
		pointer-events: none;
	}
`

const resolveSizeClass = (props: any): string => {
	if (props.size === 'small') return 'is-small'
	if (props.size === 'large') return 'is-large'
	return 'is-medium'
}

const resolveKindClass = (props: any): string => {
	if (props.kind === 'ghost') return 'is-ghost'
	return 'is-outline'
}

const resolveToneClass = (props: any): string => {
	if (props.tone === 'primary') return 'is-primary'
	if (props.tone === 'secondary') return 'is-secondary'
	return 'is-neutral'
}

export const ZToggle = c(
	(props) => {
		const [isPressed, setIsPressed] = useProp<boolean>('isPressed')

		const kindClass = resolveKindClass(props)
		const toneClass = resolveToneClass(props)
		const sizeClass = resolveSizeClass(props)

		const buttonClass = [kindClass, toneClass, sizeClass].concat(props.isIcon ? ['is-icon'] : []).join(' ')

		return (
			<host shadowDom>
				<button
					type="button"
					class={buttonClass}
					data-state={isPressed ? 'on' : 'off'}
					aria-pressed={isPressed ? 'true' : 'false'}
					disabled={props.isDisabled}
					onclick={() => {
						const nextPressed = !isPressed
						setIsPressed(nextPressed)
						props.press({ pressed: nextPressed })
					}}
				>
					<slot />
				</button>
			</host>
		)
	},
	{
		props: {
			size: { type: String, reflect: true },
			kind: { type: String, reflect: true },
			tone: { type: String, reflect: true },
			isIcon: { type: Boolean, reflect: true },
			isPressed: { type: Boolean, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			press: event<{ pressed: boolean }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-toggle', ZToggle)
