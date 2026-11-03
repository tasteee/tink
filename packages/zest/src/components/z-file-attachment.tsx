import { defineElement } from '../shared/define-element'
import { c, css } from 'atomico'

/*
 * z-file-attachment, a sent file inside a message bubble: a type icon, the file
 * name and size, and a download affordance (an anchor when `href` is set).
 *
 *   <z-file-attachment name="proposal.pdf" size="248000" href="/files/proposal.pdf"></z-file-attachment>
 */
// Icon per `type`. Unknown/absent types fall back to the generic document page.
const ICONS: Record<string, any> = {
	image: (
		<>
			<rect x="3" y="3" width="18" height="18" rx="2" />
			<circle cx="9" cy="9" r="2" />
			<path d="M21 15l-5-5L5 21" />
		</>
	),
	video: (
		<>
			<rect x="2" y="4" width="15" height="16" rx="2" />
			<path d="M17 9l5-3v12l-5-3" />
		</>
	),
	audio: (
		<>
			<path d="M9 18V5l12-2v13" />
			<circle cx="6" cy="18" r="3" />
			<circle cx="18" cy="16" r="3" />
		</>
	),
	archive: (
		<>
			<rect x="3" y="4" width="18" height="16" rx="2" />
			<path d="M3 9h18" />
			<path d="M10 13h4" />
		</>
	),
	sheet: (
		<>
			<rect x="3" y="3" width="18" height="18" rx="2" />
			<path d="M3 9h18M3 15h18M9 3v18" />
		</>
	),
	code: (
		<>
			<path d="M9 9l-3 3 3 3" />
			<path d="M15 9l3 3-3 3" />
		</>
	),
	document: (
		<>
			<path d="M14 3v5h5" />
			<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
		</>
	)
}

// Accepts a real MIME type ("image/png", "application/zip", …) or one of the
// short category names above ("image", "archive", …) — whichever the caller
// has on hand.
const resolveIcon = (type: unknown): any => {
	const raw = String(type ?? '').toLowerCase()
	if (!raw) return ICONS.document
	if (ICONS[raw]) return ICONS[raw]

	const category = raw.split('/')[0]
	if (category === 'image' || category === 'video' || category === 'audio') return ICONS[category]
	if (/zip|compressed|tar|gzip|7z|rar/.test(raw)) return ICONS.archive
	if (/sheet|csv|excel/.test(raw)) return ICONS.sheet
	if (/json|javascript|typescript|xml|code/.test(raw)) return ICONS.code
	return ICONS.document
}

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
		display: block;
	}
	:host([is-hidden]) {
		display: none;
	}
	.file {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		min-width: 12rem;
		max-width: 20rem;
		box-sizing: border-box;
		border-radius: var(--radius-md);
		background: color-mix(in oklch, var(--foreground) 6%, transparent);
		padding: 0.5rem 0.625rem;
	}
	.icon {
		flex: 0 0 auto;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: var(--radius-sm);
		background: color-mix(in oklch, var(--primary) 16%, transparent);
		color: var(--primary);
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}
	.icon svg {
		width: 1.25rem;
		height: 1.25rem;
		stroke: currentColor;
		fill: none;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.meta {
		flex: 1;
		min-width: 0;
	}
	.name {
		font-size: 0.875rem;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.size {
		font-size: 0.6875rem;
		color: var(--muted-foreground);
	}
	.download {
		flex: 0 0 auto;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 999px;
		border: none;
		background: transparent;
		color: var(--muted-foreground);
		cursor: pointer;
		text-decoration: none;
	}
	.download:hover {
		background: color-mix(in oklch, var(--foreground) 10%, transparent);
		color: var(--foreground);
	}
	.download svg {
		width: 1.1rem;
		height: 1.1rem;
		stroke: currentColor;
		fill: none;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
`

export const ZFileAttachment = c(
	(props) => (
		<host shadowDom>
			<div class="file">
				<span class="icon" aria-hidden="true">
					<svg viewBox="0 0 24 24">{resolveIcon(props.type)}</svg>
				</span>
				<div class="meta">
					<div class="name">{props.name}</div>
					{fmtSize(props.size) && <div class="size">{fmtSize(props.size)}</div>}
				</div>
				<a
					class="download"
					href={props.href || '#'}
					download={props.name || ''}
					aria-label={`Download ${props.name || 'file'}`}
				>
					<svg viewBox="0 0 24 24">
						<path d="M12 4v12M6 12l6 6 6-6" />
						<path d="M4 20h16" />
					</svg>
				</a>
			</div>
		</host>
	),
	{
		props: {
			name: { type: String, reflect: true },
			size: { type: String, reflect: true },
			type: { type: String, reflect: true },
			href: { type: String, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

defineElement('z-file-attachment', ZFileAttachment)
