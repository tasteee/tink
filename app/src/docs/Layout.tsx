import { Link } from 'wouter'

// Ported from pages/layout-components.html. The kebab attributes from the HTML
// (aligns-x, min-column-width, full-height…) become camelCase props — React 19
// sets them as properties on the (already-registered) custom elements, and
// Atomico reflects them to the attributes the components' CSS reads.
export const Layout = () => (
	<div className="DocsPage">
		<header className="hero">
			<div className="eyebrow">
				<span>LAYOUT PRIMITIVES</span>
				<span className="line" />
			</div>
			<h1>Layout.</h1>
			<p className="lede">
				Nine composable primitives for arranging everything else.{' '}
				<span className="muted">
					One axis model — <code>aligns-x</code> is the horizontal relationship, <code>aligns-y</code> the
					vertical — tokenized spacing, borders over shadows. Every tile below is a <code>z-surface</code>.
				</span>
			</p>
			<nav className="DocsSubnav">
				<a href="#stack">Stack</a>
				<a href="#grid">Grid</a>
				<a href="#cluster">Cluster</a>
				<a href="#center">Center</a>
				<a href="#container">Container</a>
				<a href="#section">Section</a>
				<a href="#surface">Surface</a>
				<a href="#scroll">Scroll</a>
				<a href="#spacer">Spacer</a>
			</nav>
		</header>

		{/* ── z-stack ── */}
		<section className="section" id="stack">
			<div className="section-head">
				<span className="dot purple" />
				<h2>z-stack</h2>
				<span className="tag">one-dimensional flex</span>
			</div>
			<p className="section-sub">
				Lay children out along a single axis. <code>direction</code> picks vertical (default) or horizontal;
				alignment is expressed against the page axes, not the flex main/cross axis.
			</p>

			<z-grid minColumnWidth="22rem" gap="md">
				<div className="panel">
					<div className="micro">direction · vertical (default)</div>
					<div className="stage">
						<z-stack gap="sm">
							<z-surface className="tile" tone="primary" variant="soft" radius="md">one</z-surface>
							<z-surface className="tile" variant="soft" radius="md">two</z-surface>
							<z-surface className="tile" variant="soft" radius="md">three</z-surface>
						</z-stack>
					</div>
					<p className="cap"><span className="el">&lt;z-stack</span> <b>gap</b>="sm"<span className="el">&gt;</span></p>
				</div>

				<div className="panel">
					<div className="micro">direction · horizontal</div>
					<div className="stage">
						<z-stack direction="horizontal" gap="sm">
							<z-surface className="tile" tone="primary" variant="soft" radius="md">one</z-surface>
							<z-surface className="tile" variant="soft" radius="md">two</z-surface>
							<z-surface className="tile" variant="soft" radius="md">three</z-surface>
						</z-stack>
					</div>
					<p className="cap"><span className="el">&lt;z-stack</span> <b>direction</b>="horizontal" <b>gap</b>="sm"<span className="el">&gt;</span></p>
				</div>
			</z-grid>

			<div className="block">
				<div className="block-title">
					<h3>the axis model</h3>
					<span className="desc">aligns-x distributes across the row · aligns-y centers it vertically</span>
				</div>
				<div className="panel">
					<div className="stage" style={{ height: '8rem' }}>
						<z-stack direction="horizontal" alignsX="between" alignsY="center" fullHeight>
							<z-surface className="tile" tone="primary" variant="soft" radius="md">start</z-surface>
							<z-surface className="tile" variant="soft" radius="md">middle</z-surface>
							<z-surface className="tile" tone="secondary" variant="soft" radius="md">end</z-surface>
						</z-stack>
					</div>
					<p className="cap">
						<span className="el">&lt;z-stack</span> <b>direction</b>="horizontal" <b>aligns-x</b>="between"{' '}
						<b>aligns-y</b>="center" <b>full-height</b><span className="el">&gt;</span>
					</p>
				</div>
			</div>
		</section>

		{/* ── z-grid ── */}
		<section className="section" id="grid">
			<div className="section-head">
				<span className="dot pink" />
				<h2>z-grid</h2>
				<span className="tag">css grid</span>
			</div>
			<p className="section-sub">
				Fixed <code>columns</code> for a known count, or <code>min-column-width</code> for a responsive
				auto-fit grid that reflows on its own — no breakpoints to wire up.
			</p>

			<div className="block">
				<div className="block-title">
					<h3>columns="4"</h3>
					<span className="desc">a fixed four-track grid</span>
				</div>
				<div className="panel">
					<div className="stage">
						<z-grid columns="4" gap="sm">
							<z-surface className="tile" tone="primary" variant="soft" radius="md">1</z-surface>
							<z-surface className="tile" variant="soft" radius="md">2</z-surface>
							<z-surface className="tile" variant="soft" radius="md">3</z-surface>
							<z-surface className="tile" tone="secondary" variant="soft" radius="md">4</z-surface>
							<z-surface className="tile" variant="soft" radius="md">5</z-surface>
							<z-surface className="tile" variant="soft" radius="md">6</z-surface>
							<z-surface className="tile" variant="soft" radius="md">7</z-surface>
							<z-surface className="tile" tone="primary" variant="soft" radius="md">8</z-surface>
						</z-grid>
					</div>
					<p className="cap"><span className="el">&lt;z-grid</span> <b>columns</b>="4" <b>gap</b>="sm"<span className="el">&gt;</span></p>
				</div>
			</div>

			<div className="block">
				<div className="block-title">
					<h3>min-column-width="14rem"</h3>
					<span className="desc">resize the window — tracks add and drop themselves</span>
				</div>
				<div className="panel">
					<div className="stage">
						<z-grid minColumnWidth="14rem" gap="sm">
							<z-surface className="tile" tone="primary" variant="soft" radius="md">auto-fit</z-surface>
							<z-surface className="tile" variant="soft" radius="md">auto-fit</z-surface>
							<z-surface className="tile" variant="soft" radius="md">auto-fit</z-surface>
							<z-surface className="tile" tone="secondary" variant="soft" radius="md">auto-fit</z-surface>
							<z-surface className="tile" variant="soft" radius="md">auto-fit</z-surface>
						</z-grid>
					</div>
					<p className="cap"><span className="el">&lt;z-grid</span> <b>min-column-width</b>="14rem" <b>gap</b>="sm"<span className="el">&gt;</span></p>
				</div>
			</div>
		</section>

		{/* ── z-cluster ── */}
		<section className="section" id="cluster">
			<div className="section-head">
				<span className="dot purple" />
				<h2>z-cluster</h2>
				<span className="tag">wrapping row</span>
			</div>
			<p className="section-sub">
				A horizontal row that wraps by default — the right tool for tags, filters, toolbars, and badge groups.
				Pairs perfectly with the design system's chips and badges.
			</p>

			<div className="panel">
				<div className="micro">tags & actions · wraps onto new lines</div>
				<div className="stage">
					<z-cluster gap="sm" alignsY="center">
						<z-chip>Design systems</z-chip>
						<z-chip tone="secondary">Web platform</z-chip>
						<z-chip>OKLCH</z-chip>
						<z-chip tone="secondary">Shadow DOM</z-chip>
						<z-chip>Atomico</z-chip>
						<z-chip tone="secondary">Tokens</z-chip>
						<z-badge tone="primary" kind="outline">+6 more</z-badge>
					</z-cluster>
				</div>
				<p className="cap"><span className="el">&lt;z-cluster</span> <b>gap</b>="sm" <b>aligns-y</b>="center"<span className="el">&gt;</span></p>
			</div>

			<div className="block">
				<div className="block-title">
					<h3>aligns-x="end"</h3>
					<span className="desc">push the cluster to the trailing edge — e.g. dialog footers</span>
				</div>
				<div className="panel">
					<div className="stage">
						<z-cluster gap="sm" alignsX="end" alignsY="center" fullWidth>
							<z-button kind="outline" size="small">Cancel</z-button>
							<z-button tone="primary" kind="solid" size="small">Save changes</z-button>
						</z-cluster>
					</div>
					<p className="cap"><span className="el">&lt;z-cluster</span> <b>aligns-x</b>="end" <b>gap</b>="sm" <b>full-width</b><span className="el">&gt;</span></p>
				</div>
			</div>
		</section>

		{/* ── z-center ── */}
		<section className="section" id="center">
			<div className="section-head">
				<span className="dot pink" />
				<h2>z-center</h2>
				<span className="tag">centering</span>
			</div>
			<p className="section-sub">
				Centers content on both axes. Add <code>min-height</code> for hero centering and <code>max-width</code>{' '}
				to constrain the inner content block in one move.
			</p>

			<div className="panel">
				<div className="micro">both axes · min-height · constrained content</div>
				<div className="stage" style={{ padding: 0 }}>
					<z-center minHeight="16rem" maxWidth="sm" text inset="lg">
						<z-stack gap="sm" alignsX="center">
							<z-heading size="xs" tag="h3">Perfectly centered</z-heading>
							<z-text size="sm" color="muted">
								Vertically and horizontally, with the content capped at the <code>sm</code> width token.
							</z-text>
						</z-stack>
					</z-center>
				</div>
				<p className="cap">
					<span className="el">&lt;z-center</span> <b>min-height</b>="16rem" <b>max-width</b>="sm" <b>text</b> <b>inset</b>="lg"<span className="el">&gt;</span>
				</p>
			</div>
		</section>

		{/* ── z-container ── */}
		<section className="section" id="container">
			<div className="section-head">
				<span className="dot purple" />
				<h2>z-container</h2>
				<span className="tag">page width</span>
			</div>
			<p className="section-sub">
				The centered, max-width page wrapper with horizontal gutters. <code>size</code> takes a width token (or
				any CSS length); <code>gutter</code> sets the side padding.
			</p>

			<div className="panel">
				<div className="micro">size="md" · centered within a wider stage</div>
				<div className="stage">
					<z-container size="md" gutter="md">
						<z-surface className="tile lead" tone="primary" variant="soft" radius="md">max-width: md · centered · gutter padding</z-surface>
					</z-container>
				</div>
				<p className="cap"><span className="el">&lt;z-container</span> <b>size</b>="md" <b>gutter</b>="md"<span className="el">&gt;</span></p>
			</div>
		</section>

		{/* ── z-section ── */}
		<section className="section" id="section">
			<div className="section-head">
				<span className="dot pink" />
				<h2>z-section</h2>
				<span className="tag">vertical band</span>
			</div>
			<p className="section-sub">
				A vertical page band with <code>space</code> top/bottom padding. Fold in a <code>container</code> and{' '}
				<code>gutter</code> to get a centered content column in the same element.
			</p>

			<div className="panel">
				<div className="micro">space="xl" · built-in container="md"</div>
				<div className="stage" style={{ padding: 0 }}>
					<z-section space="xl" container="md" gutter="md" style={{ background: 'color-mix(in oklch, var(--purple) 7%, transparent)' }}>
						<z-surface className="tile lead" tone="secondary" variant="soft" radius="md">vertical space above &amp; below · content centered to md</z-surface>
					</z-section>
				</div>
				<p className="cap">
					<span className="el">&lt;z-section</span> <b>space</b>="xl" <b>container</b>="md" <b>gutter</b>="md"<span className="el">&gt;</span>
				</p>
			</div>
		</section>

		{/* ── z-surface ── */}
		<section className="section" id="surface">
			<div className="section-head">
				<span className="dot purple" />
				<h2>z-surface</h2>
				<span className="tag">themed panel</span>
			</div>
			<p className="section-sub">
				The everyday path is <code>level</code> — a neutral elevation stepped straight from the theme's neutral
				ramp, for layering UI. For accent surfaces, pick a <code>tone</code> and a <code>variant</code> and the
				surface composes its background, border, and text colour from a single tone variable.
			</p>

			<div className="panel">
				<div className="micro">level · neutral elevation (page → overlay)</div>
				<z-grid minColumnWidth="11rem" gap="sm">
					<z-surface level="0" radius="md" inset="lg">level="0"</z-surface>
					<z-surface level="1" radius="md" inset="lg">level="1"</z-surface>
					<z-surface level="2" radius="md" inset="lg">level="2"</z-surface>
					<z-surface level="3" radius="md" inset="lg">level="3"</z-surface>
				</z-grid>
				<p className="cap">
					<span className="el">&lt;z-surface</span> <b>level</b>="0 | 1 | 2 | 3"<span className="el">&gt;</span> — neutral-0 … neutral-3 + hairline
				</p>
			</div>

			<div className="block">
				<div className="block-title">
					<h3>tone × variant</h3>
					<span className="desc">accent surfaces, composed from one tone variable</span>
				</div>
				<div className="panel">
					<z-grid minColumnWidth="9rem" gap="sm">
						<z-surface tone="primary" variant="soft" radius="md" inset="md">primary · soft</z-surface>
						<z-surface tone="secondary" variant="soft" radius="md" inset="md">secondary · soft</z-surface>
						<z-surface tone="success" variant="soft" radius="md" inset="md">success · soft</z-surface>
						<z-surface tone="warning" variant="soft" radius="md" inset="md">warning · soft</z-surface>
						<z-surface tone="danger" variant="soft" radius="md" inset="md">danger · soft</z-surface>

						<z-surface tone="primary" variant="filled" radius="md" inset="md">primary · filled</z-surface>
						<z-surface tone="secondary" variant="filled" radius="md" inset="md">secondary · filled</z-surface>
						<z-surface tone="success" variant="filled" radius="md" inset="md">success · filled</z-surface>
						<z-surface tone="warning" variant="filled" radius="md" inset="md">warning · filled</z-surface>
						<z-surface tone="danger" variant="filled" radius="md" inset="md">danger · filled</z-surface>

						<z-surface tone="primary" variant="outlined" radius="md" inset="md">primary · outlined</z-surface>
						<z-surface tone="secondary" variant="outlined" radius="md" inset="md">secondary · outlined</z-surface>
						<z-surface tone="success" variant="outlined" radius="md" inset="md">success · outlined</z-surface>
						<z-surface tone="warning" variant="outlined" radius="md" inset="md">warning · outlined</z-surface>
						<z-surface tone="danger" variant="outlined" radius="md" inset="md">danger · outlined</z-surface>
					</z-grid>
					<p className="cap">
						<span className="el">&lt;z-surface</span> <b>tone</b>="primary" <b>variant</b>="soft|filled|outlined"{' '}
						<b>radius</b>="md" <b>inset</b>="md"<span className="el">&gt;</span>
					</p>
				</div>
			</div>

			<div className="block">
				<div className="block-title">
					<h3>toggles</h3>
					<span className="desc">border · elevated · interactive (hover the last one)</span>
				</div>
				<div className="panel">
					<z-grid minColumnWidth="12rem" gap="sm">
						<z-surface tone="neutral" variant="plain" radius="lg" inset="lg" border>border</z-surface>
						<z-surface tone="secondary" variant="soft" radius="lg" inset="lg" elevated>elevated</z-surface>
						<z-surface tone="primary" variant="outlined" radius="lg" inset="lg" interactive>interactive →</z-surface>
					</z-grid>
					<p className="cap">
						<span className="el">&lt;z-surface</span> … <b>border</b> · <b>elevated</b> · <b>interactive</b><span className="el">&gt;</span>
					</p>
				</div>
			</div>
		</section>

		{/* ── z-scroll ── */}
		<section className="section" id="scroll">
			<div className="section-head">
				<span className="dot pink" />
				<h2>z-scroll</h2>
				<span className="tag">overflow container</span>
			</div>
			<p className="section-sub">
				A constrained overflow region with the system's slim, themed scrollbars. Set a <code>max-height</code>{' '}
				(or <code>max-width</code>) and pick the scrolling <code>direction</code>.
			</p>

			<z-grid minColumnWidth="22rem" gap="md">
				<div className="panel">
					<div className="micro">direction · vertical · max-height="14rem"</div>
					<z-scroll direction="vertical" maxHeight="14rem" inset="sm" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
						<z-stack gap="sm">
							<z-surface className="tile" tone="primary" variant="soft" radius="md">row 01</z-surface>
							<z-surface className="tile" variant="soft" radius="md">row 02</z-surface>
							<z-surface className="tile" variant="soft" radius="md">row 03</z-surface>
							<z-surface className="tile" variant="soft" radius="md">row 04</z-surface>
							<z-surface className="tile" variant="soft" radius="md">row 05</z-surface>
							<z-surface className="tile" variant="soft" radius="md">row 06</z-surface>
							<z-surface className="tile" tone="secondary" variant="soft" radius="md">row 07</z-surface>
							<z-surface className="tile" variant="soft" radius="md">row 08</z-surface>
						</z-stack>
					</z-scroll>
					<p className="cap"><span className="el">&lt;z-scroll</span> <b>direction</b>="vertical" <b>max-height</b>="14rem"<span className="el">&gt;</span></p>
				</div>

				<div className="panel">
					<div className="micro">direction · horizontal</div>
					<z-scroll direction="horizontal" inset="sm" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
						<z-stack direction="horizontal" gap="sm">
							<z-surface className="tile tall" tone="primary" variant="soft" radius="md">A</z-surface>
							<z-surface className="tile tall" variant="soft" radius="md">B</z-surface>
							<z-surface className="tile tall" variant="soft" radius="md">C</z-surface>
							<z-surface className="tile tall" variant="soft" radius="md">D</z-surface>
							<z-surface className="tile tall" variant="soft" radius="md">E</z-surface>
							<z-surface className="tile tall" tone="secondary" variant="soft" radius="md">F</z-surface>
							<z-surface className="tile tall" variant="soft" radius="md">G</z-surface>
							<z-surface className="tile tall" variant="soft" radius="md">H</z-surface>
						</z-stack>
					</z-scroll>
					<p className="cap"><span className="el">&lt;z-scroll</span> <b>direction</b>="horizontal"<span className="el">&gt;</span></p>
				</div>
			</z-grid>
		</section>

		{/* ── z-spacer ── */}
		<section className="section" id="spacer">
			<div className="section-head">
				<span className="dot purple" />
				<h2>z-spacer</h2>
				<span className="tag">flexible gap</span>
			</div>
			<p className="section-sub">
				Empty space inside a flex layout — a fixed <code>size</code>, or <code>grow</code> to soak up everything
				left over and push trailing items to the far edge of a toolbar.
			</p>

			<div className="panel">
				<div className="micro">grow · pushes the trailing action to the end</div>
				<div className="stage">
					<z-stack direction="horizontal" gap="sm" alignsY="center">
						<z-surface className="tile" tone="primary" variant="soft" radius="md">Logo</z-surface>
						<z-surface className="tile" variant="soft" radius="md">Home</z-surface>
						<z-surface className="tile" variant="soft" radius="md">Docs</z-surface>
						<z-spacer grow />
						<z-button tone="primary" kind="solid" size="small">Sign in</z-button>
					</z-stack>
				</div>
				<p className="cap">… <span className="el">&lt;z-spacer</span> <b>grow</b><span className="el">&gt;&lt;/z-spacer&gt;</span> …</p>
			</div>

			<div className="block">
				<div className="block-title">
					<h3>size="2xl"</h3>
					<span className="desc">a fixed-size gap between two items</span>
				</div>
				<div className="panel">
					<div className="stage">
						<z-stack direction="horizontal" gap="0" alignsY="center">
							<z-surface className="tile" tone="primary" variant="soft" radius="md">before</z-surface>
							<z-spacer size="2xl" />
							<z-surface className="tile" tone="secondary" variant="soft" radius="md">after</z-surface>
						</z-stack>
					</div>
					<p className="cap"><span className="el">&lt;z-spacer</span> <b>size</b>="2xl"<span className="el">&gt;&lt;/z-spacer&gt;</span></p>
				</div>
			</div>
		</section>

		<footer className="docs-footer">
			<span>zesty-wc · layout primitives · borders over shadows</span>
			<span>
				<Link href="/docs/components">Components</Link> · <Link href="/docs/typography">Typography</Link> ·{' '}
				<Link href="/">Home</Link>
			</span>
		</footer>
	</div>
)
