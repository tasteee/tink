import { interactionStyles } from '../shared/interaction-styles'
import { defineFormElement, useFormControl } from '../shared/form-control'
import { describableProps, describedBy, renderDescriptions, srOnlyStyles, useAccessibleName } from '../shared/accessible'
import { c, css, event, useHost, useProp, useRef } from 'atomico'
import { oneOf } from '../shared/prop-types'

/*
 * z-checkbox, square control. Unchecked is a hairline outline; checked fills
 * with the accent and reveals a stroked checkmark.
 * Optional slotted label sits to the right and is fully clickable.
 */
const styles = css`
	:host {
		display: inline-flex;
	}

	:host([is-hidden]) {
		display: none;
	}

	label {
		display: inline-flex;
		align-items: center;
		gap: 0.625rem;
		min-height: var(--control-height-md);
		cursor: pointer;
		font-family: inherit;
		font-size: var(--font-size-small);
		color: var(--foreground);
		user-select: none;
		-webkit-user-select: none;
		--accent: var(--primary);
	}

	label.is-sm { min-height: var(--control-height-sm); font-size: var(--font-size-caption); }
	label.is-md { font-size: var(--font-size-small); }
	label.is-lg { min-height: var(--control-height-lg); font-size: var(--font-size-body); }

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
		transition:
			border-color var(--motion-fast) var(--ease-enter),
			background-color var(--motion-fast) var(--ease-enter);
	}

	label.is-sm .box {
		width: 1rem;
		height: 1rem;
	}
	label.is-lg .box {
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

	.dash {
		width: 60%;
		height: 2px;
		border-radius: 1px;
		background: var(--primary-foreground);
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
		outline: 3px solid var(--focus-ring);
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
		transition:
			opacity var(--motion-fast) var(--ease-enter),
			transform var(--motion-fast) var(--ease-enter);
	}

	.box.is-checked .check {
		opacity: 1;
		transform: scale(1);
	}

`

const resolveSizeClass = (props: any): string => {
	if (props.size === 'sm') return 'is-sm'
	if (props.size === 'lg') return 'is-lg'
	return 'is-md'
}

export const ZCheckbox = c(
	(props) => {
		const host = useHost()
		const accessibleName = useAccessibleName(props.label)
		const inputRef = useRef<HTMLInputElement>()
		const [isChecked, setIsChecked] = useProp<boolean>('isChecked')
		const [isIndeterminate, setIsIndeterminate] = useProp<boolean>('isIndeterminate')
		const defaultChecked = useRef(Boolean(isChecked))
		// A checkbox contributes `value` (or the platform's "on") only while
		// checked; unchecked, it is absent from the FormData, as native.
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

		// Mixed wins over checked, as on a native checkbox.
		const isShownChecked = isChecked && !isIndeterminate
		const boxStateClass = isIndeterminate ? 'is-indeterminate' : isShownChecked ? 'is-checked' : ''
		const boxClass = ['box', boxStateClass].join(' ').trim()
		const ariaChecked = isIndeterminate ? 'mixed' : isChecked ? 'true' : 'false'
		const boxMark = isIndeterminate ? (
			<span class="dash"></span>
		) : (
			<svg class="check" viewBox="0 0 24 24">
				<polyline points="4 12 10 18 20 6" />
			</svg>
		)

		return (
			<host shadowDom={{ delegatesFocus: true }}>
				<label class={labelClass}>
					<input
						ref={inputRef}
						type="checkbox"
						checked={isChecked}
						value={props.value}
						disabled={isDisabled}
						required={props.isRequired}
						aria-label={accessibleName}
						aria-describedby={describedBy(props.description, props.error)}
						aria-invalid={props.error ? 'true' : undefined}
						indeterminate={Boolean(isIndeterminate)}
						aria-checked={ariaChecked}
						onchange={(changeEvent: Event) => {
							changeEvent.stopPropagation()
							const next = !isChecked
							// A click resolves the mixed state, as the platform does.
							setIsIndeterminate(false)
							setIsChecked(next)
							props.change({ checked: next, value: props.value })
						}}
					/>
					<span class={boxClass} aria-hidden="true">
						{boxMark}
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
			isIndeterminate: { type: Boolean, reflect: true },
			isRequired: { type: Boolean, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
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

defineFormElement('z-checkbox', ZCheckbox)
