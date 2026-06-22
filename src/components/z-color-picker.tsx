import { c, css, event, useProp, useState, useHost, useEffect } from 'atomico'

/*
 * z-color-picker — a swatch trigger that opens a bordered, shadow-free panel
 * holding the native spectrum picker, a hex field, and a row of preset
 * swatches (the zest palette by default). value is a hex string like #BF40BF.
 */
const styles = css`
	:host {
		display: inline-flex;
		position: relative;
		--accent: var(--primary);
	}

	:host([tone='primary']) {
		--accent: var(--purple);
	}

	:host([tone='secondary']) {
		--accent: var(--pink);
	}

	:host([is-hidden]) {
		display: none;
	}

	.trigger {
		display: inline-flex;
		align-items: center;
		gap: 0.625rem;
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		height: 2.75rem;
		padding-inline: 0.625rem 0.875rem;
		color: var(--foreground);
		font-family: var(--font-mono);
		font-size: var(--font-size-small);
		cursor: pointer;
		transition: border-color 0.12s ease;
	}

	.trigger:hover {
		border-color: color-mix(in oklch, var(--foreground) 30%, transparent);
	}

	.trigger.is-open {
		border-color: var(--accent);
	}

	.trigger:focus-visible {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: 2px;
	}

	.swatch {
		width: 1.25rem;
		height: 1.25rem;
		border-radius: var(--radius-sm);
		border: 1px solid color-mix(in oklch, var(--foreground) 25%, transparent);
		flex-shrink: 0;
	}

	.panel {
		position: absolute;
		top: calc(100% + 6px);
		left: 0;
		z-index: 50;
		width: 15rem;
		background: var(--popover);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.spectrum {
		width: 100%;
		height: 2.5rem;
		padding: 0;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: transparent;
		cursor: pointer;
	}
	.spectrum::-webkit-color-swatch-wrapper {
		padding: 3px;
	}
	.spectrum::-webkit-color-swatch {
		border: none;
		border-radius: 3px;
	}

	.hex-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding-inline: 0.5rem;
		height: 2.25rem;
	}
	.hex-row:focus-within {
		border-color: var(--accent);
	}
	.hash {
		color: var(--muted-foreground);
		font-family: var(--font-mono);
		font-size: var(--font-size-small);
	}
	.hex-input {
		flex: 1;
		min-width: 0;
		background: transparent;
		border: none;
		outline: none;
		color: var(--foreground);
		font-family: var(--font-mono);
		font-size: var(--font-size-small);
		text-transform: uppercase;
	}

	.presets {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		gap: 0.375rem;
	}
	.preset {
		aspect-ratio: 1;
		border-radius: 999px;
		border: 1px solid color-mix(in oklch, var(--foreground) 20%, transparent);
		cursor: pointer;
		padding: 0;
		transition: transform 0.1s ease;
	}
	.preset:hover {
		transform: scale(1.15);
	}
	.preset.is-selected {
		outline: 2px solid var(--primary);
		outline-offset: 1px;
	}
`

const DEFAULT_PRESETS = [
	'#FAFAFA',
	'#BF40BF',
	'#FF1493',
	'#FF3B30',
	'#A0A0A0',
	'#707070',
	'#2A2F2A',
	'#0A0F0A'
]

const normalizeHex = (raw: string): string => {
	let hex = raw.trim().replace(/^#/, '')
	if (/^[0-9a-fA-F]{3}$/.test(hex)) {
		hex = hex.split('').map((c) => c + c).join('')
	}
	return `#${hex.toUpperCase()}`
}

export const ZColorPicker = c(
	(props) => {
		const host = useHost()
		const [value, setValue] = useProp<string>('value')
		const [isOpen, setIsOpen] = useState(false)

		const current = value || '#BF40BF'
		const presets: string[] = Array.isArray(props.presets) ? (props.presets as string[]) : DEFAULT_PRESETS

		useEffect(() => {
			if (!isOpen) return
			const onDocClick = (e: Event) => {
				if (!host.current.contains(e.target as Node)) setIsOpen(false)
			}
			document.addEventListener('mousedown', onDocClick)
			return () => document.removeEventListener('mousedown', onDocClick)
		}, [isOpen])

		const apply = (hex: string) => {
			setValue(hex)
			props.change({ value: hex })
		}

		return (
			<host shadowDom>
				<button
					type="button"
					class={isOpen ? 'trigger is-open' : 'trigger'}
					disabled={props.isDisabled}
					aria-haspopup="dialog"
					aria-expanded={isOpen ? 'true' : 'false'}
					onclick={() => setIsOpen(!isOpen)}
				>
					<span class="swatch" style={{ background: current }}></span>
					<span>{current.toUpperCase()}</span>
				</button>

				{isOpen && (
					<div class="panel" role="dialog" aria-label="Choose color">
						<input
							class="spectrum"
							type="color"
							value={current}
							oninput={(e: any) => apply(e.target.value.toUpperCase())}
						/>
						<div class="hex-row">
							<span class="hash">#</span>
							<input
								class="hex-input"
								type="text"
								value={current.replace(/^#/, '')}
								maxlength={6}
								onchange={(e: any) => apply(normalizeHex(e.target.value))}
							/>
						</div>
						<div class="presets">
							{presets.map((hex) => (
								<button
									key={hex}
									type="button"
									class={hex.toUpperCase() === current.toUpperCase() ? 'preset is-selected' : 'preset'}
									style={{ background: hex }}
									aria-label={hex}
									onclick={() => apply(hex.toUpperCase())}
								></button>
							))}
						</div>
					</div>
				)}
			</host>
		)
	},
	{
		props: {
			value: { type: String, reflect: true },
			presets: { type: Array },
			tone: { type: String, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			change: event<{ value: string }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-color-picker', ZColorPicker)
