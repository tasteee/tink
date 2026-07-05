import { c, css, event, useHost, useRef, useState } from 'atomico'

/*
 * z-dropzone — a file drop area with click-to-browse and validation. Unlike the
 * pointer-based z-drag-drop engine, this uses the native HTML5 drag events on
 * purpose, since that's the only way to receive files dragged in from the OS.
 * Files are validated against `accept` / `max-size` / `max-files` / `multiple`
 * before `drop` fires; anything rejected comes back on `reject` with a reason.
 *
 *   <z-dropzone accept="image/*,.pdf" multiple max-size="5000000"
 *     @drop=${e => …e.detail.files}></z-dropzone>
 *
 * Style the drag state via the reflected `data-state` attribute (`over`/`reject`)
 * or the exposed parts. Slot custom content, or use the default dashed well.
 */
const styles = css`
	:host {
		display: block;
	}
	.zone {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 2rem 1.5rem;
		text-align: center;
		border: 1.5px dashed var(--border);
		border-radius: var(--radius-lg);
		background: var(--paper);
		color: var(--muted-foreground);
		cursor: pointer;
		transition:
			border-color var(--duration-fast) var(--easing-standard),
			background var(--duration-fast) var(--easing-standard);
	}
	:host([data-state='over']) .zone {
		border-color: var(--purple);
		background: color-mix(in oklch, var(--purple) 10%, transparent);
		color: var(--foreground);
	}
	:host([data-state='reject']) .zone {
		border-color: var(--destructive);
		background: color-mix(in oklch, var(--destructive) 10%, transparent);
	}
	:host([is-disabled]) .zone {
		opacity: 0.5;
		pointer-events: none;
	}
	input {
		display: none;
	}
	.hint {
		font-size: var(--font-size-caption);
	}
`

const matchesAccept = (file: File, accept: string): boolean => {
	const tokens = accept
		.split(',')
		.map((t) => t.trim().toLowerCase())
		.filter(Boolean)
	if (!tokens.length) return true
	const name = file.name.toLowerCase()
	const mime = file.type.toLowerCase()
	return tokens.some((tok) => {
		if (tok.startsWith('.')) return name.endsWith(tok)
		if (tok.endsWith('/*')) return mime.startsWith(tok.slice(0, -1))
		return mime === tok
	})
}

export const ZDropzone = c(
	(props) => {
		const host = useHost()
		const inputRef = useRef<HTMLInputElement>()
		const [depth, setDepth] = useState(0)

		const setState = (v: string | null) => {
			const el = host.current as HTMLElement
			if (v) el.setAttribute('data-state', v)
			else el.removeAttribute('data-state')
		}

		const validate = (fileList: FileList | File[]): { files: File[]; reason?: string } => {
			let files = [...fileList]
			const accept = (props.accept as string) || ''
			if (accept) {
				const bad = files.find((f) => !matchesAccept(f, accept))
				if (bad) return { files: [], reason: `“${bad.name}” is not an accepted type` }
			}
			if (props.maxSize) {
				const big = files.find((f) => f.size > (props.maxSize as number))
				if (big) return { files: [], reason: `“${big.name}” exceeds the size limit` }
			}
			if (!props.multiple) files = files.slice(0, 1)
			if (props.maxFiles && files.length > (props.maxFiles as number))
				return { files: [], reason: `Too many files (max ${props.maxFiles})` }
			return { files }
		}

		const commit = (fileList: FileList | File[]) => {
			const { files, reason } = validate(fileList)
			if (reason) props.reject({ files: [...fileList], reason })
			else props.drop({ files })
		}

		const onDragEnter = (e: DragEvent) => {
			e.preventDefault()
			if (props.isDisabled) return
			setDepth((d) => d + 1)
			// dataTransfer.items types aren't file contents yet, so optimistically show "over"
			setState('over')
		}
		const onDragOver = (e: DragEvent) => {
			e.preventDefault()
		}
		const onDragLeave = (e: DragEvent) => {
			e.preventDefault()
			setDepth((d) => {
				const next = d - 1
				if (next <= 0) setState(null)
				return Math.max(0, next)
			})
		}
		const onDrop = (e: DragEvent) => {
			e.preventDefault()
			setDepth(0)
			setState(null)
			if (props.isDisabled) return
			if (e.dataTransfer?.files?.length) commit(e.dataTransfer.files)
		}

		const openPicker = () => {
			if (props.isDisabled) return
			inputRef.current?.click()
		}
		const onPick = (e: Event) => {
			const input = e.target as HTMLInputElement
			if (input.files?.length) commit(input.files)
			input.value = ''
		}

		return (
			<host
				shadowDom
				ondragenter={onDragEnter}
				ondragover={onDragOver}
				ondragleave={onDragLeave}
				ondrop={onDrop}
			>
				<div class="zone" part="zone" onclick={openPicker}>
					<slot>
						<span>Drop files here or click to browse</span>
						{props.accept && <span class="hint">{props.accept as string}</span>}
					</slot>
				</div>
				<input
					ref={inputRef}
					type="file"
					accept={(props.accept as string) || undefined}
					multiple={Boolean(props.multiple)}
					onchange={onPick}
				/>
			</host>
		)
	},
	{
		props: {
			accept: { type: String, reflect: true },
			multiple: { type: Boolean, reflect: true },
			maxSize: { type: Number, reflect: true },
			maxFiles: { type: Number, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			drop: event<{ files: File[] }>({ bubbles: true, composed: true }),
			reject: event<{ files: File[]; reason: string }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-dropzone', ZDropzone)
