import { c, css, event } from 'atomico'

/*
 * z-attachment-chip — a staged file in the composer before send: a thumbnail (or
 * type icon), the file name and size, and a remove (×) button. An optional
 * `progress` (0–100) shows an upload bar. Emits `remove` {value}.
 *
 *   <z-attachment-chip name="brief.pdf" size="248000" type="application/pdf"></z-attachment-chip>
 */
const fmtSize = (raw: unknown): string => {
	if (raw == null || raw === '') return ''
	const n = Number(raw)
	if (Number.isNaN(n)) return String(raw)
	if (n < 1024) return `${n} B`
	if (n < 1024 * 1024) return `${(n / 1024).toFixed(1).replace(/\.0$/, '')} KB`
	return `${(n / (1024 * 1024)).toFixed(1).replace(/\.0$/, '')} MB`
}

const styles = css`
	:host {
		display: inline-block;
		vertical-align: top;
	}
	:host([is-hidden]) {
		display: none;
	}
	.chip {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		max-width: 15rem;
		box-sizing: border-box;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--card);
		padding: 0.375rem 0.5rem;
		overflow: hidden;
	}
	.thumb {
		flex: 0 0 auto;
		width: 2rem;
		height: 2rem;
		border-radius: var(--radius-sm);
		object-fit: cover;
		background: color-mix(in oklch, var(--foreground) 8%, transparent);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--muted-foreground);
	}
	.thumb svg {
		width: 1.1rem;
		height: 1.1rem;
		stroke: currentColor;
		fill: none;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.meta {
		min-width: 0;
	}
	.name {
		font-size: 0.8125rem;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.size {
		font-size: 0.6875rem;
		color: var(--muted-foreground);
	}
	.remove {
		flex: 0 0 auto;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		border: none;
		border-radius: 999px;
		background: color-mix(in oklch, var(--foreground) 10%, transparent);
		color: var(--foreground);
		cursor: pointer;
		padding: 0;
	}
	.remove svg {
		width: 0.7rem;
		height: 0.7rem;
		stroke: currentColor;
		stroke-width: 2.5;
		stroke-linecap: round;
		fill: none;
	}
	.progress {
		position: absolute;
		left: 0;
		bottom: 0;
		height: 2px;
		background: var(--primary);
		transition: width 0.2s ease;
	}
`

export const ZAttachmentChip = c(
	(props) => {
		const isImage = props.thumbnail || (props.type as string)?.startsWith('image/')
		const progress = props.progress as number | undefined

		return (
			<host shadowDom>
				<div class="chip">
					{props.thumbnail ? (
						<img class="thumb" src={props.thumbnail} alt={props.name} />
					) : (
						<span class="thumb" aria-hidden="true">
							<svg viewBox="0 0 24 24">
								{isImage ? (
									<>
										<rect x="3" y="3" width="18" height="18" rx="2" />
										<circle cx="8.5" cy="8.5" r="1.5" />
										<path d="M21 15l-5-5L5 21" />
									</>
								) : (
									<>
										<path d="M14 3v5h5" />
										<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
									</>
								)}
							</svg>
						</span>
					)}
					<div class="meta">
						<div class="name">{props.name}</div>
						{fmtSize(props.size) && <div class="size">{fmtSize(props.size)}</div>}
					</div>
					<button class="remove" type="button" aria-label="Remove" onclick={() => props.remove({ value: props.value })}>
						<svg viewBox="0 0 12 12"><path d="M3 3l6 6M9 3l-6 6" /></svg>
					</button>
					{progress != null && progress < 100 && <span class="progress" style={{ width: `${progress}%` }} />}
				</div>
			</host>
		)
	},
	{
		props: {
			name: { type: String, reflect: true },
			size: { type: String, reflect: true },
			type: { type: String, reflect: true },
			thumbnail: { type: String, reflect: true },
			value: { type: String, reflect: true },
			progress: { type: Number, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			remove: event<{ value?: string }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-attachment-chip', ZAttachmentChip)
