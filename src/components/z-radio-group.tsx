import { c, css, event, useHost, useListener, useProp } from 'atomico'

/*
 * z-radio-group — coordinates single-selection across slotted z-radio items.
 * Listens for the bubbling `select` event, clears every other radio, and
 * re-emits a `change` with the chosen value. Mirrors z-toggle-group's model.
 */
const styles = css`
	:host {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	:host([is-horizontal]) {
		flex-direction: row;
		gap: var(--space-lg);
	}

	:host([is-hidden]) {
		display: none;
	}
`

type SelectDetailT = { value?: string }
type RadioElementT = HTMLElement & { isChecked?: boolean; value?: string }

export const ZRadioGroup = c(
	(props) => {
		const host = useHost()
		const [value, setValue] = useProp<string>('value')

		useListener(
			host,
			'select',
			(rawEvent: unknown) => {
				const zEvent = rawEvent as CustomEvent<SelectDetailT>
				const target = zEvent.target as RadioElementT

				for (const item of host.current.querySelectorAll<RadioElementT>('z-radio')) {
					if (item !== target) item.isChecked = false
				}

				setValue(zEvent.detail.value)
				props.change({ value: zEvent.detail.value })
			},
			{ passive: true }
		)

		return (
			<host shadowDom role="radiogroup" aria-label={props.label}>
				<slot />
			</host>
		)
	},
	{
		props: {
			value: { type: String, reflect: true },
			label: String,
			isHorizontal: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			change: event<{ value?: string }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-radio-group', ZRadioGroup)
