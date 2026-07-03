import { DocsLink } from '@app/docs/DocsLink'
import { DocsFooter, DocsHero, DocsSectionHead } from '@app/docs/DocsChrome'

// Ported from pages/typography-components.html. Pure content — no demo scripts.
// Shared top nav comes from SiteShell; this is the page body.
export const Typography = () => (
	<div className="DocsPage">
		<DocsHero
			eyebrow="TYPE SYSTEM"
			title="Typography"
			lede={
				<z-text tag="span" color="muted" weight="400">
					One family — DM Sans — across one tightly tuned scale. Hierarchy comes from size and weight, color from
					intent. Below: the scale itself, then the same type doing real work in a long-form article.
				</z-text>
			}
		>
			<nav className="DocsSubnav">
				<a href="#scale">The Scale</a>
				<a href="#text">Body &amp; Labels</a>
				<a href="#article">In Context</a>
			</nav>
		</DocsHero>

		{/* ── THE SCALE ── */}
		<section className="section" id="scale">
			<DocsSectionHead tone="primary">The Scale</DocsSectionHead>
			<p className="section-sub">
				Six heading steps map one-to-one onto <code className="inline">h1</code>–
				<code className="inline">h6</code>; the tag is derived from <code className="inline">size</code>, so
				visual rank and document outline never drift apart. Each row notes when to reach for it.
			</p>

			{HEADINGS.map((h) => (
				<div className="scale-row" key={h.token}>
					<div className="scale-meta">
						<span className="token">size="{h.token}"</span>
						{h.meta}
					</div>
					<div className="scale-sample">
						<z-heading size={h.token}>{h.sample}</z-heading>
						<p className="usage">
							<strong>{h.usageTitle}</strong> {h.usage}
						</p>
					</div>
				</div>
			))}
		</section>

		{/* ── BODY, LABELS, EYEBROWS ── */}
		<section className="section" id="text">
			<DocsSectionHead tone="secondary">Body, Labels &amp; the Rest</DocsSectionHead>
			<p className="section-sub">
				Running text sits in <code className="inline">&lt;z-text&gt;</code>; UI labels in{' '}
				<code className="inline">&lt;z-label&gt;</code>; tracked eyebrows in{' '}
				<code className="inline">&lt;z-subheading&gt;</code>. Each row below says when to reach for it — plus
				the color, weight, and style axes that cut across all of them.
			</p>

			<div className="micro">Body — z-text</div>
			{BODY.map((b) => (
				<div className="scale-row" key={b.token}>
					<div className="scale-meta">
						<span className="token">size="{b.token}"</span>
						{b.meta}
					</div>
					<div className="scale-sample">
						<z-text size={b.token} color={b.muted ? 'muted' : undefined}>
							{b.sample}
						</z-text>
						<p className="usage">
							<strong>{b.usageTitle}</strong> {b.usage}
						</p>
					</div>
				</div>
			))}

			<div className="micro" style={{ marginTop: '3.5rem' }}>
				Labels — z-label · weight 500
			</div>
			{LABELS.map((l) => (
				<div className="scale-row" key={l.token}>
					<div className="scale-meta">
						<span className="token">size="{l.token}"</span>
						{l.meta}
					</div>
					<div className="scale-sample">
						<z-label size={l.token} color={l.muted ? 'muted' : undefined}>
							{l.sample}
						</z-label>
						<p className="usage">
							<strong>{l.usageTitle}</strong> {l.usage}
						</p>
					</div>
				</div>
			))}

			<div className="micro" style={{ marginTop: '3.5rem' }}>
				Eyebrows — z-subheading
			</div>
			<div className="scale-row">
				<div className="scale-meta">
					<span className="token">z-subheading</span>
					uppercase · tracked
				</div>
				<div className="scale-sample">
					<z-subheading size="sm" color="primary">
						Platform · Developer Advocacy
					</z-subheading>
					<p className="usage">
						<strong>The kicker above a title.</strong> A category or section label that introduces a
						heading. Always sits above a heading — never used as body copy.
					</p>
				</div>
			</div>

			<div className="micro" style={{ marginTop: '3.5rem' }}>
				Color — intent, not decoration
			</div>
			{COLORS.map((c) => (
				<div className="scale-row" key={c.token}>
					<div className="scale-meta">
						<span className="token">{c.token}</span>
						{c.meta}
					</div>
					<div className="scale-sample">
						<z-text size="lg" color={c.color}>
							{c.sample}
						</z-text>
						<p className="usage">
							<strong>{c.usageTitle}</strong> {c.usage}
						</p>
					</div>
				</div>
			))}

			<div className="micro" style={{ marginTop: '3.5rem' }}>
				Weight
			</div>
			{WEIGHTS.map((w) => (
				<div className="scale-row" key={w.weight}>
					<div className="scale-meta">
						<span className="token">weight="{w.weight}"</span>
						{w.meta}
					</div>
					<div className="scale-sample">
						<z-text size="lg" weight={w.weight}>
							{w.sample}
						</z-text>
						<p className="usage">
							<strong>{w.usageTitle}</strong> {w.usage}
						</p>
					</div>
				</div>
			))}

			<div className="micro" style={{ marginTop: '3.5rem' }}>
				Style
			</div>
			<div className="scale-row">
				<div className="scale-meta">
					<span className="token">is-italic</span>—
				</div>
				<div className="scale-sample">
					<z-text size="lg" isItalic>
						Italic for emphasis and terms
					</z-text>
					<p className="usage">
						<strong>Emphasis &amp; terms.</strong> Stressed words, defined terms, and titles of works.
					</p>
				</div>
			</div>
			<div className="scale-row">
				<div className="scale-meta">
					<span className="token">is-underlined</span>—
				</div>
				<div className="scale-sample">
					<z-text size="lg" isUnderlined>
						Underlined
					</z-text>
					<p className="usage">
						<strong>Links only.</strong> Reserve the underline for links so it keeps its meaning — never use
						it for emphasis.
					</p>
				</div>
			</div>
			<div className="scale-row">
				<div className="scale-meta">
					<span className="token">is-strikethrough</span>—
				</div>
				<div className="scale-sample">
					<z-text size="lg" isStrikethrough color="muted">
						Struck through
					</z-text>
					<p className="usage">
						<strong>Removed values.</strong> Deprecated or superseded content — old prices, completed
						to-dos.
					</p>
				</div>
			</div>
		</section>

		{/* ── IN CONTEXT — THE ARTICLE ── */}
		<section className="section" id="article">
			<DocsSectionHead tone="primary">In Context</DocsSectionHead>
			<p className="section-sub">
				The real test of a type system is a wall of words. Here it is, set the way you'd actually publish it.
			</p>

			<article className="article">
				<z-subheading size="sm" color="primary" style={{ display: 'block', marginBottom: '1rem' }}>
					Platform · Developer Advocacy
				</z-subheading>
				<z-heading size="lg">The Internal Platform Deserves a Brand</z-heading>

				<div className="dek">
					<z-text size="xl" color="muted">
						We ship the same caliber of tooling inward that we'd never dare ship outward unbranded. Treating
						internal architecture like a product — name, voice, docs, and all — is the difference between
						adoption and a wiki graveyard.
					</z-text>
				</div>

				<div className="article-meta">
					<span className="av" />
					<z-text size="sm">The Platform Team</z-text>
					<span className="sep" />
					<z-text size="sm" color="muted">
						8 min read
					</z-text>
					<span className="sep" />
					<z-text size="sm" color="muted">
						Engineering
					</z-text>
				</div>

				<z-line style={{ margin: '2.5rem 0' }} />

				<div className="article-body">
					<z-text size="lg" color="muted">
						Every large engineering org eventually builds the same thing twice. A team spins up a deployment
						pipeline, a config service, a feature-flag layer — solid work, genuinely useful — and eighteen
						months later a different team, three floors away, builds it again, because nobody knew the first
						one existed. The failure is rarely technical. It's that the first project had no{' '}
						<z-text tag="span" size="lg" isItalic>
							presence
						</z-text>
						. No name you'd remember, no front door, no story. It was infrastructure in the most literal
						sense: invisible until it breaks.
					</z-text>

					<z-text size="lg" color="muted">
						The fix is uncomfortable for a lot of engineers, because it sounds like marketing. But branding
						an internal platform isn't about gloss. It's about making a system{' '}
						<z-text tag="span" size="lg" isItalic>
							legible
						</z-text>{' '}
						to the people who are supposed to build on it. A brand is a compression algorithm for trust.
					</z-text>

					<z-heading size="sm" tag="h2">
						Naming is an architectural decision
					</z-heading>

					<z-text size="lg" color="muted">
						A service called <code className="inline">internal-config-svc-v2</code> tells you everything
						except why you'd use it. A platform called{' '}
						<z-text tag="span" size="lg" weight="600">
							Keystone
						</z-text>{' '}
						gives the team a noun to rally around, a thing to say in a standup, a tag to search Slack for.
						Naming forces the owners to answer the only question that matters: what is the one job this does?
						If you can't name it, you haven't scoped it.
					</z-text>

					<div className="pullquote">
						<z-heading size="xs" tag="p" color="primary">
							“A brand is a compression algorithm for trust. The name does the first 80% of the
							documentation's job before anyone reads a word.”
						</z-heading>
					</div>

					<z-text size="lg" color="muted">
						This is where developer advocacy stops being a job title and starts being a discipline. The
						advocate's work is to stand between the platform and its users and relentlessly ask whether the
						system makes sense from the outside. Internally, your users are engineers — the most impatient,
						most skeptical audience you will ever ship to. They will read exactly one paragraph before
						deciding whether you've wasted their afternoon.
					</z-text>

					<z-heading size="sm" tag="h2">
						Documentation is the product
					</z-heading>

					<z-text size="lg" color="muted">
						For an internal platform, the docs aren't an accessory to the product — for most of your users,
						on most days, the docs{' '}
						<z-text tag="span" size="lg" isItalic>
							are
						</z-text>{' '}
						the product. They are the surface people actually touch. That reframing changes how you staff and
						resource them. A few principles we hold to:
					</z-text>

					<ul className="article-list">
						<li>
							<strong>Start with the five-minute path.</strong> If a new engineer can't get one real thing
							working in five minutes, the rest of the docs don't matter.
						</li>
						<li>
							<strong>Write in the second person.</strong> "You configure" beats "the system is
							configured." Advocacy is personal.
						</li>
						<li>
							<strong>Show the failure modes.</strong> The most-read page in any internal doc set is the
							one titled "Why isn't it working?"
						</li>
						<li>
							<strong>Keep one voice.</strong> A platform that sounds like six different people wrote its
							docs reads like six different platforms.
						</li>
					</ul>

					<z-text size="lg" color="muted">
						None of this is possible without a type system, incidentally — which is the quiet argument this
						whole page is making. Consistent hierarchy is what lets a reader skim a 2,000-word runbook and
						still feel oriented. When every heading, caption, and callout is drawn from the same scale, the
						structure does half the explaining for free. You stop writing "Note:" because the reader can
						already{' '}
						<z-text tag="span" size="lg" isItalic>
							see
						</z-text>{' '}
						what's a note.
					</z-text>

					<z-heading size="sm" tag="h2">
						Treat engineers as users, measure like a product
					</z-heading>

					<z-text size="lg" color="muted">
						The teams that get internal adoption right borrow shamelessly from consumer product practice.
						They run onboarding funnels and watch where people drop off. They hold office hours. They write
						changelogs that someone would actually want to read. They publish a status page so trust survives
						the inevitable outage. For more on the mechanics, the{' '}
						<z-link href="#" tone="primary">
							platform playbook
						</z-link>{' '}
						collects the patterns we keep reaching for, and the{' '}
						<z-link href="#" tone="secondary">
							adoption metrics dashboard
						</z-link>{' '}
						is where we keep ourselves honest.
					</z-text>

					<z-text size="lg" color="muted">
						The return on all of this is compounding. A platform with a brand gets recommended in interviews
						and onboarding. It accretes a community of power users who answer questions you'd otherwise field
						yourself. It becomes, eventually, the obvious choice — not because it was mandated, but because
						choosing anything else now feels like swimming upstream. That is what advocacy buys you: not a
						launch, but a default.
					</z-text>

					<z-separator label="The end" style={{ margin: '3rem 0 1.5rem' }} />

					<z-text size="sm" color="muted">
						Written with the zest type system. Body copy is{' '}
						<code className="inline">z-text size="lg"</code>; section heads are{' '}
						<code className="inline">z-heading size="sm"</code> overridden to{' '}
						<code className="inline">h2</code>; the dek is{' '}
						<code className="inline">z-text size="xl" color="muted"</code>.
					</z-text>
				</div>
			</article>
		</section>

		<DocsFooter
			links={
				<>
					<DocsLink href="/color">Color</DocsLink> · <DocsLink href="/layout">Layout</DocsLink> ·{' '}
					<DocsLink href="~/">Home</DocsLink>
				</>
			}
		>
			zest · dark only · borders over shadows
		</DocsFooter>
	</div>
)

const HEADINGS = [
	{ token: 'xxl', meta: '64 / 72 · h1', sample: 'Almost before we knew it', usageTitle: 'Hero & page titles.', usage: "The single largest thing on a screen. Use it once per page — reaching for it twice flattens the hierarchy and nothing reads as the title." },
	{ token: 'xl', meta: '56 / 64 · h2', sample: 'we had left the ground', usageTitle: 'Marketing section openers.', usage: "Big landing-page moments where you want scale, but the block isn't the page's title. Rare inside the app." },
	{ token: 'lg', meta: '48 / 56 · h3', sample: 'The spectacle before us', usageTitle: 'Long-form titles.', usage: 'The headline of an article, doc, or a primary content section — the top of a reading column.' },
	{ token: 'md', meta: '40 / 52 · h4', sample: 'was indeed sublime', usageTitle: 'The working heading.', usage: 'The default "big heading" inside app screens and dense pages — section headers on dashboards and settings.' },
	{ token: 'sm', meta: '32 / 40 · h5', sample: 'Pack my box with five', usageTitle: 'Card, dialog & sub-section titles.', usage: 'Heads inside cards, modals, sheets, and sub-sections of an article. Often pair with a tag override so the visible size doesn’t dictate the document outline.' },
	{ token: 'xs', meta: '24 / 32 · h6', sample: 'dozen liquor jugs', usageTitle: 'The smallest heading.', usage: 'List-group and sidebar section labels, compact card titles, and pull-quotes — a heading where space is tight.' }
] as const

const BODY = [
	{ token: 'xl', meta: '20 / 32', sample: 'A lead paragraph that opens the piece', usageTitle: 'Deks & lead-ins.', usage: 'The standfirst directly under a title. One per article — it tells the reader "start here."', muted: false },
	{ token: 'lg', meta: '18 / 32', sample: 'Long-form reading copy, set for the long haul', usageTitle: 'Long-form prose.', usage: 'Articles, docs, and marketing body. The most comfortable size for sustained reading.', muted: false },
	{ token: 'md', meta: '16 / 28', sample: 'In-app body copy and descriptions', usageTitle: 'In-app body.', usage: 'Descriptions, help text, card content — the default once you are inside the product.', muted: false },
	{ token: 'sm', meta: '14 / 24', sample: 'Captions, metadata, and helper text', usageTitle: 'Secondary text.', usage: 'Captions, table cells, timestamps, and the helper line under an input.', muted: true },
	{ token: 'xs', meta: '12 / 16', sample: 'Fine print and dense metadata', usageTitle: 'Fine print.', usage: 'Footnotes, legal, and dense metadata. The legibility floor — reach for it sparingly.', muted: true }
] as const

const LABELS = [
	{ token: 'lg', meta: '18 / 24', sample: 'Prominent field label', usageTitle: 'Spacious forms.', usage: 'Prominent field labels and section toggles where the form has room to breathe.', muted: false },
	{ token: 'md', meta: '16 / 24', sample: 'Standard control label', usageTitle: 'The default label.', usage: 'Form and control labels at typical app density.', muted: false },
	{ token: 'sm', meta: '14 / 20', sample: 'Compact label', usageTitle: 'Compact UI.', usage: 'Inline control labels and table column headers.', muted: false },
	{ token: 'xs', meta: '12 / 16', sample: 'Micro label', usageTitle: 'Micro labels.', usage: 'Chips, tags, and dense toolbars.', muted: true }
] as const

const COLORS = [
	{ token: 'color (default)', meta: '--foreground', color: undefined, sample: 'Default foreground for primary reading', usageTitle: 'Primary ink.', usage: 'Headings and the text you most want read. The brightest value — reserve it for what matters.' },
	{ token: 'color="muted"', meta: '--muted-foreground', color: 'muted', sample: 'Muted for support and de-emphasis', usageTitle: 'Supporting copy.', usage: 'Captions, metadata, and long passages of body text where full-bright white would fatigue the eye.' },
	{ token: 'color="primary"', meta: '--purple', color: 'primary', sample: 'Purple marks the primary accent', usageTitle: 'Primary accent.', usage: 'Links, active states, and a single point of emphasis. Not for running text.' },
	{ token: 'color="secondary"', meta: '--pink', color: 'secondary', sample: 'Pink marks the secondary accent', usageTitle: 'Secondary accent.', usage: 'A contrasting highlight, used sparingly so it stays special.' }
] as const

const WEIGHTS = [
	{ weight: '300', meta: 'light', sample: 'Light — airy at display sizes', usageTitle: 'Display only.', usage: 'Large sizes where you want airiness. Avoid in body — it gets fragile small.' },
	{ weight: '400', meta: 'regular', sample: 'Regular — the body default', usageTitle: 'Body default.', usage: 'The weight all running text is set in.' },
	{ weight: '600', meta: 'semibold', sample: 'Semibold — inline emphasis', usageTitle: 'Emphasis.', usage: 'Strong words within a sentence and heavier UI labels.' },
	{ weight: '700', meta: 'bold', sample: 'Bold — every heading', usageTitle: 'Headings.', usage: 'The default weight for the whole heading scale.' },
	{ weight: '900', meta: 'black', sample: 'Black — a single hero word', usageTitle: 'Display punch.', usage: 'Rare — a single hero word or number. Never a sentence.' }
] as const
