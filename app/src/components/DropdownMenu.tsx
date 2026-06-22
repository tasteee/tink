import { useEffect, useRef, useState, type ReactNode } from 'react'
import { DotsThreeVerticalIcon } from '@phosphor-icons/react'

export type MenuItem = {
	label: string
	onSelect: () => void
	danger?: boolean
	icon?: ReactNode
}

// Lightweight three-dot menu. Built in React (rather than the z-menu web
// component) so the action callbacks and outside-click behavior stay simple.
export const DropdownMenu = ({ items, label = 'Actions' }: { items: MenuItem[]; label?: string }) => {
	const [open, setOpen] = useState(false)
	const rootRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!open) return
		const onDocPointer = (e: PointerEvent) => {
			if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
		}
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setOpen(false)
		}
		document.addEventListener('pointerdown', onDocPointer)
		document.addEventListener('keydown', onKey)
		return () => {
			document.removeEventListener('pointerdown', onDocPointer)
			document.removeEventListener('keydown', onKey)
		}
	}, [open])

	return (
		<div className="DropdownMenu" ref={rootRef}>
			<button
				type="button"
				className="DropdownMenuTrigger"
				aria-haspopup="menu"
				aria-expanded={open}
				aria-label={label}
				onClick={() => setOpen((v) => !v)}
			>
				<DotsThreeVerticalIcon size={18} weight="bold" />
			</button>

			{open && (
				<div className="DropdownMenuList" role="menu">
					{items.map((item) => (
						<button
							key={item.label}
							type="button"
							role="menuitem"
							className="DropdownMenuItem"
							data-danger={item.danger ? 'true' : 'false'}
							onClick={() => {
								setOpen(false)
								item.onSelect()
							}}
						>
							{item.icon}
							<span>{item.label}</span>
						</button>
					))}
				</div>
			)}
		</div>
	)
}
