import { interactionStyles } from '../shared/interaction-styles'
import { defineFormElement, useFormControl } from '../shared/form-control'
import { useAccessibleName } from '../shared/accessible'
import { c, css } from 'atomico'
import { oneOf } from '../shared/prop-types'

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
		   button's content when standalone, but when a parent stretches the host
		   (full-width, or a z-button-group column), the button fills it instead of
		   staying content-width. */
		width: 100%;
		transition:
			opacity var(--motion-fast),
			border-color var(--motion-fast),
			background-color var(--motion-fast),
			color var(--motion-fast),
			box-shadow var(--material-press-duration) ease;
	}

	button.is-full-width {
		width: 100%;
	}

	button:focus-visible {
		outline: 3px solid var(--focus-ring);
		outline-offset: 2px;
	}

	/* sizes */

	button.is-sm {
		border-radius: var(--z-button-radius, var(--small-button-radius));
		height: var(--control-height-sm);
		padding-inline: 0.875rem;
		font-size: var(--control-font-size-sm);
	}

	button.is-md {
		border-radius: var(--z-button-radius, var(--medium-button-radius));
		height: var(--control-height-md);
		padding-inline: 1rem;
		font-size: var(--control-font-size-md);
	}

	button.is-lg {
		border-radius: var(--z-button-radius, var(--large-button-radius));
		height: var(--control-height-lg);
		padding-inline: 1.5rem;
		font-size: var(--control-font-size-lg);
	}

	button.is-neutral {
		--tone-color: var(--color-neutral-8);
	}

	button.is-primary {
		--tone-color: var(--purple);
	}

	button.is-secondary {
		--tone-color: var(--pink);
	}

	button.is-success {
		--tone-color: var(--success);
	}

	button.is-warning {
		--tone-color: var(--warning);
	}

	button.is-error {
		--tone-color: var(--destructive);
	}

	/* kinds: paint using --tone-color */

	/* A solid button is the library's most physical object, so it consumes the
	   full material vocabulary: a lit fill, a raised stack, and an LED rim in
	   its own tone. Every one of those tokens is inert in the flat themes,
	   where this paints exactly the flat tone colour it always did.
	   --emissive-color is the handshake: the theme writes the glow, this
	   writes which colour it glows. */
	button.is-solid {
		--emissive-color: var(--tone-color);
		background: var(--material-tone), var(--tone-color);
		box-shadow: var(--elevation-raised), var(--emissive-tone);
		border-color: var(--tone-color);
		color: var(--on-accent);
		font-weight: 600;
	}

	/* Pressing swaps the raised stack for the pressed one, which in the
	   hardware themes reads as the cap travelling into the panel. */
	button.is-solid:active {
		box-shadow: var(--elevation-pressed);
	}

	/* The neutral tone is the one fill that flips with the theme — near-white
	   on dark, near-black on light — so its label has to flip with it rather
	   than being pinned to black. */
	button.is-solid.is-neutral {
		color: var(--primary-foreground);
	}

	button.is-solid:hover {
		opacity: 0.9;
	}

	button.is-solid:active {
		opacity: 0.8;
	}

	button.is-outline {
		background: var(--material-surface);
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
		/* The tone on its own tint measured 3.7–4.3:1 in the light themes.
		   Pulling the text a quarter of the way to the foreground clears 4.5:1
		   in every theme — darker on paper, lighter on ink — as z-badge does. */
		color: color-mix(in oklab, var(--tone-color) 72%, var(--foreground));
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
		text-underline-offset: 0.25em;
		text-decoration-thickness: 1px;
	}

	button.is-plain:active {
		opacity: 0.8;
	}

	/* states */

	button.is-disabled,
	button:disabled {
		opacity: var(--control-disabled-opacity);
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

	button.is-sm ::slotted(svg) {
		width: 0.875rem;
		height: 0.875rem;
	}

	button.is-lg ::slotted(svg) {
		width: 1.125rem;
		height: 1.125rem;
	}

	button.is-outline.is-neutral {
		border-color: var(--border);
		color: var(--foreground);
	}

	button.is-outline.is-neutral:hover {
		border-color: var(--color-neutral-4);
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
	if (props.size === 'sm') return 'is-sm'
	if (props.size === 'lg') return 'is-lg'
	return 'is-md'
}

const resolveKindClass = (props: any): string => {
	if (props.kind === 'outline') return 'is-outline'
	if (props.kind === 'ghost') return 'is-ghost'
	if (props.kind === 'soft') return 'is-soft'
	if (props.kind === 'plain') return 'is-plain'
	return 'is-solid'
}

const resolveAccentClass = (props: any): string => {
	if (props.tone === 'primary') return 'is-primary'
	if (props.tone === 'secondary') return 'is-secondary'
	if (props.tone === 'success') return 'is-success'
	if (props.tone === 'warning') return 'is-warning'
	if (props.tone === 'danger') return 'is-error'
	return 'is-neutral'
}

export const ZButton = c(
	(props) => {
		const buttonType = (props.type as any) || 'button'
		// An icon-only button is named by aria-label / aria-labelledby on the
		// host; the inner button is what a screen reader reads, so it goes there.
		// `label` is visible text, so it is not part of this.
		const accessibleName = useAccessibleName()

		// The inner <button> has no form owner from inside the shadow root, so a
		// submit or reset is relayed to the owning form through ElementInternals.
		// A named submit button contributes its name/value for the duration of
		// the submission, as the native submitter would.
		const { internals, isFormDisabled } = useFormControl({
			value: null,
			isDisabled: props.isDisabled,
			onReset: () => {}
		})
		const isDisabled = props.isDisabled || isFormDisabled
		const relayToForm = () => {
			const form = internals?.form
			if (!form) return
			if (buttonType === 'reset') { form.reset(); return }
			if (buttonType !== 'submit') return
			const isNamed = Boolean(props.name)
			if (isNamed) internals!.setFormValue(props.value ?? '')
			try { form.requestSubmit() } finally { if (isNamed) internals!.setFormValue(null) }
		}

		const kindClass = resolveKindClass(props)
		const toneClass = resolveAccentClass(props)
		const sizeClass = resolveSizeClass(props)
		const isButtonDisabled = isDisabled || props.isLoading

		const buttonClass = [kindClass, toneClass, sizeClass]
			.concat(props.isLoading ? ['is-loading'] : [])
			.concat(isDisabled ? ['is-disabled'] : [])
			.concat(props.isFullWidth ? ['is-full-width'] : [])
			.join(' ')

		return (
			<host shadowDom={{ delegatesFocus: true }}>
				<button class={buttonClass} type={buttonType} disabled={isButtonDisabled} aria-busy={props.isLoading ? 'true' : undefined} aria-label={accessibleName} onclick={relayToForm}>
					{props.isLoading && <span class='spinner' aria-hidden='true'></span>}
					<span class='label'>{props.label ? props.label : <slot />}</span>
				</button>
			</host>
		)
	},
	{
		props: {
			size: { type: oneOf('sm', 'md', 'lg'), reflect: true },
			kind: { type: oneOf('solid', 'outline', 'ghost', 'soft', 'plain'), reflect: true },
			tone: { type: oneOf('neutral', 'primary', 'secondary', 'success', 'warning', 'danger'), reflect: true },
			isHidden: { type: Boolean, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			isLoading: { type: Boolean, reflect: true },
			isFullWidth: { type: Boolean, reflect: true },
			label: String,
			type: oneOf('button', 'submit', 'reset'),
			name: { type: String, reflect: true },
			value: String
		},
		styles: [styles, interactionStyles],
		form: true
	}
)

defineFormElement('z-button', ZButton)
