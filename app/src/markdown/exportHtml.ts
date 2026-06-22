// Standalone HTML export for a post. Inlines the compiled zest component
// library (so <z-*> elements upgrade and render their shadow DOM exactly as
// they do in the live preview) alongside the blog chrome CSS that styles
// `.Prose`, then triggers a browser download — no server round-trip needed.
import zestJs from '@zest/zesty-wc.js?raw'
import zestCss from '@zest/zesty-wc.css?raw'
import siteCss from '@app/site/site.css?raw'
import blogCss from '@app/styles.css?raw'

const escapeHtml = (text: string): string =>
	text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const slugifyFilename = (title: string): string => {
	const slug = title
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
	return slug || 'untitled'
}

export const buildExportHtml = (title: string, bodyHtml: string): string => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<style>${zestCss}</style>
<style>${siteCss}</style>
<style>${blogCss}</style>
<style>
body { padding: 3rem clamp(1.5rem, 8vw, 6rem); }
.Prose { max-width: 52rem; margin: 0 auto; padding-bottom: 64px; }
</style>
</head>
<body>
<div class="Prose"><z-heading size="md" color="white" tag="h1">${escapeHtml(title)}</z-heading><z-separator style="margin-bottom: 2rem;"></z-separator>${bodyHtml}</div>
<script type="module">${zestJs}</script>
</body>
</html>
`

export const downloadPostHtml = (title: string, bodyHtml: string): void => {
	const html = buildExportHtml(title, bodyHtml)
	const blob = new Blob([html], { type: 'text/html' })
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = url
	link.download = `${slugifyFilename(title)}.html`
	link.click()
	URL.revokeObjectURL(url)
}
