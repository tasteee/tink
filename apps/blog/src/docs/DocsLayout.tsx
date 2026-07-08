import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'wouter'
import { COMPONENT_MANIFEST } from '@app/docs/components/manifest'

// z-sidebar's `items` is array-valued; React 19 sets it as a DOM property on
// the custom element, so it's passed directly as a JSX prop. The ref is only
// here to wire up the `select` event listener below.

const DESIGN_SYSTEM_ITEMS = [
	{ value: 'color', label: 'Color' },
	{ value: 'typography', label: 'Typography' },
	{ value: 'spacing', label: 'Spacing' },
	{ value: 'layout', label: 'Layout' },
	{ value: 'rules', label: 'Design rules' },
	{ value: 'patterns', label: 'Patterns' }
]

// Controls group order in the sidebar — mirrors the old single-page Components
// doc's section order (Foundations → Specialized).
const CATEGORY_ORDER = ['Foundations', 'Layout', 'Actions', 'Forms', 'Data Display', 'Navigation', 'Overlays', 'Specialized', 'Chat']

const buildComponentGroups = () =>
	CATEGORY_ORDER.map((category) => ({
		label: category,
		items: COMPONENT_MANIFEST.filter((entry) => entry.category === category).map((entry) => ({
			value: `components/${entry.slug}`,
			label: entry.slug
		}))
	})).filter((group) => group.items.length > 0)

const SIDEBAR_ITEMS = [{ label: 'Design system', items: DESIGN_SYSTEM_ITEMS }, ...buildComponentGroups()]

export const DocsLayout = ({ children }: { children: ReactNode }) => {
	const [location, navigate] = useLocation()
	const sidebarRef = useRef<HTMLElement | null>(null)

	// Path relative to /docs, e.g. "color" or "components/z-button" — matches the
	// `value`s above so z-sidebar can mark the active entry. "" is the /docs
	// landing page, which has no corresponding sidebar item.
	const activeValue = location === '/' ? '' : location.replace(/^\//, '')

	const setSidebarRef = (el: HTMLElement | null): void => {
		sidebarRef.current = el
	}

	useEffect(() => {
		const el = sidebarRef.current
		if (!el) return
		const onSelect = (e: Event): void => {
			const value = (e as CustomEvent<{ value: string }>).detail?.value
			// navigate() here is already scoped to the nested /docs router's base
			// (see <Route path="/docs" nest> in App.tsx), so the target must be
			// relative — "/docs/${value}" would double up to /docs/docs/....
			if (value) navigate(`/${value}`)
		}
		el.addEventListener('select', onSelect)
		return () => el.removeEventListener('select', onSelect)
	}, [navigate])

	return (
		<div className="DocsShell">
			<div className="DocsSidebarRail">
				<z-sidebar ref={setSidebarRef as never} value={activeValue} items={SIDEBAR_ITEMS} isDocked />
			</div>
			<div className="DocsMain">{children}</div>
		</div>
	)
}
