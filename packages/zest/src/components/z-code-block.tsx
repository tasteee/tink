import { c, css, event, useState, useMemo } from 'atomico'
import { highlight, splitTokenLines, type Token } from '../shared/highlight'
import { themedScrollbarStyles } from '../shared/scrollbar-styles'

/*
 * z-code-block, a monospace code surface with an optional header (filename +
 * language tag) and a copy-to-clipboard button. Pass the source via the `code`
 * property (preserves whitespace); `has-line-numbers` adds a gutter. For a
 * multi-file example, set `files` instead and the header becomes a row of file
 * tabs (copy takes the active file):
 *   el.files = [{ name: 'index.html', code, language? }, { name: 'main.js', code }]
 * A file's language defaults to its extension. `is-flush` drops the outer
 * border and radius for embedding inside another surface; `hide-header` drops
 * the header row entirely (when the host surface already labels the code). Syntax
 * highlighting is provided by lowlight (highlight.js) via shared/highlight.ts
 * and themed against the zest `--syntax-*` palette, so it renders synchronously
 * inside the shadow root. Fires `copy` after a successful copy.
 */
const styles = css`
	:host {
		display: block;
		--accent: var(--purple);
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
		outline: 2px solid color-mix(in oklch, var(--ring) 60%, transparent);
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
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
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
		padding-right: 1rem;
		text-align: right;
		color: var(--muted-foreground);
		user-select: none;
		opacity: 0.6;
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

export const ZCodeBlock = c(
	(props) => {
		const [copied, setCopied] = useState(false)
		const [activeFile, setActiveFile] = useState(0)

		const files: CodeFileT[] = Array.isArray(props.files) ? (props.files as CodeFileT[]) : []
		const file = files.length ? files[Math.min(activeFile, files.length - 1)] : undefined
		const code = file ? file.code : ((props.code as string) ?? '')
		const language = file ? file.language || extensionOf(file.name) : (props.language as string | undefined)

		const tokens = useMemo(() => highlight(code.replace(/\n$/, ''), language), [code, language])
		const tokenLines = useMemo(() => splitTokenLines(tokens), [tokens])

		const renderToken = (token: Token, key: number) =>
			token.className ? (
				<span class={token.className} key={key}>
					{token.value}
				</span>
			) : (
				token.value
			)

		const onCopy = async () => {
			try {
				await navigator.clipboard.writeText(code)
				setCopied(true)
				props.copy()
				setTimeout(() => setCopied(false), 1600)
			} catch {
				/* clipboard unavailable, no-op */
			}
		}

		const showHead = !props.hideHeader && (files.length > 0 || props.filename || props.language || !props.hideCopy)

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
							{!props.hideCopy && (
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
							{props.hasLineNumbers ? (
								<div class="rows">
									{tokenLines.map((line, i) => (
										<div class="line" key={i}>
											<span class="gutter">{i + 1}</span>
											<span class="text">{line.length ? line.map(renderToken) : ' '}</span>
										</div>
									))}
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
			hideCopy: { type: Boolean, reflect: true },
			isFlush: { type: Boolean, reflect: true },
			hideHeader: { type: Boolean, reflect: true },
			tone: { type: String, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			copy: event<void>({ bubbles: true, composed: true })
		},
		styles: [themedScrollbarStyles, styles]
	}
)

customElements.define('z-code-block', ZCodeBlock)
