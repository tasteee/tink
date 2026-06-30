import { type ReactNode, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'wouter'
import { ArrowRightIcon, CheckIcon } from '@phosphor-icons/react'

// The marketing home page — restructured around dub.co's landing patterns
// (announcement pill, punchy hero + feature pills, a scrolling marquee,
// alternating feature showcases with checklists, animated stat counters, a big
// closing CTA) but kept in the zest brand: dark, borders over shadows, OKLCH
// purple/pink, one typeface. Shared nav + auth live in SiteShell; this file is
// the page body. Cards are wouter <Link>s so navigation stays client-side;
// in-page jumps (#packages, #tools) stay plain anchors.
export const Home = () => {
	const [, navigate] = useLocation()

	return (
		<div className='SitePage HomePage'>
			{/* ── hero ───────────────────────────────────────────── */}
			<header className='hero hero--glow'>
				<z-box isColumn gap='5' xCenter style={{ textAlign: 'center', alignItems: 'center' }}>
					<Link href='/blog' className='announce'>
						<z-badge tone='primary' size='small'>
							New
						</z-badge>
						<span>Borders over shadows: a case for the hairline</span>
						<ArrowRightIcon weight='bold' />
					</Link>

					<z-heading size='xxl' className='hero-title' style={{ maxWidth: '64ch' }}>
						Everything I build, write, and ship — in one place.
					</z-heading>

					<z-text size='xl' color='muted' style={{ maxWidth: '52ch' }}>
						A personal platform for my work: a component library, a blog, the packages I publish, and the small tools I make along
						the way. One design language across all of it.
					</z-text>

					<z-box isFlex isRow gap='3' doesWrap yCenter xCenter marginTop='2'>
						<z-button kind='solid' size='large' onClick={() => navigate('/docs')}>
							Browse components
						</z-button>
						<z-button kind='outline' size='large' onClick={() => navigate('/blog')}>
							Read the blog
						</z-button>
					</z-box>

					<div className='pill-row'>
						{HERO_PILLS.map((pill) => (
							<span key={pill} className='pill'>
								<span className='pill-dot' /> {pill}
							</span>
						))}
					</div>
				</z-box>
			</header>

			{/* ── marquee — what it's built with ─────────────────── */}
			<section className='marquee-band'>
				<span className='marquee-label mono'>Built with</span>
				<div className='marquee' aria-hidden='true'>
					<div className='marquee-track'>
						{[...MARQUEE, ...MARQUEE].map((item, i) => (
							<span key={i} className='marquee-item'>
								{item}
							</span>
						))}
					</div>
				</div>
			</section>

			{/* ── value prop ─────────────────────────────────────── */}
			<section className='section' id='explore'>
				<div className='section-head'>
					<z-box isColumn gap='2'>
						<span className='eyebrow'>
							<span className='line' /> The whole craft
						</span>
						<z-heading size='sm' style={{ maxWidth: '24ch' }}>
							It’s not just about code. It’s about the whole craft.
						</z-heading>
					</z-box>
					<z-text size='sm' color='muted' style={{ maxWidth: '40ch' }}>
						Designing the system, writing down the thinking, shipping the libraries, and building the tools — every surface here
						shares the same chrome and grammar.
					</z-text>
				</div>

				<z-box isGrid columns='1' mediumColumns='3' gap='4'>
					{VALUE_PROPS.map((vp) => (
						<Link key={vp.title} className='card-link' href={vp.href}>
							<z-card doesLightUpOnHover isColumn gap='3' style={{ height: '100%' }}>
								<span className='mono'>{vp.kicker}</span>
								<z-heading size='xs' tag='h3'>
									{vp.title}
								</z-heading>
								<z-text size='sm' color='muted'>
									{vp.body}
								</z-text>
								<z-link tone='primary' style={{ marginTop: 'auto', paddingTop: '1rem' }}>
									{vp.cta} →
								</z-link>
							</z-card>
						</Link>
					))}
				</z-box>
			</section>

			{/* ── showcase: component library ────────────────────── */}
			<section className='section' id='components'>
				<div className='showcase'>
					<z-box isColumn gap='4' yCenter>
						<span className='eyebrow'>
							<span className='line' /> Design system
						</span>
						<z-heading size='sm' tag='h2' style={{ maxWidth: '36ch' }}>
							A component library that reads as one language.
						</z-heading>
						<z-text size='md' color='muted' style={{ maxWidth: '46ch' }}>
							50+ accessible web components in a single, dependency-light system. Borders over shadows, an OKLCH palette of purple
							and pink, every weight of DM Sans.
						</z-text>
						<ul className='check-list'>
							{COMPONENT_FEATURES.map((f) => (
								<li key={f}>
									<CheckIcon weight='bold' /> {f}
								</li>
							))}
						</ul>
						<z-button kind='solid' size='medium' onClick={() => navigate('/docs')} style={{ marginTop: '0.5rem' }}>
							Explore the docs
						</z-button>
					</z-box>

					{/* the visual: a slow vertical stream of live — but inert — components.
					    No <Link>, no onClick handlers: you can poke at the controls as they
					    drift past, but nothing navigates or fires. Pauses on hover. The tiles
					    render twice so the loop is seamless. */}
					<div className='showcase-stage'>
						<div className='showcase-stream'>
							<ShowcaseTiles />
							<ShowcaseTiles />
						</div>
					</div>
				</div>
			</section>

			{/* ── from the blog ──────────────────────────────────── */}
			<section className='section' id='blog'>
				<div className='section-head'>
					<z-box isColumn gap='2'>
						<span className='eyebrow'>
							<span className='line' /> From the blog
						</span>
						<z-heading size='sm'>Latest writing.</z-heading>
					</z-box>
					<z-link tone='primary' onClick={() => navigate('/blog')} style={{ cursor: 'pointer' }}>
						View all posts →
					</z-link>
				</div>

				<z-box isColumn gap='3'>
					{LATEST_POSTS.map((post) => (
						<Link key={post.title} className='card-link' href='/blog'>
							<z-card doesLightUpOnHover isFlex isRow yCenter xBetween gap='4' doesWrap>
								<z-box isFlex isRow yCenter gap='5' doesWrap>
									<span className='mono' style={{ minWidth: '7rem' }}>
										{post.date}
									</span>
									<z-box isColumn gap='1'>
										<z-heading size='xs' tag='h3' style={{ fontSize: '1.125rem' }}>
											{post.title}
										</z-heading>
										<z-text size='sm' color='muted'>
											{post.excerpt}
										</z-text>
									</z-box>
								</z-box>
								<z-text color='muted'>→</z-text>
							</z-card>
						</Link>
					))}
				</z-box>
			</section>

			{/* ── bento: packages + tools ────────────────────────── */}
			<section className='section' id='packages'>
				<div className='section-head'>
					<z-box isColumn gap='2'>
						<span className='eyebrow'>
							<span className='line' /> Open source & utilities
						</span>
						<z-heading size='sm'>Packages I publish, tools I build.</z-heading>
					</z-box>
					<z-text size='sm' color='muted' style={{ maxWidth: '40ch' }}>
						Each package gets its own docs, sharing the same UX as the component library. The tools are small experiments that
						found a home here.
					</z-text>
				</div>

				<div className='bento'>
					{/* lead tile — the flagship package */}
					<Link className='card-link bento-lead' href='/docs'>
						<z-card doesLightUpOnHover isColumn gap='3' style={{ height: '100%' }}>
							<z-box isFlex isRow xBetween yCenter>
								<span className='mono' style={{ color: 'var(--foreground)' }}>
									zesty-wc
								</span>
								<z-badge tone='primary' kind='outline'>
									v0.1.0
								</z-badge>
							</z-box>
							<z-heading size='xs' tag='h3'>
								The web component library
							</z-heading>
							<z-text size='sm' color='muted'>
								50+ components powering this entire site — buttons, inputs, overlays, charts, and more. Fully documented and
								dependency-light.
							</z-text>
							<z-link tone='primary' size='small' style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
								Read the docs →
							</z-link>
						</z-card>
					</Link>

					{BENTO_TILES.map((tile) => {
						const Wrap = tile.internal ? Link : 'a'
						return (
							<Wrap key={tile.name} className='card-link' href={tile.href}>
								<z-card doesLightUpOnHover isColumn gap='3' style={{ height: '100%' }}>
									<z-box isFlex isRow xBetween yCenter>
										<span className='mono' style={{ color: 'var(--foreground)' }}>
											{tile.name}
										</span>
										<z-badge tone={tile.tone} kind='outline'>
											{tile.status}
										</z-badge>
									</z-box>
									<z-text size='sm' color='muted'>
										{tile.body}
									</z-text>
								</z-card>
							</Wrap>
						)
					})}
				</div>
			</section>

			{/* ── stats band ─────────────────────────────────────── */}
			<section className='section'>
				<z-card isColumn gap='6' className='stats-band'>
					<z-box isColumn gap='2' xCenter style={{ textAlign: 'center', alignItems: 'center' }}>
						<span className='eyebrow'>
							<span className='line' /> By the numbers
						</span>
						<z-heading size='sm'>Built deliberately, end to end.</z-heading>
					</z-box>
					<z-box isFlex isRow doesWrap gap='6' xCenter yCenter className='stats-row'>
						{STATS.map((stat, i) => (
							<div key={stat.label} className='stat-cell'>
								<Counter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
								<span className='stat-label'>{stat.label}</span>
								{i < STATS.length - 1 && <z-line isVertical className='stat-divider' />}
							</div>
						))}
					</z-box>
				</z-card>
			</section>

			{/* ── final cta ──────────────────────────────────────── */}
			<section className='section'>
				<z-card isColumn xCenter gap='4' className='final-cta'>
					<span className='eyebrow'>
						<span className='line' /> Start here
					</span>
					<z-heading size='md' style={{ maxWidth: '20ch' }}>
						Read a post, or go build something.
					</z-heading>
					<z-text color='muted' style={{ maxWidth: '46ch' }}>
						The blog is where the thinking lives. The component library is where it ships. Everything else is somewhere in
						between.
					</z-text>
					<z-box isFlex isRow doesWrap gap='3' xCenter marginTop='2'>
						<z-button tone='primary' kind='solid' size='large' onClick={() => navigate('/docs')}>
							Browse components
						</z-button>
						<z-button tone='neutral' kind='outline' size='large' onClick={() => navigate('/blog')}>
							Read the blog
						</z-button>
					</z-box>
				</z-card>
			</section>

			{/* ── footer ─────────────────────────────────────────── */}
			<z-separator style={{ marginTop: '6rem' }} />
			<z-box isFlex isRow xBetween doesWrap gap='6' paddingTop='6'>
				<z-box isColumn gap='3' style={{ maxWidth: '24rem' }}>
					<div className='SiteBrand'>
						<span className='dot' /> zest
					</div>
					<z-text size='sm' color='muted'>
						A personal platform for building, writing, and documenting in the open. Dark only · borders over shadows.
					</z-text>
				</z-box>
				<z-box isFlex isRow gap='7' doesWrap>
					<z-box isColumn gap='3'>
						<z-subheading size='xs' color='muted'>
							Explore
						</z-subheading>
						<Link href='/blog' className='FooterLink'>
							Blog
						</Link>
						<Link href='/docs' className='FooterLink'>
							Components
						</Link>
						<a href='#packages' className='FooterLink'>
							Packages
						</a>
						<Link href='/tools' className='FooterLink'>
							Tools
						</Link>
					</z-box>
					<z-box isColumn gap='3'>
						<z-subheading size='xs' color='muted'>
							Reference
						</z-subheading>
						<Link href='/docs' className='FooterLink'>
							Typography
						</Link>
						<Link href='/docs' className='FooterLink'>
							Design system
						</Link>
					</z-box>
				</z-box>
			</z-box>
		</div>
	)
}

// One framed sample in the component stream — a mono label over a live group.
const Tile = ({ label, children }: { label: string; children: ReactNode }) => (
	<div className='showcase-tile'>
		<span className='showcase-tile-label'>{label}</span>
		{children}
	</div>
)

// The set of component samples that drifts up the stage. Rendered twice (for a
// seamless loop), so it must stay self-contained — no shared mutable state, no
// onClick/href anywhere. The controls are real and interactive, just inert.
const ShowcaseTiles = () => (
	<>
		<Tile label='Buttons'>
			<z-box isFlex isRow doesWrap gap='2' yCenter>
				<z-button tone='primary' kind='solid' size='small'>
					Solid
				</z-button>
				<z-button tone='secondary' kind='soft' size='small'>
					Soft
				</z-button>
				<z-button tone='neutral' kind='outline' size='small'>
					Outline
				</z-button>
				<z-button tone='neutral' kind='ghost' size='small'>
					Ghost
				</z-button>
			</z-box>
		</Tile>

		<Tile label='Switches'>
			<z-box isFlex isRow doesWrap gap='5' yCenter>
				<z-box isFlex isRow gap='2' yCenter>
					<z-switch isChecked />
					<z-text size='sm'>Notifications</z-text>
				</z-box>
				<z-box isFlex isRow gap='2' yCenter>
					<z-switch />
					<z-text size='sm' color='muted'>
						Reduced motion
					</z-text>
				</z-box>
			</z-box>
		</Tile>

		<Tile label='Badges'>
			<z-box isFlex isRow doesWrap gap='2' yCenter>
				<z-badge tone='primary'>Active</z-badge>
				<z-badge tone='secondary' kind='soft'>
					Beta
				</z-badge>
				<z-badge tone='neutral' kind='outline'>
					Draft
				</z-badge>
				<z-badge isDot tone='success'>
					Live
				</z-badge>
			</z-box>
		</Tile>

		<Tile label='Input'>
			<z-input placeholder='you@example.com' style={{ width: '100%' }} />
		</Tile>

		<Tile label='Slider'>
			<z-slider value={48} min={0} max={100} style={{ width: '100%' }} />
		</Tile>

		<Tile label='Selection'>
			<z-box isFlex isRow doesWrap gap='5' yCenter>
				<z-box isFlex isRow gap='2' yCenter>
					<z-checkbox isChecked />
					<z-text size='sm'>Subscribe</z-text>
				</z-box>
				<z-radio-group isHorizontal value='b'>
					<z-radio value='a' />
					<z-radio value='b' isChecked />
					<z-radio value='c' />
				</z-radio-group>
			</z-box>
		</Tile>

		<Tile label='Progress'>
			<z-box isFlex isRow gap='3' yCenter>
				<z-avatar name='Ada Lovelace' size='small' />
				<z-progress value={72} style={{ flex: 1, minWidth: '7rem' }} />
			</z-box>
		</Tile>

		<Tile label='Avatars'>
			<z-box isFlex isRow gap='2' yCenter>
				<z-avatar name='Ada Lovelace' size='small' />
				<z-avatar name='Grace Hopper' size='small' />
				<z-avatar name='Alan Turing' size='small' />
			</z-box>
		</Tile>

		<Tile label='Alert'>
			<z-alert tone='primary' heading='Heads up'>
				A flat, bordered alert — no shadow in sight.
			</z-alert>
		</Tile>
	</>
)

// Counts up from 0 to `value` once the element scrolls into view. Pure DOM/raf,
// no deps — respects prefers-reduced-motion by snapping straight to the value.
const Counter = ({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) => {
	const ref = useRef<HTMLSpanElement>(null)
	const [display, setDisplay] = useState(0)

	useEffect(() => {
		const el = ref.current
		if (!el) return

		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
		if (reduced) {
			setDisplay(value)
			return
		}

		let raf = 0
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return
				observer.disconnect()
				const duration = 1200
				const start = performance.now()
				const tick = (now: number) => {
					const t = Math.min(1, (now - start) / duration)
					const eased = 1 - Math.pow(1 - t, 3)
					setDisplay(Math.round(value * eased))
					if (t < 1) raf = requestAnimationFrame(tick)
				}
				raf = requestAnimationFrame(tick)
			},
			{ threshold: 0.4 }
		)
		observer.observe(el)

		return () => {
			observer.disconnect()
			cancelAnimationFrame(raf)
		}
	}, [value])

	return (
		<span ref={ref} className='stat-value'>
			{prefix}
			{display.toLocaleString()}
			{suffix}
		</span>
	)
}

const HERO_PILLS = ['Component library', 'Blog', 'Packages', 'Tools']

const MARQUEE = [
	'React 19',
	'Web Components',
	'OKLCH',
	'DM Sans',
	'TypeScript',
	'Convex',
	'Atomico',
	'Vite',
	'Borders over shadows',
	'Dark only'
]

const VALUE_PROPS = [
	{
		kicker: '01 — Design',
		title: 'Design systems',
		body: 'A borders-first component language with an OKLCH palette and one typeface — built to feel like a single place.',
		href: '/docs',
		cta: 'Explore components'
	},
	{
		kicker: '02 — Writing',
		title: 'Writing',
		body: 'Notes on design systems, the web platform, and building in public — the thinking behind everything I ship.',
		href: '/blog',
		cta: 'Read the blog'
	},
	{
		kicker: '03 — Tools',
		title: 'Tools & packages',
		body: 'Libraries I publish and small web utilities I build for myself first — each with its own docs.',
		href: '/tools',
		cta: 'Open the tools'
	}
]

const COMPONENT_FEATURES = [
	'50+ accessible web components',
	'OKLCH color system — purple & pink accents',
	'Borders over shadows, no box-shadow anywhere',
	'Every weight of DM Sans, one typeface',
	'Dependency-light, framework-agnostic'
]

const BENTO_TILES: {
	name: string
	status: string
	tone: 'primary' | 'secondary' | 'neutral'
	body: string
	href: string
	internal: boolean
}[] = [
	{
		name: 'zesty-tokens',
		status: 'soon',
		tone: 'neutral',
		body: 'The OKLCH design tokens — color, spacing, type, radius — as a standalone package.',
		href: '#packages',
		internal: false
	},
	{
		name: 'video · frames',
		status: 'open',
		tone: 'primary',
		body: 'Scrub any video frame by frame and download the exact frame at full resolution.',
		href: '/tools/frame-extractor',
		internal: true
	},
	{
		name: 'color · oklch',
		status: 'soon',
		tone: 'secondary',
		body: 'Pick and convert colors in the same space the design system uses.',
		href: '#tools',
		internal: false
	}
]

const STATS: { value: number; prefix?: string; suffix?: string; label: string }[] = [
	{ value: 50, suffix: '+', label: 'Components shipped' },
	{ value: 100, suffix: '%', label: 'OKLCH color' },
	{ value: 0, label: 'Box-shadows used' },
	{ value: 1, label: 'Typeface' }
]

const LATEST_POSTS = [
	{
		date: 'Jun 18, 2026',
		title: 'Borders over shadows: a case for the hairline',
		excerpt: 'Building an entire component language without a single box-shadow — and what it forces you to get right.'
	},
	{
		date: 'Jun 09, 2026',
		title: 'Designing color in OKLCH',
		excerpt: 'Deriving a whole purple-and-pink palette from two base accents, with lightness and chroma you can reason about.'
	},
	{
		date: 'May 28, 2026',
		title: 'Web components, the boring parts',
		excerpt: 'Slots, reflected props, and shadow DOM styling — the unglamorous decisions that make a library feel cohesive.'
	}
]
