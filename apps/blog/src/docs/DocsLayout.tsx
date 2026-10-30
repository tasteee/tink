import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'wouter'
import zestPackage from '@tasteee/zest/package.json'
import { SECTIONS, pagesOf, sectionById, sidebarItemsOf, type SectionT } from '@app/docs/nav'

/*
 * Docs chrome: three coordinated regions inside one centered, max-width frame.
 *
 *   ┌──────────── outlined top bar (sticky) ────────────┐
 *   │ zest   Setup  System  Elements  Blocks   ⌘K   gh  │
 *   └───────────────────────────────────────────────────┘
 *   ┌─ sidebar ─┐  page content (scrolls with the window,
 *   │ (sticky,  │  behind the bar)
 *   │ scrolls   │
 *   │ itself)   │
 *   └───────────┘
 *   ┌─ social ──┐
 *
 * The window stays the page's scroller (anchors, back/forward restoration and
 * mobile browser chrome all keep working); the bar and sidebar are sticky, and
 * the sidebar's nav scrolls on its own inside its panel.
 */

const GITHUB_URL = 'https://github.com/tasteee/tink/tree/main/packages/zest'
const NPM_URL = 'https://www.npmjs.com/package/@tasteee/zest'
// the X icon is an easter egg
const X_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

const GithubIcon = () => (
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<path
			fill="currentColor"
			d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"
		/>
	</svg>
)

const NpmIcon = () => (
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<path
			fill="currentColor"
			d="M1.76 0A1.76 1.76 0 0 0 0 1.76v20.48C0 23.21.79 24 1.76 24h20.48c.97 0 1.76-.79 1.76-1.76V1.76C24 .79 23.21 0 22.24 0H1.76Zm3.37 5.32 13.84.02-.01 13.84h-3.46l.01-10.38h-3.46l-.01 10.38H5.11L5.13 5.32Z"
		/>
	</svg>
)

const XIcon = () => (
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<path
			fill="currentColor"
			d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78L17.75 3Zm-1.08 16.17h1.7L7.4 4.73H5.58l11.09 14.44Z"
		/>
	</svg>
)

const SearchIcon = () => (
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<circle cx="11" cy="11" r="7" />
		<line x1="20.5" y1="20.5" x2="16" y2="16" />
	</svg>
)

const MenuIcon = () => (
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<line x1="4" y1="8" x2="20" y2="8" />
		<line x1="4" y1="16" x2="20" y2="16" />
	</svg>
)

// Listen for a custom element's DOM event (z-sidebar `select`, z-command `select`, z-sheet `close`).
const useElementEvent = (ref: React.RefObject<HTMLElement | null>, name: string, handler: (event: CustomEvent) => void) => {
	const handlerRef = useRef(handler)
	handlerRef.current = handler
	useEffect(() => {
		const el = ref.current
		if (!el) return
		const listener = (event: Event) => handlerRef.current(event as CustomEvent)
		el.addEventListener(name, listener)
		return () => el.removeEventListener(name, listener)
	}, [ref, name])
}

const SectionNav = ({ active, onNavigate }: { active?: SectionT; onNavigate?: () => void }) => (
	<nav className="DocsSections" aria-label="Documentation sections">
		{SECTIONS.map((section) => (
			<Link
				key={section.id}
				href={`/${section.id}`}
				className={section.id === active?.id ? 'is-active' : undefined}
				aria-current={section.id === active?.id ? 'page' : undefined}
				onClick={onNavigate}
			>
				{section.label}
			</Link>
		))}
	</nav>
)

const SectionSidebar = ({
	section,
	value,
	onNavigate
}: {
	section: SectionT
	value: string
	onNavigate: (path: string) => void
}) => {
	const ref = useRef<HTMLElement>(null)
	useElementEvent(ref, 'select', (event) => {
		const next = event.detail?.value
		if (next) onNavigate(`/${next}`)
	})
	return <z-sidebar ref={ref as never} items={sidebarItemsOf(section)} value={value} />
}

const Socials = () => (
	<div className="DocsSocial">
		<span className="DocsVersion">zest v{zestPackage.version}</span>
		<div className="DocsSocialLinks">
			<a href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="GitHub">
				<GithubIcon />
			</a>
			<a href={NPM_URL} target="_blank" rel="noreferrer" aria-label="npm">
				<NpmIcon />
			</a>
			<a href={X_URL} target="_blank" rel="noreferrer" aria-label="X">
				<XIcon />
			</a>
		</div>
	</div>
)

// ⌘K / Ctrl+K palette over every docs page, built from the same nav data.
const Search = ({
	isOpen,
	setIsOpen,
	onNavigate
}: {
	isOpen: boolean
	setIsOpen: (open: boolean) => void
	onNavigate: (path: string) => void
}) => {
	const ref = useRef<HTMLElement>(null)
	useElementEvent(ref, 'select', (event) => onNavigate(`/${event.detail.value}`))
	useElementEvent(ref, 'close', () => setIsOpen(false))

	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
				event.preventDefault()
				setIsOpen(!isOpen)
			}
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [isOpen, setIsOpen])

	return (
		<z-command ref={ref as never} isOpen={isOpen} placeholder="Search the docs…">
			{SECTIONS.flatMap((section) =>
				pagesOf(section).map((page) => (
					<z-command-item
						key={`${section.id}/${page.slug}`}
						value={`${section.id}/${page.slug}`}
						label={page.label}
						group={section.label}
						keywords={[page.group, page.keywords].filter(Boolean).join(' ')}
					>
						<span className="DocsSearchLabel">{page.label}</span>
						{page.group && <span className="DocsSearchGroup">{page.group}</span>}
					</z-command-item>
				))
			)}
			<span slot="footer" className="DocsSearchFooter">
				<span>
					<kbd>↑</kbd>
					<kbd>↓</kbd> to move
				</span>
				<span>
					<kbd>↵</kbd> to open
				</span>
				<span>
					<kbd>esc</kbd> to close
				</span>
			</span>
		</z-command>
	)
}

const Pager = ({ section, slug }: { section: SectionT; slug: string }) => {
	const pages = pagesOf(section)
	const index = pages.findIndex((page) => page.slug === slug)
	if (index < 0) return null
	const prev = pages[index - 1]
	const next = pages[index + 1]
	return (
		<nav className="DocsPager" aria-label="Previous and next page">
			{prev ? (
				<Link href={`/${section.id}/${prev.slug}`} className="DocsPagerLink">
					<span className="DocsPagerDirection">Previous</span>
					<span className="DocsPagerLabel">{prev.label}</span>
				</Link>
			) : (
				<span />
			)}
			{next && (
				<Link href={`/${section.id}/${next.slug}`} className="DocsPagerLink is-next">
					<span className="DocsPagerDirection">Next</span>
					<span className="DocsPagerLabel">{next.label}</span>
				</Link>
			)}
		</nav>
	)
}

export const DocsLayout = ({ children }: { children: ReactNode }) => {
	const [location, navigate] = useLocation()
	const [isSearchOpen, setIsSearchOpen] = useState(false)
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const sheetRef = useRef<HTMLElement>(null)
	useElementEvent(sheetRef, 'close', () => setIsMenuOpen(false))

	// "/elements/z-button" → section "elements", slug "z-button"
	const [sectionId = '', slug = ''] = location.replace(/^\//, '').split('/')
	const section = sectionById(sectionId)
	const activeValue = `${sectionId}/${slug}`

	const go = (path: string) => {
		setIsMenuOpen(false)
		setIsSearchOpen(false)
		navigate(path)
	}

	// each route starts at the top (the window is the scroller)
	useLayoutEffect(() => {
		if (!window.location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
	}, [location])

	return (
		<div className="Docs">
			<div className="DocsTopbarBand">
				<header className="DocsTopbar">
					<button
						type="button"
						className="DocsIconButton DocsMenuButton"
						aria-label="Open navigation"
						onClick={() => setIsMenuOpen(true)}
					>
						<MenuIcon />
					</button>
					<Link href="~/" className="DocsBrand">
						<span className="dot" /> zest
					</Link>
					<SectionNav active={section} />
					<div className="DocsTopbarEnd">
						<button type="button" className="DocsSearch" onClick={() => setIsSearchOpen(true)}>
							<SearchIcon />
							<span className="DocsSearchText">Search</span>
							<kbd>⌘K</kbd>
						</button>
						<a className="DocsIconButton" href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="GitHub">
							<GithubIcon />
						</a>
					</div>
				</header>
			</div>

			<div className="DocsBody">
				<aside className="DocsAside">
					{section && <SectionSidebar section={section} value={activeValue} onNavigate={go} />}
					<Socials />
				</aside>

				<main className="DocsMain">
					{children}
					{section && slug && <Pager section={section} slug={slug} />}
				</main>
			</div>

			<z-sheet ref={sheetRef as never} side="left" isOpen={isMenuOpen} heading="zest docs" className="DocsMobileSheet">
				<div className="DocsMobileNav">
					<SectionNav active={section} onNavigate={() => setIsMenuOpen(false)} />
					{section && <SectionSidebar section={section} value={activeValue} onNavigate={go} />}
					<Socials />
				</div>
			</z-sheet>

			<Search isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} onNavigate={go} />
		</div>
	)
}
