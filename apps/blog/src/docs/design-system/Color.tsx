import { DocsLink } from '@app/docs/DocsLink'
import { DocsFooter, DocsHero, DocsSection } from '@app/docs/DocsChrome'

// Swatches render the literal CSS var so this page can never drift from the
// token values shipped in packages/zest/src/ink.css.
const Swatch = ({ token, label, hint }: { token: string; label: string; hint?: string }) => {
	const swatch = (
		<div className="swatch" tabIndex={hint ? 0 : undefined}>
			<div className="swatch-fill" style={{ background: `var(${token})` }} />
			<span className="swatch-label">{label}</span>
			<span className="swatch-token">{token}</span>
		</div>
	)

	return hint ? (
		<z-tooltip content={hint} placement="top">
			{swatch}
		</z-tooltip>
	) : (
		swatch
	)
}

const RAMP_STEPS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

const SEMANTIC_TOKENS = [
	{
		token: '--foreground',
		label: 'Foreground',
		hint: 'Default text and icon color (neutral 8). Body copy, headings, and any content that needs full contrast against the page background.'
	},
	{
		token: '--muted-foreground',
		label: 'Muted foreground',
		hint: 'Secondary text (neutral 6). Captions, helper text, placeholders, timestamps, and anything that should recede behind the main content.'
	},
	{
		token: '--border',
		label: 'Border',
		hint: 'Hairline color (neutral 3). Card and input outlines, dividers, and separators. Zest uses borders instead of shadows for separation.'
	},
	{
		token: '--ring',
		label: 'Focus ring',
		hint: 'Keyboard focus outline (neutral 4). Drawn around any interactive element reached with the keyboard; never removed.'
	},
	{
		token: '--accent',
		label: 'Accent (purple)',
		hint: 'The main accent. Active and selected states, links, and the one primary action or highlight on a screen.'
	},
	{
		token: '--accent-alt',
		label: 'Accent alt (pink)',
		hint: 'The secondary accent. Pairs with the main accent for gradients, charts, and a second level of emphasis. Use sparingly.'
	},
	{
		token: '--destructive',
		label: 'Destructive',
		hint: 'Errors and irreversible actions: delete buttons, invalid fields, failure alerts. Reserved for these cases only.'
	},
	{
		token: '--success',
		label: 'Success',
		hint: 'Positive outcomes: completed steps, saved confirmations, passing checks, and healthy status indicators.'
	},
	{
		token: '--warning',
		label: 'Warning',
		hint: 'Caution without failure: things that need attention soon, risky-but-allowed actions, and degraded status.'
	}
]

export const Color = () => (
	<div className="DocsPage">
		<DocsHero
			eyebrow="DESIGN SYSTEM"
			title="Color."
			lede={
				<>
					OKLCH-derived ramps, dark only.{' '}
					<z-inline color="muted" weight="400">
						Purple and pink accents, ten-step neutrals.
					</z-inline>
				</>
			}
		/>

		<DocsSection
			id="primary"
			tone="secondary"
			title="Primary, pink"
			tag="--color-primary-0…9"
			sub={
				<>
					Derived from <code className="inline">--base-accent-color-0</code>. <code className="inline">--color-primary-4</code> is
					the base, steps below darken toward the background, steps above lighten toward white.
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
			title="Secondary, purple"
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
			sub="What components actually read. Hover a swatch to see what it is for. Each aliases back to a step on one of the ramps above, so retheme by moving the alias, not by touching the ramp."
		>
			<div className="swatch-row">
				{SEMANTIC_TOKENS.map((t) => (
					<Swatch key={t.token} token={t.token} label={t.label} hint={t.hint} />
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
