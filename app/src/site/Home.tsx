import { Link, useLocation } from 'wouter'

// The marketing home page — ported from the old static index.html splash. The
// shared nav + auth live in SiteShell; this file is the page body (hero,
// sections, footer). Cards are wouter <Link>s so navigation stays client-side;
// in-page jumps (#packages, #tools) stay plain anchors.
export const Home = () => {
	const [, navigate] = useLocation()

	return (
		<div className="SitePage">
			{/* ── hero ───────────────────────────────────────────── */}
			<header className="hero">
				<z-box isColumn gap="5" xStart>
					<span className="eyebrow">
						<span className="line" /> Personal platform · est. 2026
					</span>
					<z-heading size="xxl" style={{ maxWidth: '45ch' }}>
						Where I build, write, and document it all.
					</z-heading>
					<z-text size="xl" color="muted" style={{ maxWidth: '46ch' }}>
						Home base for everything I make. A blog. A component library. npm packages. Docs for those
						packages. Etc.
					</z-text>
					<z-box isFlex isRow gap="3" doesWrap yCenter marginTop="2">
						<z-button kind="solid" size="large" onClick={() => navigate('/blog')}>
							Read the blog
						</z-button>
						<z-button kind="outline" size="large" onClick={() => navigate('/docs')}>
							Explore components
						</z-button>
					</z-box>
				</z-box>

				<z-separator style={{ margin: 'clamp(2.5rem, 5vw, 4rem) 0 2rem' }} />

				<z-box isFlex isRow doesWrap gap="6" yCenter>
					<z-box isColumn gap="1">
						<z-heading size="xs" tag="span">
							50+
						</z-heading>
						<z-text size="sm" color="muted">
							Components
						</z-text>
					</z-box>
					<z-line isVertical style={{ height: '2.5rem' }} />
					<z-box isColumn gap="1">
						<z-heading size="xs" tag="span">
							OKLCH
						</z-heading>
						<z-text size="sm" color="muted">
							Color system
						</z-text>
					</z-box>
					<z-line isVertical style={{ height: '2.5rem' }} />
					<z-box isColumn gap="1">
						<z-heading size="xs" tag="span">
							Zero
						</z-heading>
						<z-text size="sm" color="muted">
							Shadows
						</z-text>
					</z-box>
					<z-line isVertical style={{ height: '2.5rem' }} />
					<z-box isColumn gap="1">
						<z-heading size="xs" tag="span">
							DM{' '}Sans
						</z-heading>
						<z-text size="sm" color="muted">
							One typeface
						</z-text>
					</z-box>
				</z-box>
			</header>

			{/* ── explore ────────────────────────────────────────── */}
			<section className="section" id="explore">
				<div className="section-head">
					<z-box isColumn gap="2">
						<span className="eyebrow">
							<span className="line" /> Explore
						</span>
						<z-heading size="sm">Four doors, one design language.</z-heading>
					</z-box>
					<z-text size="sm" color="muted" style={{ maxWidth: '44ch' }}>
						Every surface shares the same chrome, type, and border-first grammar — so it all reads as one
						place.
					</z-text>
				</div>

				{/* feature: component library */}
				<Link className="card-link" href="/docs">
					<z-card doesLightUpOnHover isColumn gap="4">
						<z-box isFlex isRow xBetween yStart doesWrap gap="3">
							<z-box isColumn gap="2">
								<span className="mono">01 — Design system</span>
								<z-heading size="xs" tag="h3">
									The component library
								</z-heading>
								<z-text size="md" color="muted" style={{ maxWidth: '52ch' }}>
									50+ accessible web components in a single, dependency-light language. Borders over
									shadows, accent purple and pink, every weight of DM Sans.
								</z-text>
							</z-box>
							<z-badge isDot tone="primary">
								50+ shipped
							</z-badge>
						</z-box>

						<z-box isFlex isRow doesWrap gap="3" yCenter marginTop="1">
							<z-button tone="primary" kind="solid" size="small">
								Solid
							</z-button>
							<z-button tone="secondary" kind="soft" size="small">
								Soft
							</z-button>
							<z-button tone="neutral" kind="outline" size="small">
								Outline
							</z-button>
							<z-badge tone="primary">Active</z-badge>
							<z-chip isSelectable isSelected>
								Selected
							</z-chip>
							<z-avatar name="Ada Lovelace" size="small" />
							<z-switch isChecked />
						</z-box>

						<z-link tone="primary" style={{ marginTop: '0.5rem' }}>
							Browse all components →
						</z-link>
					</z-card>
				</Link>

				{/* three doors */}
				<z-box isGrid columns="1" mediumColumns="3" gap="4" marginTop="4">
					<Link className="card-link" href="/blog">
						<z-card doesLightUpOnHover isColumn gap="3" style={{ height: '100%' }}>
							<span className="mono">02 — Writing</span>
							<z-heading size="xs" tag="h3">
								The blog
							</z-heading>
							<z-text size="sm" color="muted">
								Notes on design systems, the web platform, and building in public.
							</z-text>
							<z-box isFlex isRow doesWrap gap="2" marginTop="1">
								<z-chip tone="secondary">Design</z-chip>
								<z-chip>Web platform</z-chip>
							</z-box>
							<z-link tone="secondary" style={{ marginTop: 'auto', paddingTop: '1rem' }}>
								Read the latest →
							</z-link>
						</z-card>
					</Link>

					<a className="card-link" href="#packages">
						<z-card doesLightUpOnHover isColumn gap="3" style={{ height: '100%' }}>
							<span className="mono">03 — Open source</span>
							<z-heading size="xs" tag="h3">
								Packages
							</z-heading>
							<z-text size="sm" color="muted">
								Documented libraries I publish, all sharing one docs UX.
							</z-text>
							<z-link tone="primary" style={{ marginTop: 'auto', paddingTop: '1rem' }}>
								See packages →
							</z-link>
						</z-card>
					</a>

					<a className="card-link" href="#tools">
						<z-card doesLightUpOnHover isColumn gap="3" style={{ height: '100%' }}>
							<span className="mono">04 — Utilities</span>
							<z-heading size="xs" tag="h3">
								Tools
							</z-heading>
							<z-text size="sm" color="muted">
								Small web tools and experiments, built for myself first.
							</z-text>
							<z-link tone="primary" style={{ marginTop: 'auto', paddingTop: '1rem' }}>
								Open tools →
							</z-link>
						</z-card>
					</a>
				</z-box>
			</section>

			{/* ── from the blog ──────────────────────────────────── */}
			<section className="section" id="blog">
				<div className="section-head">
					<z-box isColumn gap="2">
						<span className="eyebrow">
							<span className="line" /> From the blog
						</span>
						<z-heading size="sm">Latest writing.</z-heading>
					</z-box>
					<z-link tone="primary" onClick={() => navigate('/blog')} style={{ cursor: 'pointer' }}>
						View all posts →
					</z-link>
				</div>

				<z-box isColumn gap="3">
					{LATEST_POSTS.map((post) => (
						<Link key={post.title} className="card-link" href="/blog">
							<z-card doesLightUpOnHover isFlex isRow yCenter xBetween gap="4" doesWrap>
								<z-box isFlex isRow yCenter gap="5" doesWrap>
									<span className="mono" style={{ minWidth: '7rem' }}>
										{post.date}
									</span>
									<z-box isColumn gap="1">
										<z-heading size="xs" tag="h3" style={{ fontSize: '1.125rem' }}>
											{post.title}
										</z-heading>
										<z-text size="sm" color="muted">
											{post.excerpt}
										</z-text>
									</z-box>
								</z-box>
								<z-text color="muted">→</z-text>
							</z-card>
						</Link>
					))}
				</z-box>
			</section>

			{/* ── packages ───────────────────────────────────────── */}
			<section className="section" id="packages">
				<div className="section-head">
					<z-box isColumn gap="2">
						<span className="eyebrow">
							<span className="line" /> Packages
						</span>
						<z-heading size="sm">Things I publish.</z-heading>
					</z-box>
					<z-text size="sm" color="muted" style={{ maxWidth: '44ch' }}>
						Each package gets its own documentation, all sharing the same UX as these docs.
					</z-text>
				</div>

				<z-box isGrid columns="1" mediumColumns="3" gap="4">
					<Link className="card-link" href="/docs">
						<z-card doesLightUpOnHover isColumn gap="3" style={{ height: '100%' }}>
							<z-box isFlex isRow xBetween yCenter>
								<span className="mono" style={{ color: 'var(--foreground)' }}>
									zesty-wc
								</span>
								<z-badge tone="primary" kind="outline">
									v0.1.0
								</z-badge>
							</z-box>
							<z-text size="sm" color="muted">
								The web component library powering this entire site.
							</z-text>
							<z-link tone="primary" size="small" style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
								Docs →
							</z-link>
						</z-card>
					</Link>
					<a className="card-link" href="#packages">
						<z-card doesLightUpOnHover isColumn gap="3" style={{ height: '100%' }}>
							<z-box isFlex isRow xBetween yCenter>
								<span className="mono" style={{ color: 'var(--foreground)' }}>
									zesty-tokens
								</span>
								<z-badge tone="neutral" kind="outline">
									soon
								</z-badge>
							</z-box>
							<z-text size="sm" color="muted">
								The OKLCH design tokens — color, spacing, type, radius.
							</z-text>
							<z-link tone="primary" size="small" style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
								Docs →
							</z-link>
						</z-card>
					</a>
					<a className="card-link" href="#packages">
						<z-card doesLightUpOnHover isColumn gap="3" style={{ height: '100%' }}>
							<z-box isFlex isRow xBetween yCenter>
								<span className="mono" style={{ color: 'var(--foreground)' }}>
									highlight
								</span>
								<z-badge tone="neutral" kind="outline">
									soon
								</z-badge>
							</z-box>
							<z-text size="sm" color="muted">
								The tiny syntax-highlighting layer behind z-code-block.
							</z-text>
							<z-link tone="primary" size="small" style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
								Docs →
							</z-link>
						</z-card>
					</a>
				</z-box>
			</section>

			{/* ── tools ──────────────────────────────────────────── */}
			<section className="section" id="tools">
				<div className="section-head">
					<z-box isColumn gap="2">
						<span className="eyebrow">
							<span className="line" /> Tools
						</span>
						<z-heading size="sm">Small things, built for myself.</z-heading>
					</z-box>
					<z-text size="sm" color="muted" style={{ maxWidth: '44ch' }}>
						Not the headline — just useful experiments that found a home here.
					</z-text>
				</div>

				<z-box isGrid columns="1" mediumColumns="2" gap="4">
					<a className="card-link" href="#tools">
						<z-card doesLightUpOnHover isColumn gap="3">
							<z-box isFlex isRow xBetween yCenter>
								<span className="mono" style={{ color: 'var(--foreground)' }}>
									color · oklch
								</span>
								<z-badge tone="secondary" kind="outline">
									tool
								</z-badge>
							</z-box>
							<z-text size="sm" color="muted">
								Pick and convert colors in the same space the system uses.
							</z-text>
						</z-card>
					</a>
					<a className="card-link" href="#tools">
						<z-card doesLightUpOnHover isColumn gap="3">
							<z-box isFlex isRow xBetween yCenter>
								<span className="mono" style={{ color: 'var(--foreground)' }}>
									type · scale
								</span>
								<z-badge tone="secondary" kind="outline">
									tool
								</z-badge>
							</z-box>
							<z-text size="sm" color="muted">
								Preview the DM Sans type scale at any base size.
							</z-text>
						</z-card>
					</a>
				</z-box>
			</section>

			{/* ── cta ────────────────────────────────────────────── */}
			<section className="section">
				<z-card isColumn xCenter gap="4" style={{ padding: 'clamp(2.5rem, 6vw, 4.5rem)', textAlign: 'center' }}>
					<span className="eyebrow">
						<span className="line" /> Start here
					</span>
					<z-heading size="sm" style={{ maxWidth: '18ch' }}>
						Read a post, or go build something.
					</z-heading>
					<z-text color="muted" style={{ maxWidth: '44ch' }}>
						The blog is where the thinking lives. The component library is where it ships.
					</z-text>
					<z-box isFlex isRow doesWrap gap="3" xCenter marginTop="2">
						<z-button tone="secondary" kind="solid" size="large" onClick={() => navigate('/blog')}>
							Read the blog
						</z-button>
						<z-button tone="neutral" kind="outline" size="large" onClick={() => navigate('/docs')}>
							Explore components
						</z-button>
					</z-box>
				</z-card>
			</section>

			{/* ── footer ─────────────────────────────────────────── */}
			<z-separator style={{ marginTop: '6rem' }} />
			<z-box isFlex isRow xBetween doesWrap gap="6" paddingTop="6">
				<z-box isColumn gap="3" style={{ maxWidth: '24rem' }}>
					<div className="SiteBrand">
						<span className="dot" /> zest
					</div>
					<z-text size="sm" color="muted">
						A personal platform for building, writing, and documenting in the open. Dark only · borders over
						shadows.
					</z-text>
				</z-box>
				<z-box isFlex isRow gap="7" doesWrap>
					<z-box isColumn gap="3">
						<z-subheading size="xs" color="muted">
							Explore
						</z-subheading>
						<Link href="/blog" className="FooterLink">
							Blog
						</Link>
						<Link href="/docs" className="FooterLink">
							Components
						</Link>
						<a href="#packages" className="FooterLink">
							Packages
						</a>
						<a href="#tools" className="FooterLink">
							Tools
						</a>
					</z-box>
					<z-box isColumn gap="3">
						<z-subheading size="xs" color="muted">
							Reference
						</z-subheading>
						<Link href="/docs" className="FooterLink">
							Typography
						</Link>
						<Link href="/docs" className="FooterLink">
							Design system
						</Link>
					</z-box>
				</z-box>
			</z-box>
		</div>
	)
}

const LATEST_POSTS = [
	{
		date: 'Jun 18, 2026',
		title: 'Borders over shadows: a case for the hairline',
		excerpt: 'Building an entire component language without a single box-shadow — and what it forces you to get right.'
	},
	{
		date: 'Jun 09, 2026',
		title: 'Designing color in OKLCH',
		excerpt:
			'Deriving a whole purple-and-pink palette from two base accents, with lightness and chroma you can reason about.'
	},
	{
		date: 'May 28, 2026',
		title: 'Web components, the boring parts',
		excerpt:
			'Slots, reflected props, and shadow DOM styling — the unglamorous decisions that make a library feel cohesive.'
	}
]
