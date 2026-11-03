import { interactionStyles } from '../shared/interaction-styles'
import { defineFormElement, useFormControl } from '../shared/form-control'
import { describableProps, describedBy, renderDescriptions, srOnlyStyles, useAccessibleName } from '../shared/accessible'
import { c, css, event, useHost, useProp, useRef } from 'atomico'
import { oneOf } from '../shared/prop-types'

/*
 * z-switch, a binary toggle rendered as a track + sliding knob. Off is a
 * hairline outline track; on fills with the accent and slides the knob right.
 * No shadows, the knob is a solid disc, the track a bordered pill.
 */
const styles = css`
	:host {
		display: inline-flex;
	}

	:host([is-hidden]) {
		display: none;
	}

	:host([is-full-width]) {
		display: flex;
	}

	label {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.625rem;
		min-height: var(--control-height-md);
		cursor: pointer;
		font-family: inherit;
		font-size: var(--font-size-small);
		color: var(--foreground);
		user-select: none;
		--accent: var(--primary);
	}

	label.is-sm { min-height: var(--control-height-sm); }
	label.is-lg { min-height: var(--control-height-lg); }

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
		/* The track is a channel the knob slides along — carved, not raised.
		   Inert in the flat themes. */
		background: var(--material-surface);
		box-shadow: var(--elevation-carved);
		box-sizing: border-box;
		transition:
			background-color var(--motion-fast) var(--ease-enter),
			border-color var(--motion-fast) var(--ease-enter);
	}

	label.is-sm .track {
		width: 2.125rem;
		height: 1.2rem;
	}
	label.is-lg .track {
		width: 3rem;
		height: 1.625rem;
	}

	label:hover .track {
		border-color: color-mix(in oklch, var(--foreground) 40%, transparent);
	}

	.track.is-on {
		--emissive-color: var(--accent);
		background: var(--material-tone), var(--accent);
		box-shadow: var(--elevation-carved), var(--emissive-tone);
		border-color: var(--accent);
	}

	/* The knob is the one part of a switch that is unambiguously an object
	   sitting on top of something else, so it takes the raised stack. */
	.knob {
		width: calc(1.375rem - 6px);
		height: calc(1.375rem - 6px);
		border-radius: 999px;
		background: var(--muted-foreground);
		transition:
			transform var(--motion-fast) var(--ease-enter),
			background-color var(--motion-fast) var(--ease-enter);
	}

	label.is-sm .knob {
		width: calc(1.2rem - 6px);
		height: calc(1.2rem - 6px);
	}
	label.is-lg .knob {
		width: calc(1.625rem - 6px);
		height: calc(1.625rem - 6px);
	}

	.track.is-on .knob {
		background: var(--primary-foreground);
		transform: translateX(calc(2.5rem - 1.375rem));
	}
	label.is-sm .track.is-on .knob {
		transform: translateX(calc(2.125rem - 1.2rem));
	}
	label.is-lg .track.is-on .knob {
		transform: translateX(calc(3rem - 1.625rem));
	}

	input {
		position: absolute;
		inset: 0;
		z-index: 1;
		opacity: 0;
		width: 100%;
		height: 100%;
		margin: 0;
		cursor: inherit;
	}

	input:focus-visible + .track {
		outline: 3px solid var(--focus-ring);
		outline-offset: 2px;
	}
`

const resolveSizeClass = (props: any): string => {
	if (props.size === 'sm') return 'is-sm'
	if (props.size === 'lg') return 'is-lg'
	return 'is-md'
}

export const ZSwitch = c(
	(props) => {
		const host = useHost()
		const accessibleName = useAccessibleName(props.label)
		const inputRef = useRef<HTMLInputElement>()
		const [isChecked, setIsChecked] = useProp<boolean>('isChecked')
		const defaultChecked = useRef(Boolean(isChecked))
		// Submits like a checkbox: `value` (or "on") while on, nothing while off.
		const { isFormDisabled } = useFormControl({
			value: isChecked ? (props.value ?? 'on') : null,
			isDisabled: props.isDisabled,
			control: inputRef,
			onReset: () => setIsChecked(defaultChecked.current),
			onRestore: (state) => setIsChecked(state != null && state !== '')
		})
		const isDisabled = props.isDisabled || isFormDisabled

		const labelClass = ['label', resolveSizeClass(props)]
			.concat(isDisabled ? ['is-disabled'] : [])
			.join(' ')

		const trackClass = ['track'].concat(isChecked ? ['is-on'] : []).join(' ')
		const handleClick = () => {
			if (isDisabled) return
			const next = !isChecked
			setIsChecked(next)
			props.change({ checked: next, value: props.value })
		}

		return (
			<host shadowDom={{ delegatesFocus: true }} onclick={(e: MouseEvent) => {
				// Preserve host.click(), while native label activation owns user clicks.
				if (e.composedPath()[0] === host.current) handleClick()
			}}>
				<label class={labelClass}>
					<input
						ref={inputRef}
						type="checkbox"
						role="switch"
						checked={isChecked}
						value={props.value}
						disabled={isDisabled}
						required={props.isRequired}
						aria-label={accessibleName}
						aria-describedby={describedBy(props.description, props.error)}
						aria-invalid={props.error ? 'true' : undefined}
						aria-checked={isChecked ? 'true' : 'false'}
						onchange={(changeEvent: Event) => {
							changeEvent.stopPropagation()
							if (isDisabled) return
							const next = (changeEvent.target as HTMLInputElement).checked
							setIsChecked(next)
							props.change({ checked: next, value: props.value })
						}}
					/>
					<span class={trackClass} aria-hidden="true">
						<span class="knob"></span>
					</span>
					<slot />
				</label>
				{renderDescriptions(props.description, props.error)}
			</host>
		)
	},
	{
		props: {
			...describableProps,
			isChecked: { type: Boolean, reflect: true },
			isRequired: { type: Boolean, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			isFullWidth: { type: Boolean, reflect: true },
			size: { type: oneOf('sm', 'md', 'lg'), reflect: true },
			tone: { type: oneOf('neutral', 'primary', 'secondary'), reflect: true },
			name: { type: String, reflect: true },
			value: String,
			label: String,
			change: event<{ checked: boolean; value?: string }>({ bubbles: true, composed: true })
		},
		styles: [styles, interactionStyles, srOnlyStyles],
		form: true
	}
)

defineFormElement('z-switch', ZSwitch)
