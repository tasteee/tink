import { c, css, event, useHost } from 'atomico'

/*
 * z-attachment-tray — the strip of staged z-attachment-chip children above the
 * composer, doubling as a file drop/browse target (composes z-dropzone). Drop or
 * pick files and it emits `files` {files}; validation rejects surface as
 * `reject` {files, reason}.
 *
 *   <z-attachment-tray accept="image/*,.pdf" multiple>
 *     <z-attachment-chip name="brief.pdf" size="248000"></z-attachment-chip>
 *   </z-attachment-tray>
 */
const styles = css`
	:host {
		display: block;
	}
	:host([is-hidden]) {
		display: none;
	}
	z-dropzone {
		--pad: 0.5rem;
	}
	.tray {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
	}
	.add {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.8125rem;
		color: var(--muted-foreground);
	}
	.add svg {
		width: 1rem;
		height: 1rem;
		stroke: currentColor;
		fill: none;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
`

export const ZAttachmentTray = c(
	(props) => {
		const host = useHost()
		const hasChips = () => (host.current as HTMLElement).querySelector('z-attachment-chip') != null

		return (
			<host shadowDom>
				<z-dropzone
					accept={props.accept}
					multiple={props.multiple}
					max-size={props.maxSize}
					max-files={props.maxFiles}
					ondrop={(e: any) => props.files({ files: e.detail?.files ?? [] })}
					onreject={(e: any) => props.reject({ files: e.detail?.files ?? [], reason: e.detail?.reason })}
				>
					<div class="tray">
						<slot />
						<span class="add">
							<svg viewBox="0 0 24 24" aria-hidden="true">
								<path d="M12 5v14M5 12h14" />
							</svg>
							{hasChips() ? 'Add more' : 'Add files or drop here'}
						</span>
					</div>
				</z-dropzone>
			</host>
		)
	},
	{
		props: {
			accept: { type: String, reflect: true },
			multiple: { type: Boolean, reflect: true },
			maxSize: { type: Number, reflect: true },
			maxFiles: { type: Number, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			files: event<{ files: File[] }>({ bubbles: true, composed: true }),
			reject: event<{ files: File[]; reason?: string }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-attachment-tray', ZAttachmentTray)
