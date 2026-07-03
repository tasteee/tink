import type { ReactNode } from 'react'

/*
 * Shared docs page chrome, composed entirely from z-* elements — the repeated
 * hero / section-head / footer that every docs page used to hand-roll in raw
 * HTML against docs.css. These are app-level compositions of the design system,
 * which is exactly where a page-specific pattern belongs: built from z-*, not
 * bespoke CSS.
 */

type Tone = 'primary' | 'secondary'

// Hero: mono eyebrow + fluid display title + optional lede, closed by a rule.
// `children` slots extra content into the hero (e.g. a section subnav).
export const DocsHero = (props: { eyebrow: string; title: string; lede?: ReactNode; children?: ReactNode }) => (
	<>
		<z-stack isColumn gap="lg" insetY="3xl">
			<z-eyebrow hasRule>{props.eyebrow}</z-eyebrow>
			<z-display>{props.title}</z-display>
			{props.lede && (
				<z-text size="xl" weight="500" style={{ maxWidth: '46ch' }}>
					{props.lede}
				</z-text>
			)}
			{props.children}
		</z-stack>
		<z-line />
	</>
)

// Section header: accent status dot (z-badge dot mode) + heading, with an
// optional right-aligned mono tag (e.g. a token range).
export const DocsSectionHead = (props: { tone: Tone; children: ReactNode; tag?: string }) => (
	<z-stack isRow alignsY="center" gap="xs" fullWidth>
		<z-badge isDot tone={props.tone} />
		<z-heading size="xs" tag="h2">
			{props.children}
		</z-heading>
		{props.tag && (
			<>
				<z-spacer grow />
				<z-text tag="span" size="xs" color="muted" style={{ fontFamily: 'var(--font-mono)' }}>
					{props.tag}
				</z-text>
			</>
		)}
	</z-stack>
)

// A demo well: padded, subtly separated from the surrounding documentation by a
// soft fill (not a hard outline) so examples read as their own surface.
export const DocsDemo = (props: { children: ReactNode }) => (
	<z-surface variant="soft" inset="lg" radius="lg">
		{props.children}
	</z-surface>
)

// A titled section band: header + optional sub copy, then the section body.
export const DocsSection = (props: { id?: string; tone: Tone; title: ReactNode; tag?: string; sub?: ReactNode; children: ReactNode }) => (
	<z-section id={props.id} spaceTop="2xl">
		<z-stack isColumn gap="sm">
			<DocsSectionHead tone={props.tone} tag={props.tag}>
				{props.title}
			</DocsSectionHead>
			{props.sub && (
				<z-text color="muted" size="sm" style={{ maxWidth: '60ch' }}>
					{props.sub}
				</z-text>
			)}
			{props.children}
		</z-stack>
	</z-section>
)

// Footer: a closing rule, then a caption on the left and nav links on the right.
export const DocsFooter = (props: { children: ReactNode; links: ReactNode }) => (
	<z-section spaceTop="4xl">
		<z-line />
		<z-cluster fullWidth alignsX="between" alignsY="center" gap="sm" style={{ paddingTop: '2rem' }}>
			<z-text tag="span" size="xs" color="muted">
				{props.children}
			</z-text>
			<z-text tag="span" size="xs" color="muted">
				{props.links}
			</z-text>
		</z-cluster>
	</z-section>
)
