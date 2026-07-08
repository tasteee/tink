import { c, css, event } from 'atomico'

/*
 * z-citation — an inline citation marker for grounded AI answers: a small
 * superscript badge referencing a source. Renders an anchor when `href` is set,
 * otherwise a button that emits `activate` {index, href} (scroll to the matching
 * z-sources entry).
 *
 *   …the capital is Canberra<z-citation index="2"></z-citation>.
 */
const styles = css`
	:host {
		display: inline;
		vertical-align: baseline;
	}
	:host([is-hidden]) {
		display: none;
	}
	.cite {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.05em;
		height: 1.05em;
		padding: 0 0.3em;
		margin: 0 0.1em;
		box-sizing: border-box;
		border: none;
		border-radius: 0.35em;
		background: color-mix(in oklch, var(--primary) 16%, transparent);
		color: var(--primary);
		font-family: inherit;
		font-size: 0.7em;
		font-weight: 700;
		line-height: 1;
		vertical-align: super;
		cursor: pointer;
		text-decoration: none;
		transition: background-color 0.12s ease;
	}
	.cite:hover {
		background: color-mix(in oklch, var(--primary) 30%, transparent);
	}
`

export const ZCitation = c(
	(props) => {
		const label = props.label || String(props.index ?? '?')
		const onClick = (e: Event) => {
			if (!props.href) {
				e.preventDefault()
				props.activate({ index: Number(props.index) || 0, href: props.href })
			}
		}
		return (
			<host shadowDom>
				<a
					class="cite"
					href={props.href || '#'}
					target={props.href ? '_blank' : undefined}
					rel={props.href ? 'noopener noreferrer' : undefined}
					aria-label={`Citation ${label}`}
					onclick={onClick}
				>
					{label}
				</a>
			</host>
		)
	},
	{
		props: {
			index: { type: Number, reflect: true },
			label: { type: String, reflect: true },
			href: { type: String, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			activate: event<{ index: number; href?: string }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-citation', ZCitation)
