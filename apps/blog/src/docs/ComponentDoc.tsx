import type { ReactNode } from 'react'
import customElementsManifest from '../../../../packages/zest/custom-elements.json'

// Atomico currently emits event declarations as members in the custom-elements
// manifest. Keep that distinction here so an event such as `change` is never
// presented as an HTML attribute in the reference.
const EVENT_NAMES = new Set([
	'activate', 'add', 'addreaction', 'cancel', 'change', 'clear', 'close', 'collapse', 'complete', 'confirm', 'copy',
	'dismiss', 'done', 'dragend', 'dragenter', 'dragging', 'dragleave', 'dragmove', 'dragover', 'dragstart', 'drop',
	'dropitem', 'end', 'expand', 'files', 'forward', 'input', 'jump', 'layout', 'linkclick', 'more', 'navigate', 'open',
	'panchange', 'pinnedchange', 'press', 'react', 'reject', 'remove', 'reply', 'rowclick', 'select', 'send', 'sort',
	'start', 'stop', 'tagclick', 'toggle', 'viewportchange', 'visiblerangechange', 'zoomchange'
])

type ManifestMember = { name?: string; kind?: string; type?: { text?: string } }
type ManifestAttribute = { name?: string; fieldName?: string; type?: { text?: string } }
type ManifestDeclaration = { tagName?: string; members?: ManifestMember[]; attributes?: ManifestAttribute[] }

const declarations = (customElementsManifest.modules ?? []).flatMap((module) =>
	(module.declarations ?? []) as ManifestDeclaration[]
)

const ApiReference = ({ tag }: { tag: string }) => {
	const declaration = declarations.find((item) => item.tagName === tag)
	if (!declaration) return null

	const members = (declaration.members ?? []).filter((member) => member.kind === 'field' && member.name && !EVENT_NAMES.has(member.name))
	const events = (declaration.members ?? []).filter((member) => member.name && EVENT_NAMES.has(member.name))

	return (
		<section className="component-api" aria-label={`${tag} API reference`}>
			<z-heading size="xs" tag="h2">API reference</z-heading>
			<p>Generated from Zest’s custom-elements manifest, so this list stays aligned with the shipped element.</p>
			{members.length > 0 && (
				<div className="component-api-section">
					<h3>Properties and attributes</h3>
					<dl>
						{members.map((member) => {
							const attribute = (declaration.attributes ?? []).find((item) => item.fieldName === member.name)
							return (
								<div key={member.name}>
									<dt><code>{attribute?.name ?? member.name}</code></dt>
									<dd>{member.type?.text ?? attribute?.type?.text ?? 'unknown'}{attribute?.name && attribute.name !== member.name ? ` · property: ${member.name}` : ''}</dd>
								</div>
							)
						})}
					</dl>
				</div>
			)}
			{events.length > 0 && (
				<div className="component-api-section">
					<h3>Events</h3>
					<dl>
						{events.map((event) => <div key={event.name}><dt><code>{event.name}</code></dt><dd>Bubbling, composed <code>CustomEvent</code>.</dd></div>)}
					</dl>
				</div>
			)}
		</section>
	)
}

// Shared chrome for the one-page-per-z-element reference docs. Reuses the
// .DocsPage panel/block/row/col classes from docs.css — only the header is
// bespoke (smaller than the section-index hero, since there are 67 of these).
export const ComponentDoc = ({
	tag,
	category,
	description,
	children
}: {
	tag: string
	category: string
	description?: string
	children: ReactNode
}) => (
	<div className="DocsPage DocsComponentPage">
		<header className="cd-header">
			<z-subheading size="sm" color="primary" style={{ display: 'block', marginBottom: '1rem' }}>
				{category}
			</z-subheading>
			<z-heading size="lg">{tag}</z-heading>

			<div className="dek">
				<z-text size="xl" color="muted">
					{description}
				</z-text>
			</div>
		</header>
		{children}
		<ApiReference tag={tag} />
	</div>
)
