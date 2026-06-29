/*
 * Syntax highlighting for z-code-block, backed by lowlight (the highlight.js
 * core that returns a hast tree instead of an HTML string). We flatten that
 * tree into a flat list of { className, value } tokens so they render as real
 * atomico nodes (no innerHTML) and split cleanly across lines for the gutter.
 *
 * Tokens keep their original `hljs-*` class names; z-code-block maps those onto
 * the zest `--syntax-*` palette (see tokens.css) for a theme that matches the
 * design system.
 */

import { createLowlight } from 'lowlight'
import type { Root, Element, RootContent } from 'hast'
import typescript from 'highlight.js/lib/languages/typescript'
import javascript from 'highlight.js/lib/languages/javascript'
import css from 'highlight.js/lib/languages/css'
import scss from 'highlight.js/lib/languages/scss'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'
import markdown from 'highlight.js/lib/languages/markdown'

// Only register the grammars the docs use — keeps the bundle small versus
// lowlight's full `common` set (~37 languages). Add more here as needed.
const lowlight = createLowlight({
	typescript,
	javascript,
	css,
	scss,
	json,
	bash,
	xml,
	yaml,
	markdown
})

export type Token = { className: string; value: string }

// Map the language tags the docs use onto highlight.js language names/aliases.
const LANG_ALIASES: Record<string, string> = {
	ts: 'typescript',
	tsx: 'typescript',
	mts: 'typescript',
	cts: 'typescript',
	js: 'javascript',
	jsx: 'javascript',
	mjs: 'javascript',
	cjs: 'javascript',
	sh: 'bash',
	shell: 'bash',
	zsh: 'bash',
	console: 'bash',
	html: 'xml',
	svg: 'xml',
	vue: 'xml',
	jsonc: 'json',
	yml: 'yaml'
}

const resolveLang = (language?: string): string | null => {
	const key = (language ?? '').trim().toLowerCase()
	if (!key) return null
	const name = LANG_ALIASES[key] ?? key
	return lowlight.registered(name) ? name : null
}

const flatten = (node: Root | RootContent, inherited: string, out: Token[]) => {
	if (node.type === 'text') {
		if (node.value) out.push({ className: inherited, value: node.value })
		return
	}
	if (node.type === 'element') {
		const own = (node as Element).properties?.className
		const classes = Array.isArray(own) ? own.join(' ') : ''
		const next = inherited && classes ? `${inherited} ${classes}` : inherited || classes
		for (const child of node.children) flatten(child, next, out)
		return
	}
	if (node.type === 'root') {
		for (const child of node.children) flatten(child, inherited, out)
	}
}

/*
 * highlight.js leaves most punctuation/operators (parens, brackets, <>, dots,
 * commas, `=`, arrows, …) as unclassed text, so they'd render at full
 * foreground brightness. Split those runs out of plain tokens and tag them
 * `hljs-punctuation` so the theme can dim them. Only unclassed tokens are
 * touched — punctuation inside strings/comments keeps its own color.
 */
const PUNCT_RE = /([(){}\[\]<>.,;:=+\-*\/%!&|^~?]+)/g

const dimPunctuation = (tokens: Token[]): Token[] => {
	const out: Token[] = []
	for (const token of tokens) {
		if (token.className) {
			out.push(token)
			continue
		}
		let last = 0
		PUNCT_RE.lastIndex = 0
		for (let m = PUNCT_RE.exec(token.value); m; m = PUNCT_RE.exec(token.value)) {
			if (m.index > last) out.push({ className: '', value: token.value.slice(last, m.index) })
			out.push({ className: 'hljs-punctuation', value: m[0] })
			last = PUNCT_RE.lastIndex
		}
		if (last < token.value.length) out.push({ className: '', value: token.value.slice(last) })
	}
	return out
}

// highlightAuto gives up and returns an empty tree (relevance: 0) when the
// code doesn't confidently match any registered grammar — e.g. plain prose
// tagged ```txt. Detect that and fall back to rendering the text unhighlighted
// rather than silently dropping it.
export const highlight = (code: string, language?: string): Token[] => {
	if (!code) return []
	const lang = resolveLang(language)
	if (lang) {
		const out: Token[] = []
		flatten(lowlight.highlight(lang, code), '', out)
		return dimPunctuation(out)
	}
	const auto = lowlight.highlightAuto(code)
	if (auto.children.length === 0) return [{ className: '', value: code }]
	const out: Token[] = []
	flatten(auto, '', out)
	return dimPunctuation(out)
}

/*
 * Split tokens into lines for the line-number gutter. A single token may span
 * multiple lines (block comments, template literals), so we break token values
 * on '\n' rather than splitting the raw source.
 */
export const splitTokenLines = (tokens: Token[]): Token[][] => {
	const lines: Token[][] = [[]]
	for (const token of tokens) {
		const parts = token.value.split('\n')
		parts.forEach((part, index) => {
			if (index > 0) lines.push([])
			if (part) lines[lines.length - 1].push({ className: token.className, value: part })
		})
	}
	return lines
}
