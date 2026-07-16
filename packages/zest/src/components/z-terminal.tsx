import { c, css, event, useState, useMemo, useEffect, useRef, useHost } from 'atomico'
import { themedScrollbarStyles } from '../shared/scrollbar-styles'

/*
 * z-terminal — a clean, chrome-styled terminal surface for command walkthroughs
 * (getting-started / install / CLI usage docs) where a plain code block reads too
 * "source file". Deliberately distinct from z-code-block: no line numbers, no
 * syntax highlighting, and a seamless header (no divider) so it feels like one
 * continuous window in the spirit of Hyper.
 *
 * The header shows a mock shell label + working directory on the left and three
 * traffic-light window dots on the right (where z-code-block puts its copy
 * button). Copying is per-line instead: hover a copyable line and a copy icon
 * appears on the right.
 *
 * Content comes in via the `code` property (whitespace preserved), one terminal
 * line per row. By default, lines that start with the `prompt` marker (default
 * `$`) are treated as commands: they're copyable and copying strips the marker so
 * you get `npm install`, not `$ npm install`. Override which lines are copyable
 * with `copy-lines`: `all`, `none`, `commands` (the default), or 1-based ranges
 * like `1-3,5`. Fires `copy` with the copied text after a successful copy.
 *
 * ── Animated simulation ──────────────────────────────────────────────────────
 * Add `animate` to play the content back like a live session: command lines type
 * out character-by-character (blinking caret), output lines fade in quickly, and
 * everything is staggered so only one line reveals at a time. Tune the feel with
 * `type-speed` (ms/char), `line-delay` (gap before each line), and
 * `fade-duration` (ms). `start-on-view` waits until the terminal scrolls into
 * view before playing; `prefers-reduced-motion` skips straight to the final
 * state. Fires `done` when the sequence finishes.
 *
 * Loop it with `loop` (auto-restart after `loop-delay` ms). A replay control
 * appears in the bottom-right once a run completes (suppress with `hide-replay`).
 * Imperative controls are exposed as methods: `.play()`, `.pause()`, `.restart()`.
 *
 * For per-line timing control, set the `lines` property to an array instead of
 * `code`. Each entry is a string (parsed like a `code` row) or an object:
 *   { text, type?: 'command' | 'output', delay?, typeSpeed?, fade? }
 * where `delay` is the pause before that line begins — so a slow step can hold
 * longer before the next one starts, rather than every gap being uniform.
 */
const styles = css`
	:host {
		display: block;
		--accent: var(--success);
	}

	:host([tone='secondary']) {
		--accent: var(--purple);
	}

	:host([is-hidden]) {
		display: none;
	}

	.window {
		position: relative;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--color-neutral-0);
		overflow: hidden;
		font-family: var(--font-mono);
	}

	/* Seamless header — same surface as the body, no divider (Hyper-clean). */
	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.625rem 0.875rem 0.25rem 0.875rem;
		user-select: none;
	}

	.meta {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		min-width: 0;
		font-size: var(--font-size-caption);
	}

	.shell {
		font-weight: 600;
		letter-spacing: 0.02em;
		color: var(--accent);
		white-space: nowrap;
	}

	.cwd {
		color: var(--muted-foreground);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Traffic-light window dots. */
	.dots {
		display: inline-flex;
		align-items: center;
		gap: 0.4375rem;
		flex-shrink: 0;
	}

	.dot {
		width: 0.6875rem;
		height: 0.6875rem;
		border-radius: 999px;
		background: var(--color-neutral-3);
	}

	.dot.red {
		background: #ff5f57;
	}
	.dot.yellow {
		background: #febc2e;
	}
	.dot.green {
		background: #28c840;
	}

	.scroll {
		overflow: auto;
	}
	/* Firefox only — Chromium uses the arrow-less ::-webkit-scrollbar below; giving
	   it scrollbar-width would swap in the OS bar (arrows on Windows). */
	@supports not selector(::-webkit-scrollbar) {
		.scroll {
			scrollbar-width: thin;
			scrollbar-color: var(--color-neutral-3) transparent;
		}
	}
	.scroll::-webkit-scrollbar {
		height: 8px;
		width: 8px;
	}
	.scroll::-webkit-scrollbar-thumb {
		background: var(--color-neutral-3);
		border-radius: 999px;
	}
	.scroll::-webkit-scrollbar-button {
		display: none;
		width: 0;
		height: 0;
	}

	.body {
		padding: 0.375rem 0 0.75rem 0;
		font-size: var(--font-size-small);
		line-height: 1.75;
		letter-spacing: 0.35px;
		color: var(--foreground);
		tab-size: 2;
	}

	/* ::selection doesn't cross shadow boundaries — restate ink.css's selection
	   colors so terminal text highlights like the rest of the page. */
	.body ::selection {
		background: var(--selection-background);
		color: var(--selection-foreground);
	}
	.body ::-moz-selection {
		background: var(--selection-background);
		color: var(--selection-foreground);
	}

	.line {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0 0.875rem;
		min-height: 1.75em;
	}

	.line.copyable {
		cursor: default;
	}

	.line.copyable:hover {
		background: color-mix(in oklch, var(--foreground) 6%, transparent);
	}

	.text {
		flex: 1 1 auto;
		min-width: 0;
		white-space: pre;
		overflow: hidden;
		/* Terminal text stays selectable even though the page default opts out. */
		user-select: text;
		-webkit-user-select: text;
	}

	.prompt {
		color: var(--accent);
		user-select: none;
		margin-right: 0.5rem;
	}

	.command {
		color: var(--foreground);
	}

	.output {
		color: var(--muted-foreground);
	}

	/* Blinking block caret that trails the typing head on the active command. */
	.caret {
		display: inline-block;
		width: 0.55em;
		height: 1.05em;
		margin-left: 1px;
		vertical-align: text-bottom;
		background: var(--accent);
		animation: term-blink 1s step-end infinite;
	}

	@keyframes term-blink {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
	}

	/* Output lines fade in quickly as they reveal (duration via --fade). */
	.line.appearing {
		animation: term-fade var(--fade, 240ms) ease both;
	}

	@keyframes term-fade {
		from {
			opacity: 0;
			transform: translateY(2px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.caret {
			animation: none;
		}
		.line.appearing {
			animation: none;
		}
	}

	/* Replay control — appears bottom-right once a run completes. */
	.replay {
		position: absolute;
		bottom: 0.5rem;
		right: 0.625rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		padding: 0;
		background: color-mix(in oklch, var(--color-neutral-0) 82%, transparent);
		border: 1px solid var(--border);
		border-radius: 999px;
		color: var(--muted-foreground);
		cursor: pointer;
		opacity: 0;
		transform: scale(0.9);
		pointer-events: none;
		transition:
			opacity 0.18s ease,
			transform 0.18s ease,
			color 0.12s ease,
			background-color 0.12s ease;
	}

	.replay.show {
		opacity: 1;
		transform: none;
		pointer-events: auto;
	}

	.replay:hover {
		color: var(--foreground);
	}

	.replay:focus-visible {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: 2px;
	}

	.replay svg {
		width: 0.95rem;
		height: 0.95rem;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;
	}

	.copy {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 1.5rem;
		height: 1.5rem;
		padding: 0;
		background: transparent;
		border: none;
		border-radius: var(--radius-sm);
		color: var(--muted-foreground);
		cursor: pointer;
		opacity: 0;
		transition:
			opacity 0.12s ease,
			color 0.12s ease,
			background-color 0.12s ease;
	}

	.line.copyable:hover .copy,
	.copy:focus-visible {
		opacity: 1;
	}

	.copy:hover {
		color: var(--foreground);
		background: color-mix(in oklch, var(--foreground) 10%, transparent);
	}

	.copy:focus-visible {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: -1px;
	}

	.copy.is-copied {
		color: var(--success);
		opacity: 1;
	}

	.copy svg {
		width: 0.875rem;
		height: 0.875rem;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;
	}
`

type Line = {
	raw: string
	isCommand: boolean
	marker: string
	command: string
	// Per-line animation overrides (Tier 2 `lines` prop only); undefined = use globals.
	delay?: number
	typeSpeed?: number
	fade?: number
}

// One entry of the Tier 2 `lines` property: a bare string (parsed like a `code`
// row) or an object with explicit type + timing.
type LineSpec =
	| string
	| {
			text?: string
			type?: 'command' | 'output'
			delay?: number
			typeSpeed?: number
			fade?: number
	  }

// Split the raw source into terminal lines, tagging command lines (those that
// open with the prompt marker, e.g. `$ npm install`) and stashing the command
// text minus the marker for copying.
const parseLines = (code: string, marker: string): Line[] => {
	const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	const promptRe = new RegExp(`^\\s*${escaped}\\s+(.*)$`)
	return code.split('\n').map((raw) => {
		const m = raw.match(promptRe)
		return m
			? { raw, isCommand: true, marker, command: m[1] }
			: { raw, isCommand: false, marker: '', command: '' }
	})
}

// Strip a leading prompt marker from a command string, if present.
const stripMarker = (text: string, marker: string): string => {
	const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	const m = text.match(new RegExp(`^\\s*${escaped}\\s+(.*)$`))
	return m ? m[1] : text
}

// Build the render/animation model. Prefers the Tier 2 `lines` property (with
// per-line timing) and falls back to splitting the `code` string.
const buildModel = (code: string, marker: string, lines: unknown): Line[] => {
	if (Array.isArray(lines) && lines.length) {
		return (lines as LineSpec[]).map((item) => {
			if (typeof item === 'string') return parseLines(item, marker)[0]
			const text = String(item.text ?? '')
			const isCommand =
				item.type != null ? item.type === 'command' : parseLines(text, marker)[0].isCommand
			return {
				raw: text,
				isCommand,
				marker: isCommand ? marker : '',
				command: isCommand ? stripMarker(text, marker) : '',
				delay: item.delay,
				typeSpeed: item.typeSpeed,
				fade: item.fade
			}
		})
	}
	return parseLines(code, marker)
}

// Resolve which 1-based lines are copyable. `spec` may be an array of line
// numbers (imperative property) or a string attribute: `all`, `none`,
// `commands` (default — prompt lines), or ranges like `1-3,5`.
const resolveCopyable = (spec: unknown, lines: Line[]): boolean[] => {
	if (spec == null || spec === '') return lines.map((l) => l.isCommand)
	if (Array.isArray(spec)) {
		const set = new Set(spec.map(Number))
		return lines.map((_, i) => set.has(i + 1))
	}
	const s = String(spec).trim().toLowerCase()
	if (s === 'all') return lines.map((l) => l.raw.length > 0)
	if (s === 'none') return lines.map(() => false)
	if (s === 'commands' || s === 'prompt' || s === 'auto') return lines.map((l) => l.isCommand)
	const set = new Set<number>()
	for (const part of s.split(',')) {
		const seg = part.trim()
		if (!seg) continue
		const range = seg.match(/^(\d+)\s*-\s*(\d+)$/)
		if (range) {
			for (let n = Number(range[1]); n <= Number(range[2]); n++) set.add(n)
		} else if (/^\d+$/.test(seg)) {
			set.add(Number(seg))
		}
	}
	return lines.map((_, i) => set.has(i + 1))
}

// Nullish-safe numeric read for timing props (0 is a valid value; '' / null are not).
const num = (v: unknown, fallback: number): number =>
	v == null || v === '' || Number.isNaN(Number(v)) ? fallback : Number(v)

export const ZTerminal = c(
	(props) => {
		const host = useHost()
		const [copied, setCopied] = useState(-1)
		// active: index of the line currently revealing (-1 = idle/gap).
		// shown: number of fully-revealed lines above `active`.
		// typed: characters revealed on the active command line.
		// done: the sequence has reached its end at least once.
		const [state, setState] = useState({ shown: 0, active: -1, typed: 0, done: false })

		const code = ((props.code as string) ?? '').replace(/\n$/, '')
		const marker = (props.prompt as string) || '$'

		const model = useMemo(() => buildModel(code, marker, props.lines), [code, marker, props.lines])
		const copyable = useMemo(() => resolveCopyable(props.copyLines, model), [props.copyLines, model])

		const animate = !!props.animate
		const typeSpeed = num(props.typeSpeed, 55)
		const lineDelay = num(props.lineDelay, 380)
		const fadeDuration = num(props.fadeDuration, 240)
		const loopDelay = num(props.loopDelay, 2200)
		const loop = !!props.loop

		// Whether the viewer has opted out of motion — resolved once, up front.
		const reduce = useMemo(
			() =>
				typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches,
			[]
		)
		const playing = animate && !reduce

		// Mutable animation driver — held in a ref so timers survive re-renders.
		const driver = useRef<any>({}).current

		useEffect(() => {
			// Static (or reduced-motion): render everything immediately.
			if (!playing) {
				setState({ shown: model.length, active: -1, typed: 0, done: false })
				return
			}

			const d = driver
			d.cancelled = false
			d.paused = false
			d.done = false
			d.started = false
			d.i = 0
			d.k = 0
			d.mode = 'gap'

			const clear = () => {
				if (d.timer) clearTimeout(d.timer)
				d.timer = 0
			}
			const at = (ms: number, fn: () => void) => {
				d.timer = window.setTimeout(fn, ms)
			}

			const advance = () => {
				d.i += 1
				step()
			}

			const typeStep = () => {
				if (d.cancelled || d.paused) return
				const line = model[d.i]
				d.k += 1
				setState({ shown: d.i, active: d.i, typed: d.k, done: false })
				if (d.k >= line.command.length) advance()
				else at(line.typeSpeed ?? typeSpeed, typeStep)
			}

			const reveal = () => {
				if (d.cancelled || d.paused) return
				const line = model[d.i]
				if (line.isCommand) {
					d.mode = 'typing'
					d.k = 0
					setState({ shown: d.i, active: d.i, typed: 0, done: false })
					at(line.typeSpeed ?? typeSpeed, typeStep)
				} else {
					d.mode = 'fading'
					setState({ shown: d.i, active: d.i, typed: 0, done: false })
					at(line.fade ?? fadeDuration, advance)
				}
			}

			const step = () => {
				if (d.cancelled || d.paused) return
				const i = d.i
				if (i >= model.length) {
					finish()
					return
				}
				d.mode = 'gap'
				setState({ shown: i, active: -1, typed: 0, done: false })
				const line = model[i]
				const delay = line.delay ?? (i === 0 ? Math.min(lineDelay, 300) : lineDelay)
				at(delay, reveal)
			}

			const finish = () => {
				d.done = true
				d.mode = 'done'
				setState({ shown: model.length, active: -1, typed: 0, done: true })
				props.done()
				if (loop && !d.cancelled)
					at(loopDelay, () => {
						if (!d.cancelled) start()
					})
			}

			const start = () => {
				clear()
				d.cancelled = false
				d.paused = false
				d.done = false
				d.started = true
				d.i = 0
				d.k = 0
				setState({ shown: 0, active: -1, typed: 0, done: false })
				step()
			}

			const resume = () => {
				if (d.done || !d.paused) return
				d.paused = false
				const line = model[d.i]
				if (d.mode === 'typing') at(line?.typeSpeed ?? typeSpeed, typeStep)
				else if (d.mode === 'fading') at(line?.fade ?? fadeDuration, advance)
				else step()
			}

			// Imperative control surface.
			d.start = start
			d.pause = () => {
				d.paused = true
				clear()
			}
			d.resume = resume

			const el = host.current as any
			if (el) {
				el.play = () => (d.started && !d.done ? resume() : start())
				el.pause = () => d.pause()
				el.restart = () => start()
			}

			// Kick off — immediately, or when scrolled into view.
			let io: IntersectionObserver | undefined
			if (props.startOnView && typeof IntersectionObserver === 'function' && el) {
				io = new IntersectionObserver(
					(entries) => {
						if (entries.some((e) => e.isIntersecting)) {
							io?.disconnect()
							start()
						}
					},
					{ threshold: 0.35 }
				)
				io.observe(el)
			} else {
				start()
			}

			return () => {
				d.cancelled = true
				clear()
				io?.disconnect()
				if (el) {
					delete el.play
					delete el.pause
					delete el.restart
				}
			}
		}, [playing, model, typeSpeed, lineDelay, fadeDuration, loop, loopDelay, props.startOnView])

		const copyText = (line: Line) => (line.isCommand ? line.command : line.raw)

		const onCopy = async (line: Line, index: number) => {
			try {
				const text = copyText(line)
				await navigator.clipboard.writeText(text)
				setCopied(index)
				props.copy(text)
				setTimeout(() => setCopied((c) => (c === index ? -1 : c)), 1600)
			} catch {
				/* clipboard unavailable — no-op */
			}
		}

		const showReplay = playing && state.done && !props.hideReplay

		return (
			<host shadowDom>
				<div class='window'>
					<div class='bar'>
						<div class='meta'>
							{props.shell && <span class='shell'>{props.shell}</span>}
							{props.cwd && <span class='cwd'>{props.cwd}</span>}
						</div>
						<div class='dots' aria-hidden='true'>
							<span class='dot red'></span>
							<span class='dot yellow'></span>
							<span class='dot green'></span>
						</div>
					</div>
					<div class='scroll'>
						<div class='body'>
							{model.map((line, i) => {
								// In play mode only lines up to the playhead exist yet.
								const isShown = !playing || i < state.shown
								const isActive = playing && i === state.active
								if (playing && !isShown && !isActive) return null

								const typing = isActive && line.isCommand
								const fading = isActive && !line.isCommand
								const commandText = typing ? line.command.slice(0, state.typed) : line.command
								const canCopy = copyable[i] && isShown

								let cls = 'line'
								if (canCopy) cls += ' copyable'
								if (fading) cls += ' appearing'

								return (
									<div
										class={cls}
										key={i}
										style={fading ? `--fade:${line.fade ?? fadeDuration}ms` : undefined}
									>
										<span class='text'>
											{line.isCommand ? (
												<>
													<span class='prompt'>{line.marker}</span>
													<span class='command'>{commandText || (typing ? '' : ' ')}</span>
													{typing && <span class='caret' aria-hidden='true'></span>}
												</>
											) : (
												<span class='output'>{line.raw || ' '}</span>
											)}
										</span>
										{canCopy && (
											<button
												type='button'
												class={copied === i ? 'copy is-copied' : 'copy'}
												aria-label='Copy line'
												onclick={() => onCopy(line, i)}
											>
												{copied === i ? (
													<svg viewBox='0 0 24 24'>
														<polyline points='4 12 10 18 20 6' />
													</svg>
												) : (
													<svg viewBox='0 0 24 24'>
														<rect x='9' y='9' width='11' height='11' rx='2' />
														<path d='M5 15V5a2 2 0 0 1 2-2h10' />
													</svg>
												)}
											</button>
										)}
									</div>
								)
							})}
						</div>
					</div>
					<button
						type='button'
						class={showReplay ? 'replay show' : 'replay'}
						aria-label='Replay'
						aria-hidden={showReplay ? 'false' : 'true'}
						tabindex={showReplay ? '0' : '-1'}
						onclick={() => (host.current as any)?.restart?.()}
					>
						<svg viewBox='0 0 24 24'>
							<polyline points='1 4 1 10 7 10' />
							<path d='M3.5 15a9 9 0 1 0 2.1-9.4L1 10' />
						</svg>
					</button>
				</div>
			</host>
		)
	},
	{
		props: {
			code: String,
			shell: String,
			cwd: String,
			prompt: String,
			copyLines: String,
			tone: { type: String, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			// Animation
			animate: { type: Boolean, reflect: true },
			startOnView: { type: Boolean },
			lines: { type: Array },
			typeSpeed: { type: Number },
			lineDelay: { type: Number },
			fadeDuration: { type: Number },
			loop: { type: Boolean },
			loopDelay: { type: Number },
			hideReplay: { type: Boolean },
			copy: event<string>({ bubbles: true, composed: true }),
			done: event<void>({ bubbles: true, composed: true })
		},
		styles: [themedScrollbarStyles, styles]
	}
)

customElements.define('z-terminal', ZTerminal)
