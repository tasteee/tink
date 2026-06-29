import { c, css } from 'atomico'

const styles = css`
	:host {
		display: inline-flex;
		user-select: none;
		-webkit-user-select: none;
	}

	:host([is-hidden]) {
		display: none;
	}

	:host([is-full-width]) {
		display: flex;
		width: 100%;
	}

	button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-family: inherit;
		font-weight: 500;
		white-space: nowrap;
		border: 1px solid transparent;
		cursor: pointer;
		line-height: 1;
		box-sizing: border-box;
		/* Fill the host. The host is inline-flex, so it still shrink-wraps to the
		   button's content when standalone — but when a parent stretches the host
		   (full-width, or a z-button-group column), the button fills it instead of
		   staying content-width. */
		width: 100%;
		transition:
			opacity 0.05s,
			border-color 0.05s,
			background-color 0.05s,
			color 0.05s;
	}

	button.is-full-width {
		width: 100%;
	}

	/* sizes */

	button.is-small {
		border-radius: var(--z-button-radius, var(--small-button-radius));
		height: 2rem;
		padding-inline: 0.875rem;
		font-size: 0.75rem;
	}

	button.is-medium {
		border-radius: var(--z-button-radius, var(--medium-button-radius));
		height: 2.5rem;
		padding-inline: 1rem;
		font-size: 0.875rem;
	}

	button.is-large {
		border-radius: var(--z-button-radius, var(--large-button-radius));
		height: 3rem;
		padding-inline: 1.5rem;
		font-size: 1rem;
	}

	/* tones: each one sets --tone-color, the single color every kind below
	   paints with. primary/secondary/success/warning/danger share the same
	   oklch lightness/chroma (see --tone-accent-l/-c in tokens.css) so a solid
	   button of any tone reads with the same boldness, hue aside. They're all
	   light enough to pair with --primary-foreground for solid-kind text. */

	button.is-primary {
		--tone-color: var(--purple);
	}

	button.is-secondary {
		--tone-color: var(--pink);
	}

	button.is-neutral {
		--tone-color: var(--color-neutral-8);
	}

	button.is-success {
		--tone-color: var(--success);
	}

	button.is-warning {
		--tone-color: var(--warning);
	}

	button.is-danger {
		--tone-color: var(--destructive);
	}

	/* kinds: paint using --tone-color */

	button.is-solid {
		background: var(--tone-color);
		border-color: var(--tone-color);
		color: white;
		font-weight: 600;
	}

	button.is-solid.is-neutral {
		color: black;
	}

	button.is-solid:hover {
		opacity: 0.9;
	}

	button.is-solid:active {
		opacity: 0.8;
	}

	button.is-outline {
		background: transparent;
		border-color: var(--tone-color);
		color: var(--tone-color);
	}

	button.is-outline:hover {
		background: color-mix(in srgb, var(--tone-color) 10%, transparent);
	}

	button.is-outline:active {
		background: color-mix(in srgb, var(--tone-color) 20%, transparent);
	}

	button.is-ghost {
		background: transparent;
		border-color: transparent;
		color: var(--tone-color);
	}

	button.is-ghost:hover {
		background: color-mix(in srgb, var(--tone-color) 10%, transparent);
	}

	button.is-ghost:active {
		background: color-mix(in srgb, var(--tone-color) 18%, transparent);
	}

	button.is-soft {
		background: color-mix(in srgb, var(--tone-color) 15%, transparent);
		border-color: transparent;
		color: var(--tone-color);
		font-weight: 600;
	}

	button.is-soft:hover {
		background: color-mix(in srgb, var(--tone-color) 24%, transparent);
	}

	button.is-soft:active {
		background: color-mix(in srgb, var(--tone-color) 32%, transparent);
	}

	button.is-plain {
		background: transparent;
		border-color: transparent;
		color: var(--tone-color);
	}

	button.is-plain:hover {
		text-decoration: underline;
	}

	button.is-plain:active {
		opacity: 0.8;
	}

	/* states */

	button.is-disabled,
	button:disabled {
		filter: contrast(75%) brightness(0.6);
		pointer-events: none;
	}

	button.is-loading {
		cursor: progress;
	}

	.spinner {
		width: 0.875em;
		height: 0.875em;
		border: 2px solid currentColor;
		border-top-color: transparent;
		border-radius: 999px;
		animation: z-button-spin 0.7s linear infinite;
	}

	::slotted(svg) {
		width: 1rem;
		height: 1rem;
		margin-top: 1px;
		flex-shrink: 0;
	}

	button.is-small ::slotted(svg) {
		width: 0.875rem;
		height: 0.875rem;
	}

	button.is-large ::slotted(svg) {
		width: 1.125rem;
		height: 1.125rem;
	}

	button.is-outline.is-neutral {
		--tone-color: var(--color-neutral-7);
		color: var(--color-neutral-7);

		&:hover {
			/* background: var(--color-neutral-3); */
			color: var(--color-neutral-9) !important;
		}
	}

	.is-solid.is-primary .label,
	.is-solid.is-secondary .label {
		text-shadow: 0 0px 18px var(--primary-foreground);
	}

	.label {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	@keyframes z-button-spin {
		to {
			transform: rotate(360deg);
		}
	}
`

const resolveSizeClass = (props: any): string => {
	if (props.size === 'small') return 'is-small'
	if (props.size === 'large') return 'is-large'
	return 'is-medium'
}

const resolveKindClass = (props: any): string => {
	if (props.kind === 'outline') return 'is-outline'
	if (props.kind === 'ghost') return 'is-ghost'
	if (props.kind === 'soft') return 'is-soft'
	if (props.kind === 'plain') return 'is-plain'
	return 'is-solid'
}

const resolveToneClass = (props: any): string => {
	if (props.tone === 'primary') return 'is-primary'
	if (props.tone === 'secondary') return 'is-secondary'
	if (props.tone === 'success') return 'is-success'
	if (props.tone === 'warning') return 'is-warning'
	if (props.tone === 'danger') return 'is-danger'
	return 'is-neutral'
}

export const ZButton = c(
	(props) => {
		const buttonType = (props.type as any) || 'button'

		const kindClass = resolveKindClass(props)
		const toneClass = resolveToneClass(props)
		const sizeClass = resolveSizeClass(props)
		const isButtonDisabled = props.isDisabled || props.isLoading

		const buttonClass = [kindClass, toneClass, sizeClass]
			.concat(props.isLoading ? ['is-loading'] : [])
			.concat(props.isDisabled ? ['is-disabled'] : [])
			.concat(props.isFullWidth ? ['is-full-width'] : [])
			.join(' ')

		return (
			<host shadowDom>
				<button class={buttonClass} type={buttonType} disabled={isButtonDisabled}>
					{props.isLoading && <span class='spinner' aria-hidden='true'></span>}
					<span class='label'>{props.label ? props.label : <slot />}</span>
				</button>
			</host>
		)
	},
	{
		props: {
			size: { type: String, reflect: true },
			kind: { type: String, reflect: true },
			tone: { type: String, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			isLoading: { type: Boolean, reflect: true },
			isFullWidth: { type: Boolean, reflect: true },
			label: String,
			type: String
		},
		styles
	}
)

customElements.define('z-button', ZButton)
