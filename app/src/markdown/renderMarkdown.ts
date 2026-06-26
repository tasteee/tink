import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'
import { customMarkers, matchDynamicMarkerDefinition, matchFolderOpen, FOLDER_CLOSE_MARKER, META_MARKER, type MarkerDefinitionT } from './markers'

// Runs entirely in the browser. Code fences become <z-code-block> elements,
// which highlight themselves (lowlight) when they upgrade — so there is no
// async highlighting step here. Custom block markers (see markers.ts) are
// applied to paragraphs that start with a marker token.

// Passed in by the caller so the `!META` marker (see markers.ts) can render
// the byline block without the post's data living in the markdown itself.
export type PostMetaT = {
	authorName: string
	avatarSrc?: string
	date: string
	tags: string[]
}

type AnyNode = { type: string; value?: string; meta?: string | null; children?: AnyNode[]; data?: Record<string, unknown>; tagName?: string; properties?: Record<string, unknown> }

const applyMarker = (node: AnyNode, def: MarkerDefinitionT): void => {
	const existing = (node.data?.hProperties as Record<string, unknown>) ?? {}
	const hProperties: Record<string, unknown> = { ...existing, ...def.attributes }
	if (def.classes) hProperties.className = def.classes
	if (def.isAriaHidden) hProperties['aria-hidden'] = 'true'
	node.data = { ...node.data, hName: def.element ?? 'p', hProperties }
}

// The leading text of a paragraph node, used to spot `!FOLDER`/`!ENDFOLDER`
// marker lines (which sit alone on their own paragraph).
const paragraphMarkerText = (node: AnyNode): string | null => {
	if (node.type !== 'paragraph') return null
	const first = node.children?.[0]
	if (!first || first.type !== 'text' || first.value === undefined) return null
	return first.value
}

// mdast: regroup the nodes between `!FOLDER="…"` and `!ENDFOLDER` into a
// collapsible <details> (with the title as its <summary>). Runs before the
// other transforms so the marker paragraphs are consumed here and the wrapped
// blocks still flow through remarkCustomParagraphs/typography below. A stack
// handles nesting; any folder left open at the end folds to the end of doc.
const remarkFolders = () => (tree: AnyNode) => {
	type Frame = { title: string; isOpen: boolean; out: AnyNode[] }
	const root: AnyNode[] = []
	const stack: Frame[] = []
	const top = (): AnyNode[] => (stack.length ? stack[stack.length - 1].out : root)

	const close = (): void => {
		const frame = stack.pop()
		if (!frame) return
		const summary: AnyNode = {
			type: 'folderSummary',
			children: [{ type: 'text', value: frame.title }],
			data: { hName: 'summary', hProperties: { className: ['zFolderSummary'] } }
		}
		const details: AnyNode = {
			type: 'folder',
			children: [summary, ...frame.out],
			data: { hName: 'details', hProperties: { className: ['zFolder'], ...(frame.isOpen ? { open: true } : {}) } }
		}
		top().push(details)
	}

	for (const node of tree.children ?? []) {
		const text = paragraphMarkerText(node)
		const open = text === null ? null : matchFolderOpen(text)
		if (open) {
			stack.push({ title: open.title, isOpen: open.isOpen, out: [] })
			continue
		}
		if (text !== null && text.trim() === FOLDER_CLOSE_MARKER && stack.length) {
			close()
			continue
		}
		top().push(node)
	}
	while (stack.length) close()

	tree.children = root
}

// mdast: rewrite paragraphs that begin with a custom marker token.
const remarkCustomParagraphs = (meta?: PostMetaT) => () => (tree: AnyNode) => {
	visit(tree, 'paragraph', (node: AnyNode) => {
		const firstText = node.children?.find((c) => c.type === 'text')
		if (!firstText || firstText.value === undefined) return

		if (firstText.value.trim() === META_MARKER) {
			node.children = []
			applyMarker(node, {
				element: 'z-post-meta',
				attributes: {
					name: meta?.authorName ?? '',
					avatarSrc: meta?.avatarSrc ?? '',
					date: meta?.date ?? '',
					tags: JSON.stringify(meta?.tags ?? [])
				}
			})
			return
		}

		const dynamic = matchDynamicMarkerDefinition(firstText.value)
		if (dynamic) {
			if (dynamic.consumeLine) node.children = []
			else firstText.value = firstText.value.slice(dynamic.marker!.length).trimStart()
			applyMarker(node, dynamic)
			return
		}

		for (const [marker, def] of Object.entries(customMarkers)) {
			if (!firstText.value.startsWith(marker)) continue
			if (def.consumeLine) node.children = []
			else firstText.value = firstText.value.slice(marker.length).trimStart()
			applyMarker(node, def)
			return
		}
	})
}

// mdast: capture the code fence's "meta" — everything after the language on the
// opening ``` line — as a filename (e.g. ```tsx src/components/overlay.tsx).
// Meta is dropped when going mdast→hast, so stash it in hProperties; the default
// code handler merges those onto the <code> element as a data-filename attr,
// which rehypeCodeBlocks reads back below.
const remarkCodeFilename = () => (tree: AnyNode) => {
	visit(tree, 'code', (node: AnyNode) => {
		const filename = node.meta?.trim()
		if (!filename) return
		const existing = (node.data?.hProperties as Record<string, unknown>) ?? {}
		node.data = { ...node.data, hProperties: { ...existing, dataFilename: filename } }
	})
}

const nodeText = (node: AnyNode): string => {
	if (node.type === 'text') return node.value ?? ''
	return (node.children ?? []).map(nodeText).join('')
}

const languageOf = (codeEl: AnyNode): string | undefined => {
	const classNames = (codeEl.properties?.className as string[] | undefined) ?? []
	const langClass = classNames.find((c) => String(c).startsWith('language-'))
	return langClass ? String(langClass).replace(/^language-/, '') : undefined
}

// hast: turn <pre><code> fences into self-highlighting <z-code-block>.
const rehypeCodeBlocks = () => (tree: AnyNode) => {
	visit(tree, 'element', (node: AnyNode) => {
		if (node.tagName !== 'pre') return
		const codeEl = node.children?.find((c) => c.type === 'element' && c.tagName === 'code')
		if (!codeEl) return

		const code = nodeText(codeEl).replace(/\n$/, '')
		const language = languageOf(codeEl)
		const filename = codeEl.properties?.dataFilename as string | undefined

		node.tagName = 'z-code-block'
		node.properties = { code, ...(language ? { language } : {}), ...(filename ? { filename } : {}) }
		node.children = []
	})
}

// hast: inline markdown links become z-link, so they pick up the zest tone/
// underline treatment instead of a bare browser anchor.
const rehypeLinks = () => (tree: AnyNode) => {
	visit(tree, 'element', (node: AnyNode) => {
		if (node.tagName !== 'a') return
		node.tagName = 'z-link'
		node.properties = { ...node.properties, tone: 'primary' }
	})
}

// Sized for in-article section heads, not hero/marketing copy — e.g. the
// typography page's own article body uses size="sm" for an h2, not xl.
const HEADING_SIZE_BY_TAG: Record<string, string> = {
	h1: 'md',
	h2: 'sm',
	h3: 'xs',
	h4: 'xs',
	h5: 'xs',
	h6: 'xs'
}

// The heading size scale bottoms out at `xs`, so h4–h6 would all render at the
// same 1.5× step. These classes let .Prose step them down below h3 (see the
// `--base-font-size` overrides in styles.css).
const HEADING_CLASS_BY_TAG: Record<string, string> = {
	h4: 'zHeadingH4',
	h5: 'zHeadingH5',
	h6: 'zHeadingH6'
}

// hast: top-level paragraphs/headings that weren't already rewritten by a
// custom marker become z-text/z-heading, so default prose gets real
// typography-component sizing and color (muted body, bold headings) instead
// of bare <p>/<hN> with no styling. Only the document's direct children are
// touched — paragraphs nested in lists/blockquotes stay plain and are styled
// via `.Prose` instead.
const styleDefaultTypography = (children: AnyNode[]): void => {
	for (const node of children) {
		if (node.type !== 'element' || !node.tagName) continue

		// Folder contents are the folder's own direct children, so style them
		// the same as top-level prose (skipping the <summary> title itself).
		if (node.tagName === 'details') {
			styleDefaultTypography((node.children ?? []).filter((c) => c.tagName !== 'summary'))
			continue
		}

		if ((node.properties?.className as unknown[] | string | undefined)?.length) continue

		if (node.tagName === 'p') {
			node.tagName = 'z-text'
			node.properties = { ...node.properties, size: 'md', color: 'muted', tag: 'p' }
			continue
		}

		const size = HEADING_SIZE_BY_TAG[node.tagName]
		if (!size) continue
		const tag = node.tagName
		const className = HEADING_CLASS_BY_TAG[tag]
		node.tagName = 'z-heading'
		node.properties = { ...node.properties, size, tag, ...(className ? { className: [className] } : {}) }
	}
}

const rehypeDefaultTypography = () => (tree: AnyNode) => {
	styleDefaultTypography(tree.children ?? [])
}

// Built per-call since `!META`'s attributes depend on the post passed in.
const buildProcessor = (meta?: PostMetaT) =>
	unified()
		.use(remarkParse)
		.use(remarkGfm)
		.use(remarkFolders)
		.use(remarkCustomParagraphs(meta))
		.use(remarkCodeFilename)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeCodeBlocks)
		.use(rehypeLinks)
		.use(rehypeSlug)
		.use(rehypeDefaultTypography)
		.use(rehypeStringify, { allowDangerousHtml: true })

export const renderMarkdown = async (content: string, meta?: PostMetaT): Promise<string> => {
	const result = await buildProcessor(meta).process(content)
	return String(result)
}
