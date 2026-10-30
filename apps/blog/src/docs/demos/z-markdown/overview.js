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

const markdown = document.querySelector('#markdown')
markdown.content = SAMPLE
