import { ComponentDoc } from '@app/docs/ComponentDoc'

const SAMPLE = `## Markdown, themed

Renders **bold**, _italic_, \`inline code\`, ~~strikethrough~~, and
[links](https://example.com) with the ink tokens.

- Bullet lists
- With items

> Blockquotes are styled too.

\`\`\`ts
const greet = (name: string) => \`Hi \${name}\`
\`\`\`
`

export const ZMarkdownDoc = () => (
	<ComponentDoc
		tag="z-markdown"
		category="Specialized"
		description="A GFM markdown renderer that composes z-code-block for fenced code, sanitizes dangerous HTML, and hardens external links. Set is-streaming while tokens arrive; the shared renderer behind chat, blog, and docs."
	>
		<div className="block">
			<div className="panel">
				<z-markdown content={SAMPLE} />
			</div>
		</div>

		<div className="block">
			<h3>Inline</h3>
			<div className="panel">
				<z-markdown content="Set the `content` property (string). Supports **emphasis**, `code`, and [links](https://example.com)." />
			</div>
		</div>
	</ComponentDoc>
)
