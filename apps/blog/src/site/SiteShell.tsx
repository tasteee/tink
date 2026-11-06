import type { ReactNode } from 'react'
import { Link, useLocation } from 'wouter'

const NAV_LINKS = [
	{ href: '/', label: 'Home' },
	{ href: '/tools', label: 'Tools' }
]

// The Zest docs are their own site, in the zest repo.
const ZEST_DOCS_URL = 'https://tasteee.github.io/zest/docs'

// Is `href` the active section? "/" matches only itself; everything else matches
// its prefix so nested tools routes highlight their parent section.
const isActive = (location: string, href: string): boolean =>
	href === '/' ? location === '/' : location === href || location.startsWith(`${href}/`)

export const SiteShell = ({ children }: { children: ReactNode }) => {
	const [location] = useLocation()
	return (
		<>
			<nav className="SiteNav">
				<Link href="/" className="SiteBrand">
					<span className="dot" /> tasteee
				</Link>

				<div className="SiteNavLinks">
					{NAV_LINKS.map((link) => (
						<Link key={link.href} href={link.href} className={isActive(location, link.href) ? 'active' : undefined}>
							{link.label}
						</Link>
					))}
					<a href={ZEST_DOCS_URL}>Docs</a>
				</div>
			</nav>

			<main>{children}</main>
		</>
	)
}
