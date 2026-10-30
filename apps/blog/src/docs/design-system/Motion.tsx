import { Article, Code } from '@app/docs/Prose'
import { DocExample } from '@app/docs/DocExample'

const DURATIONS = [
	['--motion-instant', '80ms', 'Hover, press, color changes'],
	['--motion-fast', '140ms', 'Tooltips, menus, popovers'],
	['--motion-base', '200ms', 'Dialogs, toasts, command palette'],
	['--motion-slow', '280ms', 'Sheets and drawers (edge-anchored, travel far)']
]

const EXITS = [
	['--motion-exit-fast', '100ms', 'Floating surfaces, menus'],
	['--motion-exit-base', '140ms', 'Dialogs, toasts'],
	['--motion-exit-slow', '200ms', 'Sheets, drawers']
]

const CURVES = [
	['--ease-enter', 'cubic-bezier(0.22, 1, 0.36, 1)', 'Decelerates into place. Everything that arrives.'],
	['--ease-exit', 'cubic-bezier(0.3, 0, 0.7, 0.4)', 'Moves at once, then accelerates away. Everything that leaves.'],
	['--ease-move', 'cubic-bezier(0.65, 0, 0.35, 1)', 'Eases both ends. Things travelling between two resting places.']
]

const TokenTable = ({ rows, head }: { rows: string[][]; head: string[] }) => (
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
				{rows.map((row) => (
					<tr key={row[0]}>
						<td>
							<code>{row[0]}</code>
						</td>
						<td>
							<code>{row[1]}</code>
						</td>
						<td>{row[2]}</td>
					</tr>
				))}
			</tbody>
		</table>
	</div>
)

export const Motion = () => (
	<Article
		eyebrow="System"
		title="Motion"
		lede="One scale for every element, so a tooltip, a toast, and a sheet all feel like the same product. Motion confirms cause and effect; it never decorates."
	>
		<DocExample
			demo="system/motion-exits"
			title="Exits are designed, not skipped"
			description="Every surface stays rendered until its exit finishes, and leaves along the path it arrived on. Try each one."
		/>

		<h2>Durations</h2>
		<p>Duration scales with how far a surface travels and how much of the screen it claims.</p>
		<TokenTable head={['Token', 'Value', 'Use for']} rows={DURATIONS} />

		<h2>Exits</h2>
		<p>
			Exits run at roughly 70% of their entrance: the user already decided, so get out of the way, but never vanish in a
			single frame.
		</p>
		<TokenTable head={['Token', 'Value', 'Use for']} rows={EXITS} />

		<h2>Curves</h2>
		<TokenTable head={['Token', 'Value', 'Character']} rows={CURVES} />

		<h2>Rules</h2>
		<ul>
			<li>
				<strong>Retrace on exit.</strong> A sheet slides back to its edge; a dialog sinks the 8px it rose; a popover shrinks
				toward its anchor.
			</li>
			<li>
				<strong>Travel by size.</strong> Small floaters move <code>--motion-distance-sm</code> (4px), toasts and dialogs{' '}
				<code>--motion-distance-md</code> (8px), sheets their own size. Floaters scale from <code>--motion-scale-from</code>{' '}
				(0.97).
			</li>
			<li>
				<strong>Interruptible.</strong> Use transitions, not one-shot keyframes, for anything that can reverse. Reopening
				mid-exit turns around from wherever it is.
			</li>
			<li>
				<strong>Stagger lightly.</strong> <code>--motion-stagger</code> (30ms) between siblings, five at most. Beyond that,
				animate the group.
			</li>
			<li>
				<strong>Feedback first.</strong> A menu pick double-flashes its row (two 100ms flashes) before it closes and fires{' '}
				<code>select</code>, so the result never appears on top of an unconfirmed choice.
			</li>
		</ul>

		<h2>Reduced motion</h2>
		<p>
			Under <code>prefers-reduced-motion: reduce</code>, <code>--motion-travel</code> becomes 0 and{' '}
			<code>--motion-scale-from</code> becomes 1. Every fade still runs, so state changes stay legible, but nothing moves or
			zooms. Menu flashes are skipped.
		</p>

		<h2>Building with the tokens</h2>
		<Code
			language="css"
			code={`
.panel {
  opacity: 0;
  translate: 0 calc(var(--motion-distance-md) * var(--motion-travel));
  transition:
    opacity var(--motion-exit-base) var(--ease-exit),
    translate var(--motion-exit-base) var(--ease-exit);
}

.panel[data-state='open'] {
  opacity: 1;
  translate: 0 0;
  transition:
    opacity var(--motion-base) var(--ease-enter),
    translate var(--motion-base) var(--ease-enter);
}
`}
		/>
	</Article>
)
