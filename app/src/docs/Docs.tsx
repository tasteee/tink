import './docs.css'
import { Route, Switch } from 'wouter'
import { Components } from '@app/docs/Components'
import { Layout } from '@app/docs/Layout'
import { Typography } from '@app/docs/Typography'

// Docs section. Rendered under <Route path="/docs" nest>, so the paths here are
// relative to /docs. The three reference pages were ported from the old static
// pages/*.html showcases; the landing links into them.

const SECTIONS = [
	{
		slug: 'components',
		eyebrow: '01 — Design system',
		title: 'Components',
		blurb: '50+ accessible web components — buttons, inputs, overlays, data display, and more.'
	},
	{
		slug: 'layout',
		eyebrow: '02 — Primitives',
		title: 'Layout',
		blurb: 'z-stack, z-grid, z-cluster, z-center, z-container, z-section, z-surface, z-scroll, z-spacer.'
	},
	{
		slug: 'typography',
		eyebrow: '03 — Type',
		title: 'Typography',
		blurb: 'The DM Sans type scale, headings, text, labels, and the system in long-form context.'
	}
]

const DocsHome = () => (
	<div className="SitePage">
		<header className="hero">
			<z-box isColumn gap="4" xStart>
				<span className="eyebrow">
					<span className="line" /> Docs
				</span>
				<z-heading size="xl" style={{ maxWidth: '24ch' }}>
					Documentation
				</z-heading>
				<z-text size="lg" color="muted" style={{ maxWidth: '52ch' }}>
					The reference for zesty-wc and the other packages. The three sections below are the live component,
					layout, and type showcases.
				</z-text>
			</z-box>
		</header>

		<z-box isGrid columns="1" mediumColumns="3" gap="4">
			{SECTIONS.map((section) => (
				<a key={section.slug} className="card-link" href={`/docs/${section.slug}`}>
					<z-card doesLightUpOnHover isColumn gap="3" style={{ height: '100%' }}>
						<span className="mono">{section.eyebrow}</span>
						<z-heading size="xs" tag="h3">
							{section.title}
						</z-heading>
						<z-text size="sm" color="muted">
							{section.blurb}
						</z-text>
						<z-link tone="primary" size="small" style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
							Read →
						</z-link>
					</z-card>
				</a>
			))}
		</z-box>
	</div>
)

export const Docs = () => (
	<Switch>
		<Route path="/" component={DocsHome} />
		<Route path="/components" component={Components} />
		<Route path="/layout" component={Layout} />
		<Route path="/typography" component={Typography} />
	</Switch>
)
