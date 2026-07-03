import { DocsLink } from '@app/docs/DocsLink'
import { DocsFooter, DocsHero, DocsSection } from '@app/docs/DocsChrome'

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
		<DocsHero
			eyebrow="DESIGN SYSTEM"
			title="Color."
			lede={
				<>
					OKLCH-derived ramps, dark only.{' '}
					<z-text tag="span" color="muted" weight="400">
						Purple and pink accents, ten-step neutrals.
					</z-text>
				</>
			}
		/>

		<DocsSection
			id="primary"
			tone="secondary"
			title="Primary — pink"
			tag="--color-primary-0…9"
			sub={
				<>
					Derived from <code className="inline">--base-accent-color-0</code>. <code className="inline">--color-primary-4</code> is
					the base — steps below darken toward the background, steps above lighten toward white.
				</>
			}
		>
			<div className="swatch-row">
				{RAMP_STEPS.map((step) => (
					<Swatch key={step} token={`--color-primary-${step}`} label={step} />
				))}
			</div>
		</DocsSection>

		<DocsSection
			id="secondary"
			tone="primary"
			title="Secondary — purple"
			tag="--color-secondary-0…9"
			sub={
				<>
					Derived from <code className="inline">--base-accent-color-1</code>, the same way as the primary ramp.
				</>
			}
		>
			<div className="swatch-row">
				{RAMP_STEPS.map((step) => (
					<Swatch key={step} token={`--color-secondary-${step}`} label={step} />
				))}
			</div>
		</DocsSection>

		<DocsSection
			id="neutral"
			tone="primary"
			title="Neutral"
			tag="--color-neutral-0…9"
			sub={
				<>
					<code className="inline">--color-neutral-0</code> is the page background (<code className="inline">--bg</code>);{' '}
					<code className="inline">--color-neutral-8</code> is <code className="inline">--foreground</code>. Lightness climbs
					monotonically from 0 to 9.
				</>
			}
		>
			<div className="swatch-row">
				{RAMP_STEPS.map((step) => (
					<Swatch key={step} token={`--color-neutral-${step}`} label={step} />
				))}
			</div>
		</DocsSection>

		<DocsSection
			id="semantic"
			tone="secondary"
			title="Semantic aliases"
			sub="What components actually read. Each aliases back to a step on one of the ramps above — retheme by moving the alias, not by touching the ramp."
		>
			<div className="swatch-row">
				{SEMANTIC_TOKENS.map((t) => (
					<Swatch key={t.token} token={t.token} label={t.label} />
				))}
			</div>
		</DocsSection>

		<DocsFooter
			links={
				<>
					<DocsLink href="/spacing">Spacing</DocsLink> · <DocsLink href="/typography">Typography</DocsLink> ·{' '}
					<DocsLink href="~/">Home</DocsLink>
				</>
			}
		>
			zest · dark only · OKLCH throughout
		</DocsFooter>
	</div>
)
