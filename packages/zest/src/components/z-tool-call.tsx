import { c, css } from 'atomico'

/*
 * z-tool-call — an expandable card for an agent tool invocation: the tool name,
 * a run status (running / success / error), the call arguments, and the result.
 * Composes z-collapsible for disclosure and z-code-block for args/result.
 *
 *   <z-tool-call name="search_web" status="success"
 *     args='{ "query": "zest web components" }'
 *     result="3 results found">
 *   </z-tool-call>
 *
 * `args` renders as JSON; pass `result` (string) or slot [slot="result"] for
 * richer output. `status` drives the indicator.
 */
const styles = css`
	:host {
		display: block;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: color-mix(in oklch, var(--foreground) 3%, var(--card));
		overflow: hidden;
	}
	:host([is-hidden]) {
		display: none;
	}
	z-collapsible {
		padding: 0 0.75rem;
	}
	.head {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 0;
		font-size: 0.875rem;
	}
	.tool {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
		color: var(--muted-foreground);
	}
	.name {
		font-family: var(--font-mono);
		font-weight: 600;
		color: var(--foreground);
	}
	.status {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.75rem;
		text-transform: capitalize;
		color: var(--muted-foreground);
	}
	.dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 999px;
		background: var(--muted-foreground);
	}
	.status.is-running .dot {
		background: var(--warning);
		animation: pulse 1.2s ease-in-out infinite;
	}
	.status.is-success .dot {
		background: var(--success);
	}
	.status.is-error .dot {
		background: var(--destructive);
	}
	.status.is-error {
		color: var(--destructive);
	}
	@keyframes pulse {
		50% {
			opacity: 0.35;
		}
	}
	.body {
		padding-bottom: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}
	.section-label {
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--muted-foreground);
		margin-bottom: 0.3rem;
	}
`

export const ZToolCall = c(
	(props) => {
		const status = (props.status as string) || 'running'

		return (
			<host shadowDom>
				<z-collapsible is-open={props.isExpanded}>
					<div slot="trigger" class="head">
						<svg class="tool" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 1 5.4-5.4l-2.6 2.6-2-2 2.6-2.6z" />
						</svg>
						<span class="name">{props.name || 'tool'}</span>
						<span class={`status is-${status}`}>
							<span class="dot" aria-hidden="true"></span>
							{status}
						</span>
					</div>
					<div class="body">
						{props.args && (
							<div>
								<div class="section-label">Arguments</div>
								<z-code-block code={props.args} language="json" hide-copy />
							</div>
						)}
						<div>
							<div class="section-label">Result</div>
							{props.result ? (
								<z-code-block code={props.result} language={props.resultLanguage} hide-copy />
							) : (
								<slot name="result" />
							)}
						</div>
					</div>
				</z-collapsible>
			</host>
		)
	},
	{
		props: {
			name: { type: String, reflect: true },
			status: { type: String, reflect: true },
			args: { type: String },
			result: { type: String },
			resultLanguage: { type: String, reflect: true },
			isExpanded: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-tool-call', ZToolCall)
