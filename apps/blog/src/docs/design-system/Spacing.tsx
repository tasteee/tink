import { DocsLink } from '@app/docs/DocsLink'
import { DocsFooter, DocsHero, DocsSection } from '@app/docs/DocsChrome'

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
		<DocsHero
			eyebrow="DESIGN SYSTEM"
			title="Spacing."
			lede={
				<>
					One base unit, two scales.{' '}
					<z-inline color="muted" weight="400">
						A raw spacing ramp, and the size keywords layout primitives take.
					</z-inline>
				</>
			}
		/>

		<DocsSection
			id="gap-scale"
			tone="primary"
			title="Gap / inset keywords"
			tag="resolveSize() · layout-schema.ts"
			sub={
				<>
					What <code className="inline">gap</code>, <code className="inline">inset</code>, <code className="inline">inset-x</code>,
					and <code className="inline">inset-y</code> take on z-stack, z-grid, z-cluster, z-center, z-container, z-section,
					z-surface, z-scroll, and z-spacer's <code className="inline">size</code>.
				</>
			}
		>
			<z-stack isColumn gap="0">
				{SIZE_SCALE.map((s) => (
					<div className="space-row" key={s.key}>
						<span className="space-token">{s.key}</span>
						<div className="space-bar" style={{ width: s.rem }} />
						<span className="space-value">
							{s.rem} · {s.var}
						</span>
					</div>
				))}
			</z-stack>
		</DocsSection>

		<DocsSection
			id="raw-scale"
			tone="secondary"
			title="Semantic aliases"
			tag="--space-xs…3xl"
			sub={
				<>
					Older, hand-named aliases used by already-shipped components (see the bridging-aliases comment in{' '}
					<code className="inline">ink.css</code>).
				</>
			}
		>
			<z-stack isColumn gap="0">
				{SEMANTIC_SPACE.map((s) => (
					<SpaceRow key={s.token} token={s.token} rem={s.rem} />
				))}
			</z-stack>
		</DocsSection>

		<DocsSection
			id="radius"
			tone="primary"
			title="Radius"
			tag="--radius-sm…xl"
			sub={
				<>
					<code className="inline">--base-radius</code> is 0.625rem (10px); every step is a fixed offset from it, not a multiple.
				</>
			}
		>
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
		</DocsSection>

		<DocsFooter
			links={
				<>
					<DocsLink href="/color">Color</DocsLink> · <DocsLink href="/layout">Layout</DocsLink> ·{' '}
					<DocsLink href="~/">Home</DocsLink>
				</>
			}
		>
			zest · one base unit, 0.25rem
		</DocsFooter>
	</div>
)
