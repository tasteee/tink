import type { ComponentType } from 'react'
import { ELEMENT_DOCS } from '@app/docs/components/manifest'
import { Introduction } from '@app/docs/setup/Introduction'
import { Installation } from '@app/docs/setup/Installation'
import { UsageHtml, UsageReact, UsageSvelte } from '@app/docs/setup/Usage'
import { Theming } from '@app/docs/setup/Theming'
import { TypeScriptSetup } from '@app/docs/setup/TypeScriptSetup'
import { Rules } from '@app/docs/design-system/Rules'
import { Color } from '@app/docs/design-system/Color'
import { Typography } from '@app/docs/Typography'
import { Spacing } from '@app/docs/design-system/Spacing'
import { Layout } from '@app/docs/Layout'
import { Motion } from '@app/docs/design-system/Motion'
import { Accessibility } from '@app/docs/design-system/Accessibility'
import { Patterns } from '@app/docs/design-system/Patterns'
import { BLOCKS } from '@app/docs/blocks/blocks'

/*
 * The docs information architecture, one source for the top bar, every
 * section's sidebar, the routes, and ⌘K search.
 *
 *   Setup     get Zest running in a project
 *   System    the design language underneath: tokens, rules, motion
 *   Elements  every z element, one page each
 *   Blocks    recipes composing elements into real interfaces
 */

export type DocPageT = { slug: string; label: string; Component: ComponentType; keywords?: string }
export type DocGroupT = { label: string; items: Array<DocPageT | DocGroupT> }
export type SectionIdT = 'setup' | 'system' | 'elements' | 'blocks'
export type SectionT = { id: SectionIdT; label: string; blurb: string; nav: Array<DocPageT | DocGroupT> }

export const isGroup = (entry: DocPageT | DocGroupT): entry is DocGroupT => 'items' in entry

const element = (slug: string): DocPageT => {
	const Component = ELEMENT_DOCS[slug]
	if (!Component) throw new Error(`docs nav: no element doc for ${slug}`)
	return { slug, label: slug, Component }
}

const elements = (...slugs: string[]) => slugs.map(element)

const SETUP: SectionT = {
	id: 'setup',
	label: 'Setup',
	blurb: 'Install Zest, wire it into your stack, and make it yours.',
	nav: [
		{
			label: 'Getting started',
			items: [
				{ slug: 'introduction', label: 'Introduction', Component: Introduction },
				{ slug: 'installation', label: 'Installation', Component: Installation, keywords: 'npm pnpm cdn install' }
			]
		},
		{
			label: 'Usage',
			items: [
				{ slug: 'html', label: 'Plain HTML', Component: UsageHtml, keywords: 'attributes properties events' },
				{ slug: 'react', label: 'React', Component: UsageReact, keywords: 'jsx props' },
				{ slug: 'svelte', label: 'Svelte', Component: UsageSvelte }
			]
		},
		{
			label: 'Configuration',
			items: [
				{ slug: 'theming', label: 'Theming', Component: Theming, keywords: 'tokens css variables accent' },
				{ slug: 'typescript', label: 'TypeScript', Component: TypeScriptSetup, keywords: 'types jsx intrinsic elements' }
			]
		}
	]
}

const SYSTEM: SectionT = {
	id: 'system',
	label: 'System',
	blurb: 'Tokens, rules, and motion: the design language every element shares.',
	nav: [
		{
			label: 'Foundations',
			items: [
				{ slug: 'principles', label: 'Principles', Component: Rules, keywords: 'rules design' },
				{ slug: 'color', label: 'Color', Component: Color, keywords: 'palette tokens accent' },
				{ slug: 'typography', label: 'Typography', Component: Typography, keywords: 'type scale fonts' },
				{ slug: 'spacing', label: 'Spacing', Component: Spacing, keywords: 'space radius' },
				{ slug: 'layout', label: 'Layout', Component: Layout, keywords: 'box row column grid' },
				{ slug: 'motion', label: 'Motion', Component: Motion, keywords: 'animation duration easing transition' }
			]
		},
		{
			label: 'Practice',
			items: [
				{ slug: 'accessibility', label: 'Accessibility', Component: Accessibility, keywords: 'a11y keyboard focus' },
				{ slug: 'patterns', label: 'Patterns', Component: Patterns, keywords: 'trigger slot composition' }
			]
		}
	]
}

const ELEMENTS: SectionT = {
	id: 'elements',
	label: 'Elements',
	blurb: 'Every z element, one page each: live demos, code, and the full API.',
	nav: [
		{
			label: 'Typography',
			items: elements('z-text', 'z-heading', 'z-subheading', 'z-display', 'z-eyebrow', 'z-label', 'z-inline', 'z-kbd')
		},
		{
			label: 'Layout',
			items: [
				{
					label: 'Primitives',
					items: elements('z-box', 'z-row', 'z-column', 'z-stack', 'z-cluster', 'z-center', 'z-grid', 'z-spacer')
				},
				{
					label: 'Structure',
					items: elements(
						'z-container',
						'z-section',
						'z-surface',
						'z-card',
						'z-line',
						'z-separator',
						'z-scroll',
						'z-scroll-area'
					)
				},
				{ label: 'Bento', items: elements('z-bento-grid', 'z-bento-item') },
				{ label: 'Panels', items: elements('z-resizable-panels', 'z-panel', 'z-panel-handle', 'z-chassis') }
			]
		},
		{
			label: 'Actions',
			items: elements(
				'z-button',
				'z-button-group',
				'z-link',
				'z-toggle',
				'z-toggle-group',
				'z-toggle-group-item',
				'z-swap',
				'z-toolbar',
				'z-toolbar-group'
			)
		},
		{
			label: 'Forms',
			items: [
				{ label: 'Text', items: elements('z-field', 'z-input', 'z-textarea', 'z-number-input', 'z-input-otp') },
				{
					label: 'Choice',
					items: elements('z-checkbox', 'z-switch', 'z-radio', 'z-radio-group', 'z-select', 'z-combobox', 'z-filter')
				},
				{ label: 'Range & color', items: elements('z-slider', 'z-range', 'z-range-handle', 'z-color-picker') },
				{ label: 'Files', items: elements('z-dropzone') }
			]
		},
		{
			label: 'Feedback',
			items: elements('z-alert', 'z-callout', 'z-toaster', 'z-progress', 'z-skeleton', 'z-status-dot', 'z-empty-state')
		},
		{
			label: 'Overlays',
			items: [
				{ label: 'Floating', items: elements('z-tooltip', 'z-popover', 'z-hover-card') },
				{ label: 'Modal', items: elements('z-dialog', 'z-alert-dialog', 'z-sheet', 'z-drawer') },
				{ label: 'Menus', items: elements('z-menu', 'z-context-menu', 'z-command') }
			]
		},
		{
			label: 'Navigation',
			items: elements(
				'z-tabs',
				'z-breadcrumbs',
				'z-pagination',
				'z-nav-menu',
				'z-sidebar',
				'z-dock',
				'z-dock-item',
				'z-accordion',
				'z-collapsible'
			)
		},
		{
			label: 'Data display',
			items: [
				{ label: 'Identity', items: elements('z-badge', 'z-avatar', 'z-avatar-stack', 'z-stat', 'z-relative-time') },
				{
					label: 'Collections',
					items: elements('z-list', 'z-list-row', 'z-table', 'z-tree', 'z-virtual-list', 'z-carousel')
				},
				{ label: 'Content', items: elements('z-chart', 'z-code-block', 'z-markdown', 'z-terminal', 'z-post-meta') }
			]
		},
		{ label: 'Drag & drop', items: elements('z-draggable', 'z-drop-target', 'z-sortable') },
		{ label: 'Effects', items: elements('z-marquee', 'z-progressive-blur', 'z-pointer-follow') },
		{ label: 'Editor', items: elements('z-editor-canvas', 'z-canvas-item') }
	]
}

const BLOCKS_SECTION: SectionT = {
	id: 'blocks',
	label: 'Blocks',
	blurb: 'Recipes that compose elements into real interfaces. Copy, paste, adapt.',
	nav: BLOCKS.map((group) => ({
		label: group.label,
		items: group.items.map((block) => ({
			slug: block.slug,
			label: block.title,
			Component: block.Component,
			keywords: block.keywords
		}))
	}))
}

export const SECTIONS: SectionT[] = [SETUP, SYSTEM, ELEMENTS, BLOCKS_SECTION]

export const sectionById = (id: string): SectionT | undefined => SECTIONS.find((s) => s.id === id)

/** Every page of a section, in nav order. */
export const pagesOf = (section: SectionT): Array<DocPageT & { group: string }> => {
	const out: Array<DocPageT & { group: string }> = []
	const walk = (entries: Array<DocPageT | DocGroupT>, group: string) =>
		entries.forEach((entry) => (isGroup(entry) ? walk(entry.items, group || entry.label) : out.push({ ...entry, group })))
	walk(section.nav, '')
	return out
}

/** Top-level group label for an element slug ("Overlays", "Forms", …). */
export const elementGroupOf = (slug: string): string | undefined => pagesOf(ELEMENTS).find((p) => p.slug === slug)?.group

/** z-sidebar `items` for a section: values are "<section>/<slug>" paths. */
export const sidebarItemsOf = (section: SectionT): unknown[] => {
	const map = (entries: Array<DocPageT | DocGroupT>): unknown[] =>
		entries.map((entry) =>
			isGroup(entry)
				? { label: entry.label, items: map(entry.items) }
				: { value: `${section.id}/${entry.slug}`, label: entry.label }
		)
	return map(section.nav)
}
