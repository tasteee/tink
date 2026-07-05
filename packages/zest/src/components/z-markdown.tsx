import { c, css, event, useMemo } from 'atomico'
import { Marked } from 'marked'

/*
 * z-markdown — the shared markdown renderer behind chat, blog, and docs. Parses
 * markdown (GFM) and renders it into the shadow root, then upgrades the output
 * to compose existing z-* : fenced code becomes z-code-block. Themed with the
 * ink tokens so prose looks the same everywhere.
 *
 *   const md = document.querySelector('z-markdown')
 *   md.content = '# Hi\n\nSome **bold** text and `code`.'
 *
 * Set `is-streaming` while tokens are still arriving (chat / AI). Sanitization is
 * on by default (strips dangerous tags/attributes, neutralizes javascript: URLs);
 * `allow-html` opts out. Code fences route through z-code-block unless
 * `no-highlight`. Emits `linkclick` {href} when a rendered link is clicked.
 */
const styles = css`
	:host {
		display: block;
		/* inherit so a bubble (or any container) drives the text color; falls back
		   to --foreground when used standalone on the page background. */
		color: inherit;
		font-size: 0.9375rem;
		line-height: 1.6;
		overflow-wrap: anywhere;
	}
	:host([is-hidden]) {
		display: none;
	}

	.md > :first-child {
		margin-top: 0;
	}
	.md > :last-child {
		margin-bottom: 0;
	}

	p {
		margin: 0 0 0.75em;
	}
	h1,
	h2,
	h3,
	h4,
	h5,
	h6 {
		margin: 1.2em 0 0.5em;
		line-height: 1.25;
		font-weight: 700;
	}
	h1 {
		font-size: 1.6em;
	}
	h2 {
		font-size: 1.35em;
	}
	h3 {
		font-size: 1.15em;
	}
	h4 {
		font-size: 1em;
	}

	a {
		color: var(--primary);
		text-decoration: underline;
		text-underline-offset: 2px;
	}
	a:hover {
		text-decoration-thickness: 2px;
	}

	ul,
	ol {
		margin: 0 0 0.75em;
		padding-left: 1.5em;
	}
	li {
		margin: 0.15em 0;
	}
	li > ul,
	li > ol {
		margin: 0.15em 0;
	}

	blockquote {
		margin: 0 0 0.75em;
		padding: 0.1em 0 0.1em 1em;
		border-left: 3px solid var(--border);
		color: var(--muted-foreground);
	}

	:not(pre) > code {
		font-family: var(--font-mono);
		font-size: 0.875em;
		background: color-mix(in oklch, var(--foreground) 10%, transparent);
		padding: 0.15em 0.35em;
		border-radius: var(--radius-sm);
	}

	z-code-block {
		display: block;
		margin: 0 0 0.75em;
	}

	hr {
		border: none;
		border-top: 1px solid var(--border);
		margin: 1.2em 0;
	}

	img {
		max-width: 100%;
		border-radius: var(--radius-md);
	}

	table {
		border-collapse: collapse;
		width: 100%;
		margin: 0 0 0.75em;
		font-size: 0.9em;
	}
	th,
	td {
		border: 1px solid var(--border);
		padding: 0.4em 0.6em;
		text-align: left;
	}
	th {
		background: color-mix(in oklch, var(--foreground) 6%, transparent);
		font-weight: 600;
	}

	strong {
		font-weight: 700;
	}
	del {
		opacity: 0.7;
	}
`

const marked = new Marked({ gfm: true, breaks: true })

const DANGEROUS_TAGS = 'script,style,iframe,object,embed,link,meta,base,form'
const BAD_URL = /^\s*(javascript:|vbscript:|data:text\/html)/i

// Minimal DOM sanitizer — drops dangerous tags, on* handlers, and unsafe URLs.
// Not a full DOMPurify; enough to neutralize the common injection vectors in
// user-authored chat/markdown. (Swap in DOMPurify here if you need more.)
const sanitize = (root: ParentNode) => {
	root.querySelectorAll(DANGEROUS_TAGS).forEach((n) => n.remove())
	root.querySelectorAll<HTMLElement>('*').forEach((el) => {
		for (const attr of [...el.attributes]) {
			const name = attr.name.toLowerCase()
			if (name.startsWith('on')) el.removeAttribute(attr.name)
			else if ((name === 'href' || name === 'src' || name === 'xlink:href') && BAD_URL.test(attr.value))
				el.removeAttribute(attr.name)
		}
	})
}

// Parse → sanitize → upgrade code fences → harden links, all on a detached node,
// then serialize back to an HTML string. Done off the live DOM (and memoized) so
// the result can be set through the vdom via `innerHTML` — surviving Atomico
// re-renders (a streaming parent re-renders us every token). z-code-block reads
// its `code` from an attribute, which serialization escapes for us.
const buildHtml = (src: string, allowHtml: boolean, noHighlight: boolean): string => {
	const container = document.createElement('div')
	container.innerHTML = marked.parse(src, { async: false }) as string

	if (!allowHtml) sanitize(container)

	if (!noHighlight) {
		container.querySelectorAll('pre > code').forEach((code) => {
			const lang = (code.getAttribute('class') || '').match(/language-([\w-]+)/)?.[1]
			const block = document.createElement('z-code-block')
			if (lang) block.setAttribute('language', lang)
			block.setAttribute('code', code.textContent ?? '')
			code.closest('pre')?.replaceWith(block)
		})
	}

	container.querySelectorAll('a[href]').forEach((a) => {
		const href = a.getAttribute('href') || ''
		if (/^https?:\/\//i.test(href)) {
			a.setAttribute('target', '_blank')
			a.setAttribute('rel', 'noopener noreferrer')
		}
	})

	return container.innerHTML
}

export const ZMarkdown = c(
	(props) => {
		const html = useMemo(
			() => buildHtml((props.content as string) ?? '', Boolean(props.allowHtml), Boolean(props.noHighlight)),
			[props.content, props.allowHtml, props.noHighlight]
		)

		const onClick = (e: MouseEvent) => {
			const a = (e.target as HTMLElement).closest('a')
			if (a) props.linkclick({ href: a.getAttribute('href') ?? '' })
		}

		return (
			<host shadowDom onclick={onClick}>
				<div class='md' innerHTML={html} />
			</host>
		)
	},
	{
		props: {
			content: { type: String },
			isStreaming: { type: Boolean, reflect: true },
			allowHtml: { type: Boolean, reflect: true },
			noHighlight: { type: Boolean, reflect: true },
			headingAnchors: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			linkclick: event<{ href: string }>({ bubbles: true, composed: true }),
			copy: event<{ text: string }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-markdown', ZMarkdown)
