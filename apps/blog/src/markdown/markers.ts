// Custom block markers for the blog's markdown. A paragraph that STARTS with one
// of these tokens is turned into a real zest typography element (z-text /
// z-heading / z-subheading) with the right size/color/tag attributes, so the
// marker picks an actual component variant instead of a bare styled <p>.
// A few non-typography markers (callouts, dividers, todos) stay plain
// elements with utility classes — see the `.Prose` rules in styles.css.

export type MarkerDefinitionT = {
	element?: string
	classes?: string
	attributes?: Record<string, string>
	isAriaHidden?: boolean
	consumeLine?: boolean
	marker?: string
}

export const customMarkers: Record<string, MarkerDefinitionT> = {
	'!BIG': { element: 'z-text', attributes: { size: 'xl', tag: 'p' } },
	'!SMALL': { element: 'z-text', classes: 'isSmallMuted', attributes: { size: 'sm', color: 'muted', tag: 'p' } },
	'!CAPS': { element: 'z-subheading', attributes: { size: 'sm', tag: 'p' } },
	'!CAPTION': { element: 'z-text', attributes: { size: 'xs', color: 'muted', tag: 'p' } },
	'!CENTER': { element: 'z-text', classes: 'isCenteredBlock', attributes: { size: 'lg', color: 'muted', tag: 'p' } },
	'!QUOTE': { element: 'z-heading', classes: 'zQuote', attributes: { size: 'xs', color: 'primary', tag: 'p' } },
	// The category label above a post's title — `!EYEBROW Platform · Engineering`.
	// Keeps the trailing text as its content, same as !CAPS/!BIG.
	'!EYEBROW': { element: 'z-subheading', classes: 'zEyebrow', attributes: { size: 'sm', color: 'primary', tag: 'p' } },
	// Short aliases for the common callout types — same shape as `!CALLOUT:<type>`
	// below, kept as fixed keys since these three cover the vast majority of use.
	'!NOTE': { element: 'p', classes: 'callout callout-note' },
	'!TIP': { element: 'p', classes: 'callout callout-tip' },
	'!WARNING': { element: 'p', classes: 'callout callout-warning' },
	'!TODO': { element: 'p', classes: 'zTodo' },
	'!LINE': { element: 'hr', classes: 'zDivider' },
	'!H1': { element: 'z-heading', attributes: { size: 'xxl', tag: 'h1' } },
	'!H2': { element: 'z-heading', attributes: { size: 'xl', tag: 'h2' } },
	'!H3': { element: 'z-heading', attributes: { size: 'lg', tag: 'h3' } },
	'!H4': { element: 'z-heading', attributes: { size: 'md', tag: 'h4' } },
	'!H5': { element: 'z-heading', attributes: { size: 'sm', tag: 'h5' } },
	'!H6': { element: 'z-heading', attributes: { size: 'xs', tag: 'h6' } },
	'!BASH': { element: 'pre', classes: 'zCodeBash', attributes: { 'data-language': 'bash' } }
}

const SPACER_REGEX = /^!SPACER(\d+)/
const CALLOUT_REGEX = /^!CALLOUT:(\w+)/

// `!CALLOUT:<type>` covers any callout beyond the !NOTE/!TIP/!WARNING aliases
// above — e.g. `!CALLOUT:success`. The type just becomes a `callout-<type>`
// class; give it an accent in styles.css (`.callout-<type> { --callout-accent: ... }`)
// or it falls back to the default accent color.
export const matchDynamicMarkerDefinition = (value: string): MarkerDefinitionT | null => {
	const spacerMatch = value.match(SPACER_REGEX)
	if (spacerMatch) {
		const units = Number.parseInt(spacerMatch[1], 10)
		return {
			marker: spacerMatch[0],
			classes: 'zSpacer',
			element: 'div',
			attributes: { style: `height: ${units * 0.25}rem` },
			isAriaHidden: true,
			consumeLine: true
		}
	}

	const calloutMatch = value.match(CALLOUT_REGEX)
	if (calloutMatch) {
		const type = calloutMatch[1].toLowerCase()
		return {
			marker: calloutMatch[0],
			element: 'p',
			classes: `callout callout-${type}`
		}
	}

	return null
}

// `!META` on its own line drops in the byline block — avatar, author name,
// publish date, and the tag cloud. Unlike the markers above, its content comes
// from the post record rather than the markdown text, so it's matched and
// turned into <z-post-meta> directly in renderMarkdown.ts (the one place that
// already has that data) instead of living in `customMarkers`.
export const META_MARKER = '!META'
