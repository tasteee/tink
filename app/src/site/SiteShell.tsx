import type { ReactNode } from 'react'
import { Link, useLocation } from 'wouter'
import { useAuth } from '@app/useAuth'

// Auth lives in the shared top nav now (was the blog's own topbar). These links
// are top-level (the shell renders outside the nested /blog router), so they use
// absolute /blog/* paths.
const AuthControls = () => {
	const { isLoading, isAuthenticated, isAuthor, signInWithGitHub, signOut } = useAuth()

	if (isLoading) return null

	if (!isAuthenticated) {
		return (
			<z-button size='small' kind='ghost' onClick={() => void signInWithGitHub()}>
				Sign in
			</z-button>
		)
	}

	return (
		<>
			{isAuthor && (
				<Link href='/blog/admin' className='SiteNavLink'>
					Posts
				</Link>
			)}
			<z-button size='small' kind='ghost' onClick={() => void signOut()}>
				Sign out
			</z-button>
		</>
	)
}

const NAV_LINKS = [
	{ href: '/', label: 'Home' },
	{ href: '/blog', label: 'Blog' },
	{ href: '/docs', label: 'Docs' }
]

// Is `href` the active section? "/" matches only itself; everything else matches
// its prefix so /blog/post/x still highlights "Blog".
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
					<AuthControls />
					<z-button kind='solid' size='small' onClick={() => navigate('/docs')}>
						Explore
					</z-button>
				</div>
			</nav>

			<main>{children}</main>
		</>
	)
}
