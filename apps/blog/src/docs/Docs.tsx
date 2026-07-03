import './docs.css'
import { Route, Switch } from 'wouter'
import { DocsLayout } from '@app/docs/DocsLayout'
import { Color } from '@app/docs/design-system/Color'
import { Typography } from '@app/docs/Typography'
import { Spacing } from '@app/docs/design-system/Spacing'
import { Layout } from '@app/docs/Layout'
import { Rules } from '@app/docs/design-system/Rules'
import { Patterns } from '@app/docs/design-system/Patterns'
import { COMPONENT_MANIFEST } from '@app/docs/components/manifest'

// Docs section. Rendered under <Route path="/docs" nest>, so the paths here
// are relative to /docs. DocsLayout renders the left sidebar once and keeps it
// mounted across navigation — individual doc pages only render their content,
// never their own sidebar.

const SECTIONS = [
	{
		slug: 'color',
		eyebrow: '01 — Design system',
		title: 'Design system',
		blurb: 'Color, typography, spacing, layout primitives, and the rules that hold zest together.'
	},
	{
		slug: 'components/z-box',
		eyebrow: '02 — Reference',
		title: 'Components',
		blurb: `${COMPONENT_MANIFEST.length} accessible web components — one page each, grouped by category in the sidebar.`
	}
]

const DocsHome = () => (
	<div className="DocsPage">
		<header className="hero">
			<z-box isColumn gap="4" xStart>
				<span className="eyebrow">
					<span className="line" /> Docs
				</span>
				<z-heading size="xl" style={{ maxWidth: '24ch' }}>
					Documentation
				</z-heading>
				<z-text size="lg" color="muted" style={{ maxWidth: '52ch' }}>
					The reference for zesty-wc and the other packages. Browse the sidebar, or jump into a section below.
				</z-text>
			</z-box>
		</header>

		<z-box isGrid columns="1" mediumColumns="2" gap="4">
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
	<DocsLayout>
		<Switch>
			<Route path="/" component={DocsHome} />
			<Route path="/color" component={Color} />
			<Route path="/typography" component={Typography} />
			<Route path="/spacing" component={Spacing} />
			<Route path="/layout" component={Layout} />
			<Route path="/rules" component={Rules} />
			<Route path="/patterns" component={Patterns} />
			{COMPONENT_MANIFEST.map((entry) => (
				<Route key={entry.slug} path={`/components/${entry.slug}`} component={entry.Component} />
			))}
		</Switch>
	</DocsLayout>
)
