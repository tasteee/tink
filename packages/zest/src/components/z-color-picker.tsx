import { c, css, event, useProp, useState, useHost, useEffect } from 'atomico'

/*
 * z-color-picker: a swatch trigger that opens a bordered, shadow-free panel
 * holding a custom saturation/brightness area, a hue slider, a hex field, and
 * a row of preset swatches (the zest palette by default). value is a hex
 * string like #BF40BF. The spectrum is drawn here, not with the native color
 * input, so the picker stays on-theme instead of opening the OS popup.
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

	.area {
		position: relative;
		width: 100%;
		height: 8.5rem;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
		cursor: crosshair;
		touch-action: none;
		outline: none;
		background:
			linear-gradient(to top, #000, transparent),
			linear-gradient(to right, #fff, var(--hue-color));
	}
	.area:focus-visible,
	.hue:focus-visible {
		outline: 2px solid color-mix(in oklch, var(--ring) 60%, transparent);
		outline-offset: 2px;
	}

	.hue {
		position: relative;
		width: 100%;
		height: 0.75rem;
		border-radius: 999px;
		border: 1px solid var(--border);
		cursor: pointer;
		touch-action: none;
		outline: none;
		background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);
	}

	.thumb {
		position: absolute;
		width: 0.875rem;
		height: 0.875rem;
		border-radius: 999px;
		border: 2px solid #fff;
		background: transparent;
		outline: 1px solid rgb(0 0 0 / 0.5);
		transform: translate(-50%, -50%);
		pointer-events: none;
	}
	.hue .thumb {
		top: 50%;
		background: var(--hue-color);
		width: 1rem;
		height: 1rem;
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

type Hsv = { h: number; s: number; v: number }

const clamp = (n: number, min: number, max: number): number => Math.min(max, Math.max(min, n))

const hexToHsv = (hex: string): Hsv => {
	const value = normalizeHex(hex).slice(1)
	const r = parseInt(value.slice(0, 2), 16) / 255
	const g = parseInt(value.slice(2, 4), 16) / 255
	const b = parseInt(value.slice(4, 6), 16) / 255
	const max = Math.max(r, g, b)
	const delta = max - Math.min(r, g, b)
	let h = 0
	if (delta !== 0) {
		if (max === r) h = ((g - b) / delta) % 6
		else if (max === g) h = (b - r) / delta + 2
		else h = (r - g) / delta + 4
	}
	return { h: (h * 60 + 360) % 360, s: max === 0 ? 0 : delta / max, v: max }
}

const hsvToHex = ({ h, s, v }: Hsv): string => {
	const channel = (n: number): string => {
		const k = (n + h / 60) % 6
		const value = v - v * s * Math.max(0, Math.min(k, 4 - k, 1))
		return Math.round(value * 255).toString(16).padStart(2, '0')
	}
	return `#${channel(5)}${channel(3)}${channel(1)}`.toUpperCase()
}

const isValidHex = (raw: string): boolean => /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(raw.trim())

export const ZColorPicker = c(
	(props) => {
		const host = useHost()
		const [value, setValue] = useProp<string>('value')
		const [isOpen, setIsOpen] = useState(false)

		const current = value || '#BF40BF'
		const presets: string[] = Array.isArray(props.presets) ? (props.presets as string[]) : DEFAULT_PRESETS

		useEffect(() => {
			if (!isOpen) return
			const onDocumentPointerDown = (e: Event) => {
				if (!e.composedPath().includes(host.current as EventTarget)) setIsOpen(false)
			}
			document.addEventListener('pointerdown', onDocumentPointerDown)
			return () => document.removeEventListener('pointerdown', onDocumentPointerDown)
		}, [isOpen])

		// Hue is tracked separately: grays and blacks have no hue of their own, so
		// deriving it from the hex alone would snap the slider to red mid-drag.
		const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(current))
		const derived = hexToHsv(current)
		const synced = hsvToHex(hsv) === current.toUpperCase() ? hsv : derived

		const apply = (hex: string) => {
			setValue(hex)
			props.change({ value: hex })
		}

		const applyHsv = (next: Hsv) => {
			setHsv(next)
			apply(hsvToHex(next))
		}

		const dragArea = (pointerEvent: PointerEvent) => {
			const rect = (pointerEvent.currentTarget as HTMLElement).getBoundingClientRect()
			const s = clamp((pointerEvent.clientX - rect.left) / rect.width, 0, 1)
			const v = 1 - clamp((pointerEvent.clientY - rect.top) / rect.height, 0, 1)
			applyHsv({ h: synced.h, s, v })
		}

		const dragHue = (pointerEvent: PointerEvent) => {
			const rect = (pointerEvent.currentTarget as HTMLElement).getBoundingClientRect()
			const h = clamp((pointerEvent.clientX - rect.left) / rect.width, 0, 1) * 360
			applyHsv({ ...synced, h })
		}

		const onDragStart = (move: (pointerEvent: PointerEvent) => void) => (pointerEvent: PointerEvent) => {
			;(pointerEvent.currentTarget as HTMLElement).setPointerCapture(pointerEvent.pointerId)
			move(pointerEvent)
		}

		const onDragMove = (move: (pointerEvent: PointerEvent) => void) => (pointerEvent: PointerEvent) => {
			if ((pointerEvent.currentTarget as HTMLElement).hasPointerCapture(pointerEvent.pointerId)) move(pointerEvent)
		}

		const onAreaKey = (keyEvent: KeyboardEvent) => {
			const step = keyEvent.shiftKey ? 0.1 : 0.02
			const delta: Record<string, [number, number]> = {
				ArrowLeft: [-step, 0],
				ArrowRight: [step, 0],
				ArrowUp: [0, step],
				ArrowDown: [0, -step]
			}
			const move = delta[keyEvent.key]
			if (!move) return
			keyEvent.preventDefault()
			applyHsv({ h: synced.h, s: clamp(synced.s + move[0], 0, 1), v: clamp(synced.v + move[1], 0, 1) })
		}

		const onHueKey = (keyEvent: KeyboardEvent) => {
			const step = keyEvent.shiftKey ? 15 : 3
			const delta: Record<string, number> = { ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step }
			if (!(keyEvent.key in delta)) return
			keyEvent.preventDefault()
			applyHsv({ ...synced, h: clamp(synced.h + delta[keyEvent.key], 0, 360) })
		}

		const hueColor = hsvToHex({ h: synced.h, s: 1, v: 1 })

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
						<div
							class="area"
							style={{ '--hue-color': hueColor }}
							role="slider"
							tabindex="0"
							aria-label="Saturation and brightness"
							aria-valuetext={`Saturation ${Math.round(synced.s * 100)}%, brightness ${Math.round(synced.v * 100)}%`}
							onpointerdown={onDragStart(dragArea)}
							onpointermove={onDragMove(dragArea)}
							onkeydown={onAreaKey}
						>
							<span class="thumb" style={{ left: `${synced.s * 100}%`, top: `${(1 - synced.v) * 100}%` }}></span>
						</div>
						<div
							class="hue"
							style={{ '--hue-color': hueColor }}
							role="slider"
							tabindex="0"
							aria-label="Hue"
							aria-valuemin="0"
							aria-valuemax="360"
							aria-valuenow={Math.round(synced.h)}
							onpointerdown={onDragStart(dragHue)}
							onpointermove={onDragMove(dragHue)}
							onkeydown={onHueKey}
						>
							<span class="thumb" style={{ left: `${(synced.h / 360) * 100}%` }}></span>
						</div>
						<div class="hex-row">
							<span class="hash">#</span>
							<input
								class="hex-input"
								type="text"
								value={current.replace(/^#/, '').toUpperCase()}
								maxlength={6}
								onchange={(e: any) => {
									if (!isValidHex(e.target.value)) {
										e.target.value = current.replace(/^#/, '')
										return
									}
									const hex = normalizeHex(e.target.value)
									setHsv(hexToHsv(hex))
									apply(hex)
								}}
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
									onclick={() => {
										setHsv(hexToHsv(hex))
										apply(hex.toUpperCase())
									}}
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
