import { DocsLink } from '@app/docs/DocsLink'
import { DocsFooter, DocsHero } from '@app/docs/DocsChrome'

export const Rules = () => (
	<div className="DocsPage">
		<DocsHero
			eyebrow="DESIGN SYSTEM"
			title="Design rules."
			lede={
				<>
					The constraints that keep zest coherent.{' '}
					<z-text tag="span" color="muted" weight="400">
						Break one on purpose, not by accident.
					</z-text>
				</>
			}
		/>

		<section className="section" id="article">
			<article className="article">
				<div className="article-body">
					<z-heading size="sm" tag="h2">
						Borders over shadows
					</z-heading>
					<z-text>
						No box-shadows, anywhere. Elevation and separation come from a 1px border (<code className="inline">--border</code>
						) or a shift on the neutral ramp (<code className="inline">--color-neutral-0…9</code>), never a drop shadow. It
						reads flatter and more precise, and it means one fewer axis of inconsistency across 67 components.
					</z-text>

					<z-heading size="sm" tag="h2">
						Dark only, OKLCH throughout
					</z-heading>
					<z-text>
						There is no light theme. Every color ramp — primary, secondary, neutral — is generated in OKLCH/OKLab from a
						single base accent color, so lightness steps stay perceptually even instead of eyeballed. See{' '}
						<DocsLink href="/color">Color</DocsLink> for the ramps themselves.
					</z-text>

					<z-heading size="sm" tag="h2">
						One typeface, one scale
					</z-heading>
					<z-text>
						DM Sans for everything — body copy and headings both — with DM Mono reserved for code, tokens, and the small
						mono labels that mark a demo's props. Hierarchy comes from size and weight, never a second font family. Full
						scale on <DocsLink href="/typography">Typography</DocsLink>.
					</z-text>

					<z-heading size="sm" tag="h2">
						Purple and pink are accents, not defaults
					</z-heading>
					<z-text>
						<code className="inline">tone="primary"</code> (purple) and <code className="inline">tone="secondary"</code>{' '}
						(pink) exist to draw the eye to the one thing that matters on a screen — a primary action, an active state, a
						highlighted stat. Everything else defaults to neutral. If most of a page is purple, the accent has stopped
						meaning anything.
					</z-text>

					<div className="pullquote">
						<z-text size="lg">Red means broken. It's reserved for destructive actions and error states — nowhere else.</z-text>
					</div>

					<z-heading size="sm" tag="h2">
						Zero runtime dependencies
					</z-heading>
					<z-text>
						Every <code className="inline">z-*</code> element is an Atomico web component with its own encapsulated shadow-DOM
						styles. The library ships as one self-contained bundle — no peer deps, no CSS-in-JS runtime, framework-agnostic
						by construction (plain HTML, React, Vue, Svelte all consume the same custom elements).
					</z-text>

					<z-heading size="sm" tag="h2">
						Tokens, not literals
					</z-heading>
					<z-text>
						Colors, spacing, radii, and font sizes are all CSS custom properties (see{' '}
						<DocsLink href="/spacing">Spacing</DocsLink>). Components read <code className="inline">var(--token)</code>, never a
						hardcoded hex or px value — retheming means moving a token, not hunting through component source.
					</z-text>
				</div>
			</article>
		</section>

		<DocsFooter
			links={
				<>
					<DocsLink href="/patterns">Patterns</DocsLink> · <DocsLink href="/color">Color</DocsLink> ·{' '}
					<DocsLink href="~/">Home</DocsLink>
				</>
			}
		>
			zest · design rules
		</DocsFooter>
	</div>
)
