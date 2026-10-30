import type { ReactNode } from 'react'

/* Long-form docs pages (Setup, parts of System): a measured column of prose
   with real headings, inline code, and code blocks. Styles: .DocsArticle in docs.css. */

export const Article = ({
	eyebrow,
	title,
	lede,
	children
}: {
	eyebrow: string
	title: string
	lede?: ReactNode
	children: ReactNode
}) => (
	<article className="DocsArticle">
		<z-eyebrow hasRule>{eyebrow}</z-eyebrow>
		<h1>{title}</h1>
		{lede && <p className="DocsLede">{lede}</p>}
		{children}
	</article>
)

export const Code = ({ code, language = 'html', filename }: { code: string; language?: string; filename?: string }) => (
	<div className="DocsCode">
		<z-code-block code={code.trim() + '\n'} language={language} filename={filename} />
	</div>
)

/** A plain reference table: first column rendered as code. */
export const RefTable = ({ head, rows }: { head: string[]; rows: ReactNode[][] }) => (
	<div className="DocsTable">
		<table>
			<thead>
				<tr>
					{head.map((h) => (
						<th key={h}>{h}</th>
					))}
				</tr>
			</thead>
			<tbody>
				{rows.map((row, i) => (
					<tr key={i}>
						{row.map((cell, j) => (
							<td key={j}>{j === 0 ? <code>{cell}</code> : cell}</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	</div>
)
