import { c, css, event, useProp } from 'atomico'

/*
 * z-checkbox — square control. Unchecked is a hairline outline; checked fills
 * with the accent and reveals a stroked checkmark. Supports indeterminate.
 * Optional slotted label sits to the right and is fully clickable.
 */
const styles = css`
	:host {
		display: inline-flex;
	}

	:host([is-hidden]) {
		display: none;
	}

	:host([is-block]) {
		display: flex;
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

	.box {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 1.125rem;
		height: 1.125rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: transparent;
		transition: border-color 0.12s ease, background-color 0.12s ease;
	}

	label.is-small .box {
		width: 1rem;
		height: 1rem;
	}
	label.is-large .box {
		width: 1.375rem;
		height: 1.375rem;
	}

	label:hover .box {
		border-color: color-mix(in oklch, var(--foreground) 40%, transparent);
	}

	.box.is-checked,
	.box.is-indeterminate {
		background: var(--accent);
		border-color: var(--accent);
	}

	/* hidden native input drives focus + a11y */
	input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
		margin: 0;
	}

	input:focus-visible + .box {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: 2px;
	}

	.check {
		width: 70%;
		height: 70%;
		color: var(--primary-foreground);
		stroke: currentColor;
		stroke-width: 3;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;
		opacity: 0;
		transform: scale(0.6);
		transition: opacity 0.12s ease, transform 0.12s ease;
	}

	.box.is-checked .check {
		opacity: 1;
		transform: scale(1);
	}

	.dash {
		width: 60%;
		height: 2px;
		border-radius: 1px;
		background: var(--primary-foreground);
	}
`

const resolveSizeClass = (props: any): string => {
	if (props.size === 'small') return 'is-small'
	if (props.size === 'large') return 'is-large'
	return 'is-medium'
}

export const ZCheckbox = c(
	(props) => {
		const [isChecked, setIsChecked] = useProp<boolean>('isChecked')

		const labelClass = ['label', resolveSizeClass(props)]
			.concat(props.isDisabled ? ['is-disabled'] : [])
			.join(' ')

		const boxClass = ['box']
			.concat(isChecked && !props.isIndeterminate ? ['is-checked'] : [])
			.concat(props.isIndeterminate ? ['is-indeterminate'] : [])
			.join(' ')

		return (
			<host shadowDom>
				<label class={labelClass}>
					<input
						type="checkbox"
						checked={isChecked}
						name={props.name}
						value={props.value}
						disabled={props.isDisabled}
						aria-checked={props.isIndeterminate ? 'mixed' : isChecked ? 'true' : 'false'}
						onchange={() => {
							const next = !isChecked
							setIsChecked(next)
							props.change({ checked: next, value: props.value })
						}}
					/>
					<span class={boxClass} aria-hidden="true">
						{props.isIndeterminate ? (
							<span class="dash"></span>
						) : (
							<svg class="check" viewBox="0 0 24 24">
								<polyline points="4 12 10 18 20 6" />
							</svg>
						)}
					</span>
					<slot />
				</label>
			</host>
		)
	},
	{
		props: {
			isChecked: { type: Boolean, reflect: true },
			isIndeterminate: { type: Boolean, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			isBlock: { type: Boolean, reflect: true },
			size: { type: String, reflect: true },
			tone: { type: String, reflect: true },
			name: String,
			value: String,
			change: event<{ checked: boolean; value?: string }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-checkbox', ZCheckbox)
