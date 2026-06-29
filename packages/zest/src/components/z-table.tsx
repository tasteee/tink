import { c, css, event } from 'atomico'

/*
 * z-table — a data table driven by `columns` and `rows` properties:
 *   el.columns = [{ key, label, align?, isMono? }]
 *   el.rows    = [{ id?, ... }]
 * Header is uppercase, tracked, muted. Rows are separated by hairline borders
 * and tint softly on hover. Borders over fills — no shadows, no zebra unless
 * is-striped is set. Clicking a row emits `rowclick`.
 */
const styles = css`
	:host {
		display: block;
		width: 100%;
	}

	:host([is-hidden]) {
		display: none;
	}

	.wrap {
		width: 100%;
		overflow-x: auto;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-family: inherit;
	}

	thead th {
		text-align: left;
		padding: 0.875rem 1.125rem;
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--muted-foreground);
		border-bottom: 1px solid var(--border);
		white-space: nowrap;
	}

	tbody td {
		padding: 0.9375rem 1.125rem;
		font-size: 0.875rem;
		color: var(--foreground);
		border-bottom: 1px solid var(--border);
		vertical-align: middle;
	}

	tbody tr:last-child td {
		border-bottom: none;
	}

	:host([is-clickable]) tbody tr {
		cursor: pointer;
	}

	tbody tr {
		transition: background-color 0.1s ease;
	}
	tbody tr:hover {
		background: color-mix(in oklch, var(--foreground) 4%, transparent);
	}

	:host([is-striped]) tbody tr:nth-child(even) {
		background: color-mix(in oklch, var(--foreground) 3%, transparent);
	}

	.align-end {
		text-align: right;
	}
	.align-center {
		text-align: center;
	}
	.is-mono {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
	}

	.empty {
		padding: 2.5rem;
		text-align: center;
		color: var(--muted-foreground);
		font-size: 0.875rem;
	}
`

type ColumnT = { key: string; label: string; align?: 'start' | 'center' | 'end'; isMono?: boolean }
type RowT = Record<string, unknown> & { id?: string | number }

export const ZTable = c(
	(props) => {
		const columns: ColumnT[] = Array.isArray(props.columns) ? (props.columns as ColumnT[]) : []
		const rows: RowT[] = Array.isArray(props.rows) ? (props.rows as RowT[]) : []

		const cellClass = (col: ColumnT) =>
			[col.align ? `align-${col.align}` : '', col.isMono ? 'is-mono' : ''].filter(Boolean).join(' ') || undefined

		return (
			<host shadowDom>
				<div class="wrap">
					<table>
						<thead>
							<tr>
								{columns.map((col) => (
									<th key={col.key} class={col.align ? `align-${col.align}` : undefined}>
										{col.label}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{rows.length === 0 ? (
								<tr>
									<td class="empty" colspan={String(columns.length || 1)}>
										{props.emptyLabel || 'No data'}
									</td>
								</tr>
							) : (
								rows.map((row, index) => (
									<tr
										key={(row.id as any) ?? index}
										onclick={() => props.isClickable && props.rowclick({ row, index })}
									>
										{columns.map((col) => (
											<td key={col.key} class={cellClass(col)}>
												{String(row[col.key] ?? '')}
											</td>
										))}
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</host>
		)
	},
	{
		props: {
			columns: { type: Array },
			rows: { type: Array },
			emptyLabel: String,
			isStriped: { type: Boolean, reflect: true },
			isClickable: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			rowclick: event<{ row: RowT; index: number }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-table', ZTable)
