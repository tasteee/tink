import { defineElement } from '../shared/define-element'
import { c, css, event, useMemo, useState } from 'atomico'
import { highlight, splitTokenLines, type Token } from '../shared/highlight'
import { themedScrollbarStyles } from '../shared/scrollbar-styles'
import { copyText } from '../shared/clipboard'

/*
 * z-code-block, a monospace code surface with an optional header (filename +
 * language tag) and a copy-to-clipboard button. Pass the source via the `code`
 * property (preserves whitespace) and `line-numbers` adds a gutter. Syntax
 * colour is on by default, lowlight (highlight.js) via shared/highlight.ts,
 * themed against the zest `--syntax-*` palette, so it renders synchronously
 * inside the shadow root. Code is what this element is for, so highlighting is
 * the baseline rather than something every caller has to remember to ask for;
 * `is-plain` opts a block out of syntax colour. Fires `copy` after a successful copy.
 */
const styles = css`
	:host {
		display: block;
		--accent: var(--purple);
		width: 100%;
		min-width: 0;
	}

	:host([tone='secondary']) {
		--accent: var(--pink);
	}

	:host([is-hidden]) {
		display: none;
	}

	.block {
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--color-neutral-0);
		overflow: hidden;
		font-family: var(--font-mono);
	}

	:host([is-flush]) .block {
		border: 0;
		border-radius: 0;
		background: transparent;
	}

	.tabs {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		min-width: 0;
		overflow-x: auto;
		scrollbar-width: none;
	}

	.file-tab {
		position: relative;
		padding: 0.3125rem 0.625rem;
		background: transparent;
		border: 0;
		border-radius: var(--radius-sm);
		color: var(--muted-foreground);
		font-family: var(--font-mono);
		font-size: var(--font-size-caption);
		white-space: nowrap;
		cursor: pointer;
		transition:
			color var(--motion-fast) var(--ease-enter),
			background-color var(--motion-fast) var(--ease-enter);
	}

	.file-tab:hover {
		color: var(--foreground);
	}

	.file-tab.is-active {
		color: var(--foreground);
		background: color-mix(in oklch, var(--foreground) 8%, transparent);
	}

	.file-tab:focus-visible {
		outline: 3px solid var(--focus-ring);
		outline-offset: 1px;
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.5rem 0.75rem 0.5rem 0.875rem;
		border-bottom: 1px solid var(--border);
		background: var(--color-neutral-1);
	}

	.meta {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		min-width: 0;
	}

	.filename {
		font-size: var(--font-size-caption);
		color: var(--foreground);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.lang {
		font-size: var(--font-size-caption);
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--accent);
	}

	.copy {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		flex-shrink: 0;
		padding: 0.25rem 0.5rem;
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		color: var(--muted-foreground);
		font-family: inherit;
		font-size: var(--font-size-caption);
		cursor: pointer;
		transition:
			color var(--motion-fast) var(--ease-enter),
			border-color var(--motion-fast) var(--ease-enter),
			background-color var(--motion-fast) var(--ease-enter);
	}

	.copy:hover {
		color: var(--foreground);
		border-color: color-mix(in oklch, var(--foreground) 30%, transparent);
	}

	.copy:focus-visible {
		outline: 3px solid var(--focus-ring);
		outline-offset: 2px;
	}

	.copy.is-copied {
		color: var(--success);
		border-color: color-mix(in oklch, var(--success) 50%, transparent);
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

	.scroll {
		overflow: auto;
	}
	/* Firefox only: Chromium uses the arrow-less ::-webkit-scrollbar below; giving
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

	pre {
		margin: 0;
		padding: 0.875rem 1rem;
		font-size: var(--font-size-small);
		line-height: 1.6;
		color: var(--foreground);
		tab-size: 2;
		/* Code stays selectable even though the page default is user-select:none,
		   people need to copy snippets. The line-number gutter re-opts out
		   below so dragging a selection doesn't pick up the numbers. */
		user-select: text;
		-webkit-user-select: text;
	}

	/* ::selection doesn't cross shadow boundaries, so restate the page-wide
	   selection style (ink.css) here for code rendered inside this shadow root.
	   Shares the --selection-* tokens, so code and prose highlight identically. */
	pre ::selection {
		background: var(--selection-background);
		color: var(--selection-foreground);
	}
	pre ::-moz-selection {
		background: var(--selection-background);
		color: var(--selection-foreground);
	}

	.rows {
		display: table;
		min-width: 100%;
	}

	.line {
		display: table-row;
	}

	.gutter,
	.text {
		display: table-cell;
		white-space: pre;
	}

	.gutter {
		padding-inline-end: 1rem;
		text-align: end;
		color: var(--muted-foreground);
		user-select: none;
		opacity: 0.6;
	}

	/*
	 * Annotation. These are table-rows, so a background has to be painted on
	 * the cells rather than the row — a table-row's background sits behind its
	 * cells and is invisible wherever a cell paints its own.
	 *
	 * The marker column is the existing gutter: with added-lines set it
	 * carries +/- instead of the line number, because a diff reader wants the
	 * sign more than the count.
	 */
	.line.is-added .gutter,
	.line.is-added .text {
		background: color-mix(in oklch, var(--success) 12%, transparent);
	}

	.line.is-added .gutter {
		color: var(--success);
		opacity: 1;
	}

	.line.is-removed .gutter,
	.line.is-removed .text {
		background: color-mix(in oklch, var(--destructive) 12%, transparent);
	}

	.line.is-removed .gutter {
		color: var(--destructive);
		opacity: 1;
	}

	/* Focus dims everything else rather than hiding it, so the surrounding
	   code still gives the excerpt somewhere to sit. */
	.line.is-dimmed {
		opacity: 0.35;
		transition: opacity var(--motion-fast) var(--ease-enter);
	}

	.block:hover .line.is-dimmed {
		opacity: 1;
	}

	/*
	 * highlight.js token classes mapped onto the zest --syntax-* palette.
	 * Ordering matters: highlight.js nests JSX content inside .hljs-tag (e.g.
	 * "hljs-tag hljs-attr"), so structural classes (.hljs-tag) are declared
	 * BEFORE content classes, equal-specificity ties go to the later rule, so
	 * the nested attr/name/string colors win over the dim tag brackets.
	 */
	.hljs-comment,
	.hljs-quote {
		color: var(--syntax-comment);
		font-style: italic;
	}
	/* JSX/HTML angle-bracket structure: <, >, /, =, kept dim. */
	.hljs-tag,
	.hljs-operator,
	.hljs-punctuation {
		color: var(--syntax-operator);
	}
	.hljs-keyword,
	.hljs-selector-tag,
	.hljs-meta,
	.hljs-meta-keyword,
	.hljs-doctag {
		color: var(--syntax-keyword);
	}
	.hljs-string,
	.hljs-meta .hljs-string,
	.hljs-addition {
		color: var(--syntax-string);
	}
	.hljs-number {
		color: var(--syntax-number);
	}
	.hljs-literal,
	.hljs-symbol,
	.hljs-bullet,
	.hljs-deletion {
		color: var(--syntax-constant);
	}
	.hljs-built_in,
	.hljs-type,
	.hljs-title.class_,
	.hljs-class .hljs-title,
	.hljs-selector-class {
		color: var(--syntax-class);
	}
	.hljs-attr,
	.hljs-attribute,
	.hljs-property,
	.hljs-selector-attr,
	.hljs-selector-pseudo {
		color: var(--syntax-property);
	}
	.hljs-variable,
	.hljs-template-variable,
	.hljs-params {
		color: var(--syntax-variable);
	}
	.hljs-title,
	.hljs-title.function_,
	.hljs-section,
	.hljs-selector-id {
		color: var(--syntax-function);
	}
	/* Tag/component name (declared after .hljs-tag so it wins in JSX). */
	.hljs-name {
		color: var(--syntax-tag);
	}
	.hljs-regexp {
		color: var(--syntax-regex);
	}
	.hljs-emphasis {
		font-style: italic;
	}
	.hljs-strong {
		font-weight: 700;
	}

	.rows {
		line-height: 1.75 !important;
		letter-spacing: 0.35px !important;
		font-family: var(--font-mono);
	}
`

type CodeFileT = { name: string; code: string; language?: string }

const extensionOf = (name: string): string | undefined => name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase()

/*
 * Line annotation. Ranges are authored the way a person writes them —
 * "3-5,8" — because the alternative is an array property, and the pages that
 * most want to annotate a snippet are markdown pages with no script.
 */
const buildTokens = (code: string, language: string | undefined, isPlain: boolean): Token[] => {
	const trimmedCode = code.replace(/\n$/, '')
	if (isPlain) return [{ value: trimmedCode, className: '' }]
	return highlight(trimmedCode, language)
}

const parseLineRanges = (spec?: string): Set<number> => {
	const lines = new Set<number>()
	if (!spec) return lines

	for (const part of spec.split(',')) {
		const range = part.trim()
		if (!range) continue

		const bounds = range.split('-')
		const start = Number(bounds[0])
		const end = bounds.length > 1 ? Number(bounds[1]) : start

		const isUsable = Number.isFinite(start) && Number.isFinite(end)
		if (!isUsable) continue

		for (let line = Math.min(start, end); line <= Math.max(start, end); line += 1) {
			lines.add(line)
		}
	}

	return lines
}

const buildLineClass = (lineNumber: number, marks: MarksT): string => {
	const classes = ['line']

	if (marks.added.has(lineNumber)) classes.push('is-added')
	if (marks.removed.has(lineNumber)) classes.push('is-removed')

	const hasFocus = marks.focused.size > 0
	const isDimmed = hasFocus && !marks.focused.has(lineNumber)
	if (isDimmed) classes.push('is-dimmed')

	return classes.join(' ')
}

type MarksT = {
	added: Set<number>
	removed: Set<number>
	focused: Set<number>
}

// With a diff annotation present the gutter carries the sign instead of the
// count: a reader following a change wants to know which way a line went more
// than they want its position.
const buildGutterLabel = (lineNumber: number, marks: MarksT): string => {
	if (marks.added.has(lineNumber)) return '+'
	if (marks.removed.has(lineNumber)) return '-'
	return String(lineNumber)
}


export const ZCodeBlock = c(
	(props) => {
		const [copied, setCopied] = useState(false)
		const [activeFile, setActiveFile] = useState(0)

		const files: CodeFileT[] = Array.isArray(props.files) ? (props.files as CodeFileT[]) : []
		const file = files.length ? files[Math.min(activeFile, files.length - 1)] : undefined
		const code = file ? file.code : ((props.code as string) ?? '')
		const language = file ? file.language || extensionOf(file.name) : (props.language as string | undefined)

		const tokens = useMemo(
			() => buildTokens(code, language, Boolean(props.isPlain)),
			[code, language, props.isPlain]
		)
		const tokenLines = useMemo(() => splitTokenLines(tokens), [tokens])

		const marks: MarksT = {
			added: parseLineRanges(props.addedLines as string),
			removed: parseLineRanges(props.removedLines as string),
			focused: parseLineRanges(props.focusLines as string)
		}

		// Any annotation needs the per-line rows, whether or not the reader
		// asked for numbers — there is nowhere else to hang a mark.
		const hasAnnotation = marks.added.size > 0 || marks.removed.size > 0 || marks.focused.size > 0
		const shouldRenderRows = Boolean(props.hasLineNumbers) || hasAnnotation
		const hasDiffMarks = marks.added.size > 0 || marks.removed.size > 0

		const renderToken = (token: Token, key: number) =>
			token.className ? (
				<span class={token.className} key={key}>
					{token.value}
				</span>
			) : (
				token.value
			)

		// Copy goes through the shared clipboard helper so a denied
		// permission fails quietly instead of throwing into the page.
		const onCopy = async () => {
			const result = await copyText(code)
			if (!result.isCopied) return
			setCopied(true)
			props.copy()
			setTimeout(() => setCopied(false), 1600)
		}

		const showHead = !props.isHeaderHidden && (files.length > 0 || props.filename || props.language || !props.isCopyHidden)

		return (
			<host shadowDom>
				<div class="block">
					{showHead && (
						<div class="head">
							{files.length > 0 ? (
								<div class="tabs" role="tablist" aria-label="Files">
									{files.map((f, index) => (
										<button
											key={f.name}
											type="button"
											role="tab"
											aria-selected={f === file ? 'true' : 'false'}
											class={f === file ? 'file-tab is-active' : 'file-tab'}
											onclick={() => setActiveFile(index)}
										>
											{f.name}
										</button>
									))}
								</div>
							) : (
								<div class="meta">
									{props.language && <span class="lang">{props.language}</span>}
									{props.filename && <span class="filename">{props.filename}</span>}
								</div>
							)}
							{!props.isCopyHidden && (
								<button type="button" class={copied ? 'copy is-copied' : 'copy'} onclick={onCopy}>
									{copied ? (
										<svg viewBox="0 0 24 24">
											<polyline points="4 12 10 18 20 6" />
										</svg>
									) : (
										<svg viewBox="0 0 24 24">
											<rect x="9" y="9" width="11" height="11" rx="2" />
											<path d="M5 15V5a2 2 0 0 1 2-2h10" />
										</svg>
									)}
									{copied ? 'Copied' : 'Copy'}
								</button>
							)}
						</div>
					)}
					<div class="scroll">
						<pre>
							{shouldRenderRows ? (
								<div class="rows">
									{tokenLines.map((line, i) => {
										const lineNumber = i + 1
										const gutterLabel = hasDiffMarks ? buildGutterLabel(lineNumber, marks) : String(lineNumber)
										const showGutter = Boolean(props.hasLineNumbers) || hasDiffMarks

										return (
											<div class={buildLineClass(lineNumber, marks)} key={i}>
												{showGutter && <span class="gutter">{gutterLabel}</span>}
												<span class="text">{line.length ? line.map(renderToken) : ' '}</span>
											</div>
										)
									})}
								</div>
							) : (
								<code>{tokens.map(renderToken)}</code>
							)}
						</pre>
					</div>
				</div>
			</host>
		)
	},
	{
		props: {
			code: String,
			files: { type: Array },
			language: String,
			filename: String,
			hasLineNumbers: { type: Boolean, reflect: true },
			isCopyHidden: { type: Boolean, reflect: true },
			isFlush: { type: Boolean, reflect: true },
			isHeaderHidden: { type: Boolean, reflect: true },
			isPlain: { type: Boolean, reflect: true },
			addedLines: { type: String, reflect: true },
			removedLines: { type: String, reflect: true },
			focusLines: { type: String, reflect: true },
			tone: { type: String, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			copy: event<void>({ bubbles: true, composed: true })
		},
		styles: [themedScrollbarStyles, styles]
	}
)

defineElement('z-code-block', ZCodeBlock)
