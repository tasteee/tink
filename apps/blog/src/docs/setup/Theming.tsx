import { Link } from 'wouter'
import { Article, Code } from '@app/docs/Prose'

export const Theming = () => (
	<Article
		eyebrow="Configuration"
		title="Theming"
		lede="Every element reads its look from CSS custom properties defined in ink.css. Override them on :root to retheme the whole system, or on any container to retheme just that subtree."
	>
		<h2>The base dials</h2>
		<p>A handful of base tokens drive the derived ramps. Change one and every shade, accent, and surface follows.</p>
		<Code
			language="css"
			code={`
:root {
  --base-accent-color-0: oklch(0.72 0.19 350); /* pink accent */
  --base-accent-color-1: oklch(0.62 0.2 290);  /* purple accent */
  --base-neutral-color-dark: #0a0f0a;          /* page floor */
  --base-radius: 0.625rem;
  --base-spacing: 0.25rem;
  --base-font-size: 16px;                      /* scales the whole type ramp */
}
`}
		/>

		<h2>Scoped themes</h2>
		<p>Tokens inherit, so a container can carry its own values.</p>
		<Code
			code={`
<section style="--base-radius: 0; --base-font-size: 14px">
  <z-card>Square, compact cards in here only.</z-card>
</section>
`}
		/>

		<h2>Motion</h2>
		<p>
			Durations and curves are tokens too. See <Link href="/system/motion">Motion</Link> for the full scale. Reduced-motion
			users get every fade with no travel automatically.
		</p>
	</Article>
)
