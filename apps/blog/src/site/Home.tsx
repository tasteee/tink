import type { ReactNode } from 'react'
import { Link } from 'wouter'
import { ArrowUpRightIcon, CheckIcon } from '@phosphor-icons/react'

// The personal home page: my HQ as a software designer, architect, and
// developer. It points at the work worth showing (Zest docs, the frame
// extractor, vink) and keeps the live design system stream because it is
// the best picture of how I think about systems. Shared nav lives in
// SiteShell; this file is the page body.

type WorkItemT = {
	label: string
	title: string
	body: string
	cta: string
	href: string
	isInternal: boolean
}

type WorkCardPropsT = {
	item: WorkItemT
}

const GITHUB_URL = 'https://github.com/tasteee'
const VINK_URL = `${import.meta.env.BASE_URL}vink/`

const WORK_ITEMS: WorkItemT[] = [
	{
		label: 'library',
		title: 'Zest',
		body: 'A border-first web component library, with docs for every element, the blocks built from them, and the system underneath.',
		cta: 'Read the docs',
		href: '/docs',
		isInternal: true
	},
	{
		label: 'tool',
		title: 'Frame extractor',
		body: 'Scrub any video frame by frame with touch gestures and save the exact frame at full resolution.',
		cta: 'Open the tool',
		href: '/tools/frame-extractor',
		isInternal: true
	},
	{
		label: 'app',
		title: 'Vink',
		body: 'The tasteink audio visualizer. Load a song, tune the look, and record a video that reacts to the music.',
		cta: 'Open vink',
		href: VINK_URL,
		isInternal: false
	}
]

const DESIGN_SYSTEM_POINTS = [
	'One set of tokens drives every surface',
	'Depth from borders and color, never shadows',
	'OKLCH palette with purple and pink accents',
	'Accessible, framework-agnostic web components'
]

const WorkCard = (props: WorkCardPropsT) => {
	const card = (
		<z-card isReactive gap="3" className="work-card">
			<span className="mono">{props.item.label}</span>
			<z-heading size="xs" tag="h3">
				{props.item.title}
			</z-heading>
			<z-text size="sm" color="muted">
				{props.item.body}
			</z-text>
			<z-link tone="primary" className="work-card-cta">
				{props.item.cta} →
			</z-link>
		</z-card>
	)

	if (props.item.isInternal) {
		return (
			<Link className="card-link" href={props.item.href}>
				{card}
			</Link>
		)
	}

	return (
		<a className="card-link" href={props.item.href}>
			{card}
		</a>
	)
}

const scrollToWork = () => {
	const workSection = document.getElementById('work')
	workSection?.scrollIntoView({ behavior: 'smooth' })
}

const openGithub = () => {
	window.open(GITHUB_URL, '_blank', 'noopener')
}

export const Home = () => {
	const workCards = WORK_ITEMS.map((item) => <WorkCard key={item.title} item={item} />)

	return (
		<div className="SitePage HomePage">
			<header className="hero home-hero">
				<z-box direction="vertical" gap="5" alignsX="start">
					<span className="eyebrow">
						<span className="line" /> Designer · Architect · Developer
					</span>
					<z-heading size="xxl" className="home-title">
						I design, architect, and build software.
					</z-heading>
					<z-text size="xl" color="muted" className="home-intro">
						This is my HQ. The systems I design, the tools I build, and the apps I ship all live here.
					</z-text>
					<z-box direction="horizontal" gap="3" doesWrap alignsY="center">
						<z-button kind="solid" size="lg" onClick={scrollToWork}>
							See the work
						</z-button>
						<z-button kind="outline" size="lg" onClick={openGithub}>
							GitHub <ArrowUpRightIcon weight="bold" />
						</z-button>
					</z-box>
				</z-box>
			</header>

			<section className="section" id="work">
				<div className="section-head">
					<z-box direction="vertical" gap="2">
						<span className="eyebrow">
							<span className="line" /> Selected work
						</span>
						<z-heading size="sm">Things I have made.</z-heading>
					</z-box>
				</div>
				<z-box display="grid" columns="1" mediumColumns="3" gap="4">
					{workCards}
				</z-box>
			</section>

			<section className="section" id="design-system">
				<div className="showcase">
					<z-box direction="vertical" gap="4" alignsY="center">
						<span className="eyebrow">
							<span className="line" /> Design systems
						</span>
						<z-heading size="sm" tag="h2" className="showcase-title">
							I build systems that read as one language.
						</z-heading>
						<z-text size="md" color="muted" className="showcase-body">
							Zest is where that shows up most. Every control below is a real component from it, drifting past live.
						</z-text>
						<ul className="check-list">
							{DESIGN_SYSTEM_POINTS.map((point) => (
								<li key={point}>
									<CheckIcon weight="bold" /> {point}
								</li>
							))}
						</ul>
						<Link href="/docs/system/color" className="FooterLink home-inline-link">
							See the design system →
						</Link>
					</z-box>

					{/* the visual: a slow vertical stream of live but inert components.
					    No <Link>, no onClick handlers: you can poke at the controls as they
					    drift past, but nothing navigates or fires. Pauses on hover. The tiles
					    render twice so the loop is seamless. */}
					<div className="showcase-stage">
						<div className="showcase-stream">
							<ShowcaseTiles />
							<ShowcaseTiles />
						</div>
					</div>
				</div>
			</section>

			<z-separator className="home-footer-separator" />
			<z-box direction="horizontal" alignsX="between" alignsY="start" doesWrap gap="6" paddingTop="6">
				<z-box direction="vertical" gap="3" className="home-footer-about">
					<div className="SiteBrand">
						<span className="dot" /> tasteee
					</div>
					<z-text size="sm" color="muted">
						Software designer, architect, and developer.
					</z-text>
				</z-box>
				<z-box direction="vertical" gap="3">
					<z-subheading size="xs" color="muted">
						Find me
					</z-subheading>
					<Link href="/docs" className="FooterLink">
						Zest docs
					</Link>
					<Link href="/tools/frame-extractor" className="FooterLink">
						Frame extractor
					</Link>
					<a href={VINK_URL} className="FooterLink">
						Vink
					</a>
					<a href={GITHUB_URL} className="FooterLink">
						GitHub
					</a>
				</z-box>
			</z-box>
		</div>
	)
}

type TilePropsT = {
	label: string
	children: ReactNode
}

// One framed sample in the component stream, a mono label over a live group.
const Tile = (props: TilePropsT) => (
	<div className="showcase-tile">
		<span className="showcase-tile-label">{props.label}</span>
		{props.children}
	</div>
)

// The set of component samples that drifts up the stage. Rendered twice (for a
// seamless loop), so it must stay self-contained, no shared mutable state, no
// onClick/href anywhere. The controls are real and interactive, just inert.
const ShowcaseTiles = () => (
	<>
		<Tile label="Buttons">
			<z-box direction="horizontal" doesWrap gap="2" alignsY="center">
				<z-button tone="primary" kind="solid" size="sm">
					Solid
				</z-button>
				<z-button tone="secondary" kind="soft" size="sm">
					Soft
				</z-button>
				<z-button tone="neutral" kind="outline" size="sm">
					Outline
				</z-button>
				<z-button tone="neutral" kind="ghost" size="sm">
					Ghost
				</z-button>
			</z-box>
		</Tile>

		<Tile label="Switches">
			<z-box direction="horizontal" doesWrap gap="5" alignsY="center">
				<z-box direction="horizontal" gap="2" alignsY="center">
					<z-switch isChecked />
					<z-text size="sm">Notifications</z-text>
				</z-box>
				<z-box direction="horizontal" gap="2" alignsY="center">
					<z-switch />
					<z-text size="sm" color="muted">
						Reduced motion
					</z-text>
				</z-box>
			</z-box>
		</Tile>

		<Tile label="Badges">
			<z-box direction="horizontal" doesWrap gap="2" alignsY="center">
				<z-badge tone="primary">Active</z-badge>
				<z-badge tone="secondary" kind="soft">
					Beta
				</z-badge>
				<z-badge tone="neutral" kind="outline">
					Draft
				</z-badge>
				<z-badge isDot tone="success">
					Live
				</z-badge>
			</z-box>
		</Tile>

		<Tile label="Input">
			<z-input placeholder="you@example.com" />
		</Tile>

		<Tile label="Slider">
			<z-slider value={48} min={0} max={100} />
		</Tile>

		<Tile label="Selection">
			<z-box direction="horizontal" doesWrap gap="5" alignsY="center">
				<z-box direction="horizontal" gap="2" alignsY="center">
					<z-checkbox isChecked />
					<z-text size="sm">Subscribe</z-text>
				</z-box>
				<z-radio-group direction="horizontal" value="b">
					<z-radio value="a" />
					<z-radio value="b" isChecked />
					<z-radio value="c" />
				</z-radio-group>
			</z-box>
		</Tile>

		<Tile label="Progress">
			<z-box direction="horizontal" gap="3" alignsY="center">
				<z-avatar name="Ada Lovelace" size="sm" />
				<z-progress value={72} className="showcase-progress" />
			</z-box>
		</Tile>

		<Tile label="Avatars">
			<z-box direction="horizontal" gap="2" alignsY="center">
				<z-avatar name="Ada Lovelace" size="sm" />
				<z-avatar name="Grace Hopper" size="sm" />
				<z-avatar name="Alan Turing" size="sm" />
			</z-box>
		</Tile>

		<Tile label="Alert">
			<z-alert tone="primary" heading="Heads up">
				A flat, bordered alert, no shadow in sight.
			</z-alert>
		</Tile>
	</>
)
