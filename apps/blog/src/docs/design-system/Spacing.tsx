import { DocsLink } from '@app/docs/DocsLink'

const SpaceRow = ({ token, rem }: { token: string; rem: string }) => (
	<div className="space-row">
		<span className="space-token">{token}</span>
		<div className="space-bar" style={{ width: `var(${token})` }} />
		<span className="space-value">{rem}</span>
	</div>
)

// gap/inset size scale every layout primitive (z-stack, z-grid, z-cluster, …)
// resolves its `gap`/`inset` prop through — see resolveSize in layout-schema.ts.
const SIZE_SCALE = [
	{ key: '0', var: '--spacing-0', rem: '0' },
	{ key: '2xs', var: '--spacing-1', rem: '0.25rem' },
	{ key: 'xs', var: '--spacing-2', rem: '0.5rem' },
	{ key: 'sm', var: '--spacing-3', rem: '0.75rem' },
	{ key: 'md', var: '--spacing-4', rem: '1rem' },
	{ key: 'lg', var: '--spacing-6', rem: '1.5rem' },
	{ key: 'xl', var: '--spacing-8', rem: '2rem' },
	{ key: '2xl', var: '--spacing-12', rem: '3rem' },
	{ key: '3xl', var: '--spacing-16', rem: '4rem' },
	{ key: '4xl', var: '--spacing-24', rem: '6rem' }
]

const SEMANTIC_SPACE = [
	{ token: '--space-xs', rem: '0.25rem' },
	{ token: '--space-sm', rem: '0.5rem' },
	{ token: '--space-md', rem: '0.75rem' },
	{ token: '--space-base', rem: '1rem' },
	{ token: '--space-lg', rem: '1.5rem' },
	{ token: '--space-xl', rem: '2rem' },
	{ token: '--space-2xl', rem: '3rem' },
	{ token: '--space-3xl', rem: '4rem' }
]

const RADIUS_SCALE = [
	{ key: 'sm', token: '--radius-sm', px: '6px' },
	{ key: 'md', token: '--radius-md', px: '8px' },
	{ key: 'lg', token: '--radius-lg', px: '10px' },
	{ key: 'xl', token: '--radius-xl', px: '14px' }
]

export const Spacing = () => (
	<div className="DocsPage">
		<header className="hero">
			<div className="eyebrow">
				<span>DESIGN SYSTEM</span>
				<span className="line" />
			</div>
			<h1>Spacing.</h1>
			<p className="lede">
				One base unit, two scales. <span className="muted">A raw spacing ramp, and the size keywords layout primitives take.</span>
			</p>
		</header>

		<section className="section" id="gap-scale">
			<div className="section-head">
				<span className="dot purple" />
				<h2>Gap / inset keywords</h2>
				<span className="tag">resolveSize() · layout-schema.ts</span>
			</div>
			<p className="section-sub">
				What <code>gap</code>, <code>inset</code>, <code>inset-x</code>, and <code>inset-y</code> take on z-stack, z-grid,
				z-cluster, z-center, z-container, z-section, z-surface, z-scroll, and z-spacer's <code>size</code>.
			</p>
			<div className="panel">
				{SIZE_SCALE.map((s) => (
					<div className="space-row" key={s.key}>
						<span className="space-token">{s.key}</span>
						<div className="space-bar" style={{ width: s.rem }} />
						<span className="space-value">
							{s.rem} · {s.var}
						</span>
					</div>
				))}
			</div>
		</section>

		<section className="section" id="raw-scale">
			<div className="section-head">
				<span className="dot pink" />
				<h2>Semantic aliases</h2>
				<span className="tag">--space-xs…3xl</span>
			</div>
			<p className="section-sub">
				Older, hand-named aliases used by already-shipped components (see the bridging-aliases comment in{' '}
				<code>ink.css</code>).
			</p>
			<div className="panel">
				{SEMANTIC_SPACE.map((s) => (
					<SpaceRow key={s.token} token={s.token} rem={s.rem} />
				))}
			</div>
		</section>

		<section className="section" id="radius">
			<div className="section-head">
				<span className="dot purple" />
				<h2>Radius</h2>
				<span className="tag">--radius-sm…xl</span>
			</div>
			<p className="section-sub">
				<code>--base-radius</code> is 0.625rem (10px); every step is a fixed offset from it, not a multiple.
			</p>
			<div className="swatch-row">
				{RADIUS_SCALE.map((r) => (
					<div className="swatch" key={r.key}>
						<div className="swatch-fill" style={{ borderRadius: `var(${r.token})`, background: 'var(--color-neutral-2)' }} />
						<span className="swatch-label">{r.key}</span>
						<span className="swatch-token">
							{r.token} · {r.px}
						</span>
					</div>
				))}
			</div>
		</section>

		<footer className="docs-footer">
			<span>zest · one base unit, 0.25rem</span>
			<span>
				<DocsLink href="/color">Color</DocsLink> · <DocsLink href="/layout">Layout</DocsLink> · <DocsLink href="~/">Home</DocsLink>
			</span>
		</footer>
	</div>
)
