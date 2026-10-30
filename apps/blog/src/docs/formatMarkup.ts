// Pretty-prints the one-line markup strings used as docs example code, so the
// code view shows one element per line with nested children indented.

type MarkupTokenKindT = 'open' | 'close' | 'selfClosing' | 'text'
type MarkupTokenT = { kind: MarkupTokenKindT; raw: string; name: string }

type MarkupNodeT = {
	name: string
	openRaw: string
	closeRaw: string
	isSelfClosing: boolean
	text: string
	isText: boolean
	children: MarkupNodeT[]
}

const INDENT = '  '
const MAX_LINE_LENGTH = 80
const VOID_TAGS = ['area', 'br', 'hr', 'img', 'input', 'link', 'meta', 'source', 'wbr']
const PRESERVE_TAGS = ['pre', 'textarea', 'z-code-block', 'z-terminal', 'z-markdown']

const isTagStart = (code: string, index: number): boolean => {
	const nextCharacter = code[index + 1] ?? ''
	const isOpeningTag = /[A-Za-z]/.test(nextCharacter)
	const isClosingTag = nextCharacter === '/'
	return code[index] === '<' && (isOpeningTag || isClosingTag)
}

// Finds the end of a tag, skipping quoted strings and {expression} blocks so a
// `>` inside an attribute value does not end the tag early.
const findTagEnd = (code: string, startIndex: number): number => {
	let quote = ''
	let braceDepth = 0
	for (const [offset, character] of code.slice(startIndex).split('').entries()) {
		const isInsideQuote = quote !== ''
		if (isInsideQuote && character === quote) quote = ''
		if (isInsideQuote) continue

		const isQuote = character === '"' || character === "'" || character === '`'
		if (isQuote) quote = character
		if (character === '{') braceDepth += 1
		if (character === '}') braceDepth -= 1
		const isTagEnd = character === '>' && braceDepth === 0
		if (isTagEnd) return startIndex + offset
	}
	return code.length - 1
}

// Finds the end of a text run. Text ends at the next tag, but a {expression}
// block is kept whole even when it contains tags of its own.
const findTextEnd = (code: string, startIndex: number): number => {
	let braceDepth = 0
	for (const [offset, character] of code.slice(startIndex).split('').entries()) {
		if (character === '{') braceDepth += 1
		if (character === '}') braceDepth -= 1
		const isTagBoundary = braceDepth === 0 && isTagStart(code, startIndex + offset)
		if (isTagBoundary) return startIndex + offset
	}
	return code.length
}

const readTagName = (raw: string): string => {
	const match = raw.match(/^<\/?([A-Za-z][\w:-]*)/)
	return match ? match[1] : ''
}

const classifyTag = (raw: string, name: string): MarkupTokenKindT => {
	const isClosing = raw.startsWith('</')
	if (isClosing) return 'close'
	const isSelfClosing = raw.endsWith('/>') || VOID_TAGS.includes(name)
	return isSelfClosing ? 'selfClosing' : 'open'
}

// Reads one token, then the rest of the string, so no loop counter is needed.
const readTokens = (code: string, startIndex: number, tokens: MarkupTokenT[]): MarkupTokenT[] => {
	const isFinished = startIndex >= code.length
	if (isFinished) return tokens

	const isTag = isTagStart(code, startIndex)
	const endIndex = isTag ? findTagEnd(code, startIndex) + 1 : findTextEnd(code, startIndex)
	const raw = code.slice(startIndex, endIndex)
	const name = isTag ? readTagName(raw) : ''
	const kind = isTag ? classifyTag(raw, name) : 'text'
	return readTokens(code, endIndex, [...tokens, { kind, raw, name }])
}

const tokenize = (code: string): MarkupTokenT[] => {
	return readTokens(code, 0, [])
}

const createNode = (token: MarkupTokenT): MarkupNodeT => {
	const isText = token.kind === 'text'
	const isSelfClosing = token.kind === 'selfClosing'
	return {
		name: token.name,
		openRaw: isText ? '' : token.raw,
		closeRaw: '',
		isSelfClosing,
		text: isText ? token.raw : '',
		isText,
		children: []
	}
}

const buildTree = (tokens: MarkupTokenT[]): MarkupNodeT[] => {
	const roots: MarkupNodeT[] = []
	const stack: MarkupNodeT[] = []
	for (const token of tokens) {
		const parent = stack[stack.length - 1]
		const siblings = parent ? parent.children : roots

		if (token.kind === 'close') {
			const matchesParent = Boolean(parent) && parent.name === token.name
			if (matchesParent) parent.closeRaw = token.raw
			if (matchesParent) stack.pop()
			continue
		}

		const node = createNode(token)
		const isBlankText = node.isText && node.text.trim() === ''
		if (isBlankText) continue
		siblings.push(node)
		if (token.kind === 'open') stack.push(node)
	}
	return roots
}

const collapseWhitespace = (text: string): string => {
	return text.replace(/\s+/g, ' ').trim()
}

// Splits `<tag a="1" b={x}>` into its tag name, attributes, and closing bracket.
const splitAttributes = (openRaw: string): string[] => {
	const attributes: string[] = []
	const inner = openRaw.replace(/^<[\w:-]+/, '').replace(/\/?>$/, '')
	let current = ''
	let quote = ''
	let braceDepth = 0
	for (const character of inner) {
		const isInsideQuote = quote !== ''
		if (isInsideQuote && character === quote) quote = ''
		const isQuote = !isInsideQuote && (character === '"' || character === "'" || character === '`')
		if (isQuote) quote = character
		if (!isInsideQuote && character === '{') braceDepth += 1
		if (!isInsideQuote && character === '}') braceDepth -= 1
		const isSeparator = /\s/.test(character) && !isInsideQuote && braceDepth === 0
		if (isSeparator && current !== '') attributes.push(current)
		if (isSeparator) current = ''
		if (!isSeparator) current += character
	}
	if (current !== '') attributes.push(current)
	return attributes
}

const formatOpenTag = (node: MarkupNodeT, depth: number): string[] => {
	const indent = INDENT.repeat(depth)
	const flat = collapseWhitespace(node.openRaw)
	const fitsOnLine = indent.length + flat.length <= MAX_LINE_LENGTH
	if (fitsOnLine) return [indent + flat]

	const attributes = splitAttributes(node.openRaw)
	const hasAttributes = attributes.length > 0
	if (!hasAttributes) return [indent + flat]

	const closer = node.openRaw.endsWith('/>') ? '/>' : '>'
	const attributeLines = attributes.map((attribute: string) => indent + INDENT + attribute)
	return [indent + '<' + node.name, ...attributeLines, indent + closer]
}

const formatPreserved = (node: MarkupNodeT, depth: number): string[] => {
	const indent = INDENT.repeat(depth)
	const rawChildren = node.children.map((child: MarkupNodeT) => (child.isText ? child.text : renderRaw(child)))
	return [indent + collapseWhitespace(node.openRaw) + rawChildren.join('') + node.closeRaw]
}

const renderRaw = (node: MarkupNodeT): string => {
	if (node.isText) return node.text
	const childrenRaw = node.children.map(renderRaw).join('')
	return node.openRaw + childrenRaw + node.closeRaw
}

const formatNode = (node: MarkupNodeT, depth: number): string[] => {
	const indent = INDENT.repeat(depth)
	if (node.isText) return [indent + collapseWhitespace(node.text)]
	if (node.isSelfClosing) return formatOpenTag(node, depth)

	const isPreserved = PRESERVE_TAGS.includes(node.name)
	if (isPreserved) return formatPreserved(node, depth)

	const hasOnlyText = node.children.every((child: MarkupNodeT) => child.isText)
	const hasChildren = node.children.length > 0
	const inlineText = node.children.map((child: MarkupNodeT) => collapseWhitespace(child.text)).join(' ')
	const inlineLine = indent + collapseWhitespace(node.openRaw) + inlineText + node.closeRaw
	const fitsInline = hasOnlyText && inlineLine.length <= MAX_LINE_LENGTH
	if (fitsInline) return [inlineLine]

	const openLines = formatOpenTag(node, depth)
	const childLines = node.children.flatMap((child: MarkupNodeT) => formatNode(child, depth + 1))
	const closeLine = indent + node.closeRaw
	if (!hasChildren) return [openLines.join('\n') + node.closeRaw]
	return [...openLines, ...childLines, closeLine]
}

export const formatMarkup = (code: string): string => {
	const trimmed = code.trim()
	const isMarkup = trimmed.startsWith('<')
	if (!isMarkup) return trimmed

	const tree = buildTree(tokenize(trimmed))
	const lines = tree.flatMap((node: MarkupNodeT) => formatNode(node, 0))
	return lines.join('\n')
}
