import type { ComponentType } from 'react'
import { DocExample } from '@app/docs/DocExample'

/*
 * Blocks: recipes that compose elements into real interfaces. Each block is
 * one or more demos under demos/blocks/, rendered and shown verbatim.
 */

type BlockDemoT = { demo: string; title: string; description?: string; isContained?: boolean }
export type BlockT = {
	slug: string
	title: string
	summary: string
	keywords?: string
	demos: BlockDemoT[]
	Component: ComponentType
}
export type BlockGroupT = { label: string; items: BlockT[] }

const block = (slug: string, title: string, summary: string, demos: BlockDemoT[], keywords?: string): BlockT => ({
	slug,
	title,
	summary,
	keywords,
	demos,
	Component: () => (
		<div className="DocsArticle">
			<z-eyebrow hasRule>Block</z-eyebrow>
			<h1>{title}</h1>
			<p className="DocsLede">{summary}</p>
			{demos.map((d) => (
				<DocExample key={d.demo} {...d} />
			))}
		</div>
	)
})

export const BLOCKS: BlockGroupT[] = [
	{
		label: 'Application',
		items: [
			block(
				'app-shell',
				'App shell',
				'A sidebar-led application frame: brand and account pinned in the sidebar’s header and footer, nested project groups, and a content region that follows the selection.',
				[
					{
						demo: 'blocks/app-shell',
						title: 'Sidebar + content',
						description:
							'The sidebar fills the shell’s height and scrolls its own nav; the page decides what each value shows.'
					}
				],
				'layout sidebar navigation frame'
			),
			block(
				'settings-panel',
				'Settings panel',
				'Tabs as a pure controller: the panels live outside z-tabs and simply follow its value, with a sticky action row underneath.',
				[
					{
						demo: 'blocks/settings-panel',
						title: 'Tabbed settings',
						description: 'Listen for change on z-tabs and show the matching section, wherever it lives in the tree.'
					}
				],
				'tabs form preferences'
			)
		]
	},
	{
		label: 'Forms',
		items: [
			block(
				'sign-in',
				'Sign in',
				'A compact authentication card: labelled fields, a remember-me choice, a pending submit state, and a secondary provider.',
				[
					{
						demo: 'blocks/sign-in',
						title: 'Email and password',
						description: 'Submitting shows the button’s loading state, then confirms with a toast.'
					}
				],
				'auth login authentication'
			)
		]
	},
	{
		label: 'Feedback',
		items: [
			block(
				'upload-progress',
				'Upload progress',
				'One toast id per job, updated in place from progress to outcome, so a long task never floods the stack.',
				[
					{
						demo: 'blocks/upload-progress',
						title: 'Progress to result',
						description: 'Re-showing an active id updates that toast and restarts its countdown.'
					}
				],
				'toast toaster notification'
			),
			block(
				'empty-state',
				'Empty state',
				'The first-run screen for a collection: what belongs here, and the one or two ways to start.',
				[{ demo: 'blocks/empty-state', title: 'No projects yet' }],
				'blank zero first run'
			)
		]
	},
	{
		label: 'Overlays',
		items: [
			block(
				'command-palette',
				'Command palette',
				'Rich, declarative command rows (avatars, badges, shortcuts), grouped results, a custom empty state, and a hint footer.',
				[
					{
						demo: 'blocks/command-palette',
						title: 'Composed palette',
						description: 'Each z-command-item’s own content becomes its row; filtering uses its label or text.'
					}
				],
				'search cmdk spotlight'
			),
			block(
				'row-actions',
				'Row actions',
				'An overflow menu on a list row that routes its destructive action through a confirmation dialog.',
				[
					{
						demo: 'blocks/row-actions',
						title: 'Menu into confirmation',
						description: 'The menu confirms the pick with a double flash, then the dialog takes over.'
					}
				],
				'menu dropdown delete confirm'
			)
		]
	}
]
