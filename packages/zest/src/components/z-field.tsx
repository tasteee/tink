import { c, css, useEffect, useRef } from 'atomico'

/*
 * z-field — the standard visible label, guidance, and error treatment for a
 * single form control. It forwards its label to the slotted Zest control as an
 * accessible name, so custom-element shadow boundaries do not break labeling.
 */
const styles = css`
	:host { display: block; width: 100%; }
	.field { display: grid; gap: 0.5rem; }
	.header { display: flex; align-items: baseline; justify-content: space-between; gap: 0.75rem; }
	.label { color: var(--foreground); font-size: var(--font-size-small); font-weight: 600; line-height: 1.35; }
	.required { color: var(--destructive); }
	.description, .error { font-size: var(--font-size-small); line-height: 1.45; }
	.description { color: var(--muted-foreground); }
	.error { color: var(--destructive); }
	:host([is-label-hidden]) .header { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
`

export const ZField = c(
	(props) => {
		const slotRef = useRef<HTMLSlotElement>()
		const syncLabel = () => {
			const control = slotRef.current?.assignedElements({ flatten: true })[0] as HTMLElement | undefined
			if (!control || !props.label) return
			const alreadyNamed = control.hasAttribute('label') || control.hasAttribute('aria-label') || control.hasAttribute('aria-labelledby')
			if (!alreadyNamed) (control as HTMLElement & { label?: string }).label = props.label
		}

		useEffect(() => syncLabel(), [props.label])

		return (
			<host shadowDom>
				<div class="field">
					{props.label && <div class="header"><span class="label">{props.label}{props.isRequired && <span class="required" aria-hidden="true"> *</span>}</span></div>}
					<slot ref={slotRef} onslotchange={syncLabel} />
					{props.error ? <div class="error"><slot name="error">{props.error}</slot></div> : props.description ? <div class="description"><slot name="description">{props.description}</slot></div> : null}
				</div>
			</host>
		)
	},
	{
		props: {
			label: String,
			description: String,
			error: String,
			isRequired: { type: Boolean, reflect: true },
			isLabelHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-field', ZField)
