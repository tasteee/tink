import { c, css, event, useProp } from 'atomico'

/*
 * z-radio — a single radio option. Circular control: hairline ring when off,
 * accent ring with a filled dot when selected. Designed to live inside
 * z-radio-group, which coordinates single-selection across siblings.
 */
const styles = css`
	:host {
		display: flex;
	}

	:host([is-hidden]) {
		display: none;
	}

	label {
		display: inline-flex;
		align-items: center;
		gap: 0.625rem;
		cursor: pointer;
		font-family: inherit;
		font-size: var(--font-size-small);
		color: var(--foreground);
		user-select: none;
		--accent: var(--primary);
	}

	:host([tone='primary']) label {
		--accent: var(--purple);
	}

	:host([tone='secondary']) label {
		--accent: var(--pink);
	}

	label.is-disabled {
		opacity: 0.5;
		pointer-events: none;
	}

	.ring {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 1.125rem;
		height: 1.125rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: transparent;
		transition: border-color 0.077s ease;
	}

	label:hover .ring {
		border-color: color-mix(in oklch, var(--foreground) 40%, transparent);
	}

	.ring.is-checked {
		border-color: var(--accent);
	}

	.dot {
		width: 0.55rem;
		height: 0.55rem;
		border-radius: 999px;
		background: var(--accent);
		transform: scale(0);
		transition: transform 0.077s var(--easing-standard, ease-out);
	}

	.ring.is-checked .dot {
		transform: scale(1);
	}

	input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
		margin: 0;
	}

	input:focus-visible + .ring {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: 2px;
	}
`

export const ZRadio = c(
	(props) => {
		const [isChecked, setIsChecked] = useProp<boolean>('isChecked')

		const labelClass = ['label'].concat(props.isDisabled ? ['is-disabled'] : []).join(' ')
		const ringClass = ['ring'].concat(isChecked ? ['is-checked'] : []).join(' ')

		return (
			<host shadowDom>
				<label class={labelClass}>
					<input
						type="radio"
						checked={isChecked}
						disabled={props.isDisabled}
						value={props.value}
						aria-checked={isChecked ? 'true' : 'false'}
						onchange={() => {
							setIsChecked(true)
							props.select({ value: props.value })
						}}
					/>
					<span class={ringClass} aria-hidden="true">
						<span class="dot"></span>
					</span>
					<slot />
				</label>
			</host>
		)
	},
	{
		props: {
			isChecked: { type: Boolean, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			tone: { type: String, reflect: true },
			value: String,
			select: event<{ value?: string }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-radio', ZRadio)
