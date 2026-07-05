import { c, css } from 'atomico'

/*
 * z-read-receipt — a row of small overlapping avatars showing who has seen a
 * message, with an optional "+N" overflow and a leading label. Data-driven:
 *
 *   el.avatars = [{ name: 'Bob', src }, { name: 'Priya' }, …]
 *
 * Shows up to `max` (default 3) avatars, then "+N". Composes z-avatar.
 */
type Person = { name?: string; src?: string }

const styles = css`
	:host {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		vertical-align: middle;
	}
	:host([is-hidden]) {
		display: none;
	}
	.label {
		font-size: 0.6875rem;
		color: var(--muted-foreground);
	}
	.stack {
		display: inline-flex;
		align-items: center;
	}
	.stack z-avatar {
		margin-left: -0.375rem;
	}
	.stack z-avatar:first-child {
		margin-left: 0;
	}
	.more {
		margin-left: 0.25rem;
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--muted-foreground);
	}
`

export const ZReadReceipt = c(
	(props) => {
		const people: Person[] = Array.isArray(props.avatars) ? (props.avatars as Person[]) : []
		const max = (props.max as number) || 3
		const shown = people.slice(0, max)
		const extra = people.length - shown.length

		return (
			<host shadowDom>
				{props.label && <span class="label">{props.label}</span>}
				<span class="stack">
					{shown.map((p, i) => (
						<z-avatar key={i} size="xs" name={p.name} src={p.src} />
					))}
				</span>
				{extra > 0 && <span class="more">+{extra}</span>}
			</host>
		)
	},
	{
		props: {
			avatars: { type: Array },
			max: { type: Number, reflect: true },
			label: { type: String, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-read-receipt', ZReadReceipt)
