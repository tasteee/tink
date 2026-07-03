import { DocsLink } from '@app/docs/DocsLink'

// Swatches render the literal CSS var so this page can never drift from the
// token values shipped in packages/zest/src/ink.css.
const Swatch = ({ token, label }: { token: string; label: string }) => (
	<div className="swatch">
		<div className="swatch-fill" style={{ background: `var(${token})` }} />
		<span className="swatch-label">{label}</span>
		<span className="swatch-token">{token}</span>
	</div>
)

const RAMP_STEPS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

const SEMANTIC_TOKENS = [
	{ token: '--foreground', label: 'Foreground' },
	{ token: '--muted-foreground', label: 'Muted foreground' },
	{ token: '--border', label: 'Border' },
	{ token: '--ring', label: 'Focus ring' },
	{ token: '--accent', label: 'Accent (purple)' },
	{ token: '--accent-alt', label: 'Accent alt (pink)' },
	{ token: '--destructive', label: 'Destructive' },
	{ token: '--success', label: 'Success' },
	{ token: '--warning', label: 'Warning' }
]

export const Color = () => (
	<div className="DocsPage">
		<header className="hero">
			<div className="eyebrow">
				<span>DESIGN SYSTEM</span>
				<span className="line" />
			</div>
			<h1>Color.</h1>
			<p className="lede">
				OKLCH-derived ramps, dark only. <span className="muted">Purple and pink accents, ten-step neutrals.</span>
			</p>
		</header>

		<section className="section" id="primary">
			<div className="section-head">
				<span className="dot pink" />
				<h2>Primary — pink</h2>
				<span className="tag">--color-primary-0…9</span>
			</div>
			<p className="section-sub">
				Derived from <code>--base-accent-color-0</code>. <code>--color-primary-4</code> is the base — steps below darken toward
				the background, steps above lighten toward white.
			</p>
			<div className="swatch-row">
				{RAMP_STEPS.map((step) => (
					<Swatch key={step} token={`--color-primary-${step}`} label={step} />
				))}
			</div>
		</section>

		<section className="section" id="secondary">
			<div className="section-head">
				<span className="dot purple" />
				<h2>Secondary — purple</h2>
				<span className="tag">--color-secondary-0…9</span>
			</div>
			<p className="section-sub">
				Derived from <code>--base-accent-color-1</code>, the same way as the primary ramp.
			</p>
			<div className="swatch-row">
				{RAMP_STEPS.map((step) => (
					<Swatch key={step} token={`--color-secondary-${step}`} label={step} />
				))}
			</div>
		</section>

		<section className="section" id="neutral">
			<div className="section-head">
				<span className="dot purple" />
				<h2>Neutral</h2>
				<span className="tag">--color-neutral-0…9</span>
			</div>
			<p className="section-sub">
				<code>--color-neutral-0</code> is the page background (<code>--bg</code>); <code>--color-neutral-8</code> is
				<code> --foreground</code>. Lightness climbs monotonically from 0 to 9.
			</p>
			<div className="swatch-row">
				{RAMP_STEPS.map((step) => (
					<Swatch key={step} token={`--color-neutral-${step}`} label={step} />
				))}
			</div>
		</section>

		<section className="section" id="semantic">
			<div className="section-head">
				<span className="dot pink" />
				<h2>Semantic aliases</h2>
			</div>
			<p className="section-sub">
				What components actually read. Each aliases back to a step on one of the ramps above — retheme by moving the alias, not
				by touching the ramp.
			</p>
			<div className="swatch-row">
				{SEMANTIC_TOKENS.map((t) => (
					<Swatch key={t.token} token={t.token} label={t.label} />
				))}
			</div>
		</section>

		<footer className="docs-footer">
			<span>zest · dark only · OKLCH throughout</span>
			<span>
				<DocsLink href="/spacing">Spacing</DocsLink> · <DocsLink href="/typography">Typography</DocsLink> · <DocsLink href="~/">Home</DocsLink>
			</span>
		</footer>
	</div>
)
