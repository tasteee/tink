import { Link } from 'wouter'
import './tools.css'

// The Tools landing page — a directory of the small web utilities published
// here. Each live tool is a wouter <Link> to its own route under /tools.
type Tool = {
	href: string | null
	slug: string
	title: string
	description: string
	status: 'live' | 'soon'
}

const TOOLS: Tool[] = [
	{
		// Relative to the /tools nest base (wouter prefixes the router base).
		href: '/frame-extractor',
		slug: 'video · frames',
		title: 'Frame extractor',
		description:
			'Upload a video and scrub it frame by frame with touch gestures. Triple-tap to download any frame at full resolution.',
		status: 'live'
	},
	{
		href: null,
		slug: 'color · oklch',
		title: 'Color scale',
		description: 'Build and convert color scales in the same OKLCH space the design system uses.',
		status: 'soon'
	},
	{
		href: null,
		slug: 'type · scale',
		title: 'Type scale',
		description: 'Preview a modular type scale at any base size and ratio.',
		status: 'soon'
	},
	{
		href: null,
		slug: 'type · pairs',
		title: 'Font pairing',
		description: 'Try heading/body typeface pairings side by side.',
		status: 'soon'
	}
]

export const Tools = () => (
	<div className="SitePage">
		<header className="hero">
			<z-box isColumn gap="3" xStart>
				<span className="eyebrow">
					<span className="line" /> Tools
				</span>
				<z-heading size="xl" style={{ maxWidth: '24ch' }}>
					Small web tools, built for myself first.
				</z-heading>
				<z-text size="lg" color="muted" style={{ maxWidth: '46ch' }}>
					Micro-apps I reach for often and want online at any time. Use them here, no install.
				</z-text>
			</z-box>
		</header>

		<section className="section">
			<z-box isGrid columns="1" mediumColumns="2" gap="4">
				{TOOLS.map((tool) => {
					const card = (
						<z-card doesLightUpOnHover isColumn gap="3" style={{ height: '100%' }}>
							<z-box isFlex isRow xBetween yCenter>
								<span className="mono" style={{ color: 'var(--foreground)' }}>
									{tool.slug}
								</span>
								<z-badge tone={tool.status === 'live' ? 'primary' : 'neutral'} kind="outline">
									{tool.status === 'live' ? 'open' : 'soon'}
								</z-badge>
							</z-box>
							<z-heading size="xs" tag="h3">
								{tool.title}
							</z-heading>
							<z-text size="sm" color="muted">
								{tool.description}
							</z-text>
							{tool.href && (
								<z-link tone="primary" size="small" style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
									Open tool →
								</z-link>
							)}
						</z-card>
					)
					return tool.href ? (
						<Link key={tool.title} className="card-link" href={tool.href}>
							{card}
						</Link>
					) : (
						<div key={tool.title} className="card-link card-link--disabled">
							{card}
						</div>
					)
				})}
			</z-box>
		</section>
	</div>
)
