import type { ReactNode } from 'react'
import { Link, useLocation } from 'wouter'

const NAV_LINKS = [
	{ href: '/', label: 'Home' },
	{ href: '/docs', label: 'Docs' },
	{ href: '/tools', label: 'Tools' }
]

// Is `href` the active section? "/" matches only itself; everything else matches
// its prefix so nested docs and tools routes highlight their parent section.
const isActive = (location: string, href: string): boolean =>
	href === '/' ? location === '/' : location === href || location.startsWith(`${href}/`)

export const SiteShell = ({ children }: { children: ReactNode }) => {
	const [location] = useLocation()
	const [, navigate] = useLocation()

	return (
		<>
			<nav className='SiteNav'>
				<Link href='/' className='SiteBrand'>
					<span className='dot' /> zest
				</Link>

				<div className='SiteNavLinks'>
					{NAV_LINKS.map((link) => (
						<Link key={link.href} href={link.href} className={isActive(location, link.href) ? 'active' : undefined}>
							{link.label}
						</Link>
					))}
				</div>

				<div className='SiteNavActions'>
					<z-button kind='solid' size='small' onClick={() => navigate('/docs')}>
						Explore
					</z-button>
				</div>
			</nav>

			<main>{children}</main>
		</>
	)
}
