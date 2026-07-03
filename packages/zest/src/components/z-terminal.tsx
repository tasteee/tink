import { c, css, event, useState, useMemo } from 'atomico'

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

export const ZTerminal = c(
	(props) => {
		const [copied, setCopied] = useState(-1)

		const code = ((props.code as string) ?? '').replace(/\n$/, '')
		const marker = (props.prompt as string) || '$'

		const lines = useMemo(() => parseLines(code, marker), [code, marker])
		const copyable = useMemo(() => resolveCopyable(props.copyLines, lines), [props.copyLines, lines])

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
							{lines.map((line, i) => (
								<div class={copyable[i] ? 'line copyable' : 'line'} key={i}>
									<span class='text'>
										{line.isCommand ? (
											<>
												<span class='prompt'>{line.marker}</span>
												<span class='command'>{line.command || ' '}</span>
											</>
										) : (
											<span class='output'>{line.raw || ' '}</span>
										)}
									</span>
									{copyable[i] && (
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
							))}
						</div>
					</div>
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
			copy: event<string>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-terminal', ZTerminal)
