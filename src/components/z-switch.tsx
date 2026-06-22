import { c, css, event, useProp } from 'atomico'

/*
 * z-switch — a binary toggle rendered as a track + sliding knob. Off is a
 * hairline outline track; on fills with the accent and slides the knob right.
 * No shadows — the knob is a solid disc, the track a bordered pill.
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

	.track {
		position: relative;
		display: inline-flex;
		align-items: center;
		flex-shrink: 0;
		width: 2.5rem;
		height: 1.375rem;
		padding: 2px;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: transparent;
		box-sizing: border-box;
		transition: background-color 0.16s ease, border-color 0.16s ease;
	}

	label.is-small .track {
		width: 2.125rem;
		height: 1.2rem;
	}
	label.is-large .track {
		width: 3rem;
		height: 1.625rem;
	}

	label:hover .track {
		border-color: color-mix(in oklch, var(--foreground) 40%, transparent);
	}

	.track.is-on {
		background: var(--accent);
		border-color: var(--accent);
	}

	.knob {
		width: calc(1.375rem - 6px);
		height: calc(1.375rem - 6px);
		border-radius: 999px;
		background: var(--muted-foreground);
		transition: transform 0.16s var(--easing-standard, ease-out), background-color 0.16s ease;
	}

	label.is-small .knob {
		width: calc(1.2rem - 6px);
		height: calc(1.2rem - 6px);
	}
	label.is-large .knob {
		width: calc(1.625rem - 6px);
		height: calc(1.625rem - 6px);
	}

	.track.is-on .knob {
		background: var(--primary-foreground);
		transform: translateX(calc(2.5rem - 1.375rem));
	}
	label.is-small .track.is-on .knob {
		transform: translateX(calc(2.125rem - 1.2rem));
	}
	label.is-large .track.is-on .knob {
		transform: translateX(calc(3rem - 1.625rem));
	}

	input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
		margin: 0;
	}

	input:focus-visible + .track {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: 2px;
	}
`

const resolveSizeClass = (props: any): string => {
	if (props.size === 'small') return 'is-small'
	if (props.size === 'large') return 'is-large'
	return 'is-medium'
}

export const ZSwitch = c(
	(props) => {
		const [isChecked, setIsChecked] = useProp<boolean>('isChecked')

		const labelClass = ['label', resolveSizeClass(props)]
			.concat(props.isDisabled ? ['is-disabled'] : [])
			.join(' ')

		const trackClass = ['track'].concat(isChecked ? ['is-on'] : []).join(' ')

		return (
			<host shadowDom>
				<label class={labelClass}>
					<input
						type="checkbox"
						role="switch"
						checked={isChecked}
						name={props.name}
						value={props.value}
						disabled={props.isDisabled}
						aria-checked={isChecked ? 'true' : 'false'}
						onchange={() => {
							const next = !isChecked
							setIsChecked(next)
							props.change({ checked: next, value: props.value })
						}}
					/>
					<span class={trackClass} aria-hidden="true">
						<span class="knob"></span>
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

customElements.define('z-switch', ZSwitch)
