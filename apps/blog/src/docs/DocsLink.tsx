import { Link } from 'wouter'
import type { ReactNode } from 'react'

// Wraps wouter's <Link> around z-link so in-app navigation inside docs prose
// gets the design system's accent color + underline treatment instead of a
// bare browser link. `asChild` makes wouter clone its href/onClick onto
// z-link directly — the click still lands on z-link's inner <a> (shadow DOM
// clicks bubble as composed events), so navigation stays client-side.
export const DocsLink = ({ href, children }: { href: string; children: ReactNode }) => (
	<Link asChild href={href}>
		<z-link tone="primary">{children}</z-link>
	</Link>
)
