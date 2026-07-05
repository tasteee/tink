import { c, css, event, useHost, useRef, useState, useEffect } from 'atomico'

/*
 * z-tree — a data-driven hierarchical tree with expand/collapse, selection, and
 * keyboard navigation. Feed it a recursive `items` array:
 *
 *   el.items = [{ id, label, icon?, children?, isExpanded?, isSelected?, isDisabled? }]
 *
 * Rows are flattened internally (only expanded branches render), so it stays flat
 * enough to hand off to z-virtual-list for very large trees later. Keyboard: ↑/↓
 * move, →/← expand/collapse (or step in/out), Enter/Space select+activate,
 * Home/End jump. Selection is `single` (default), `multiple` (⌘/Ctrl-click), or
 * `none`. ARIA tree/treeitem/group roles + aria-expanded/level/selected.
 *
 * Methods: expand(id) · collapse(id) · expandAll() · collapseAll() · select(id) ·
 * getSelection(). Events: `select` {ids,node} · `expand`/`collapse` {id} ·
 * `activate` {id,node}. Drag-reorder (via z-drag-drop) is a future enhancement.
 */
type TreeNode = {
	id: string
	label?: string
	icon?: string
	children?: TreeNode[]
	isExpanded?: boolean
	isSelected?: boolean
	isDisabled?: boolean
}
type Row = { node: TreeNode; level: number; hasChildren: boolean; isOpen: boolean }

const walk = (nodes: TreeNode[], fn: (n: TreeNode) => void) =>
	nodes.forEach((n) => {
		fn(n)
		if (n.children) walk(n.children, fn)
	})

const flatten = (nodes: TreeNode[], open: Set<string>, level = 0, out: Row[] = []): Row[] => {
	for (const n of nodes) {
		const hasChildren = !!(n.children && n.children.length)
		const isOpen = hasChildren && open.has(n.id)
		out.push({ node: n, level, hasChildren, isOpen })
		if (isOpen) flatten(n.children as TreeNode[], open, level + 1, out)
	}
	return out
}

const styles = css`
	:host {
		display: block;
		font-size: var(--font-size-small);
		--indent: 1.1rem;
		--accent: var(--purple);
	}
	:host([is-hidden]) {
		display: none;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.3rem 0.5rem;
		border-radius: var(--radius-sm);
		color: var(--foreground);
		cursor: default;
		user-select: none;
		white-space: nowrap;
		outline: none;
	}
	.row:hover {
		background: color-mix(in oklch, var(--muted) 8%, transparent);
	}
	.row.is-selected {
		background: color-mix(in oklch, var(--accent) 15%, transparent);
		color: var(--foreground);
	}
	.row:focus-visible {
		box-shadow: inset 0 0 0 2px color-mix(in oklch, var(--ring) 60%, transparent);
	}
	.row.is-disabled {
		opacity: 0.45;
		pointer-events: none;
	}
	.twisty {
		flex: 0 0 auto;
		width: 1.1rem;
		height: 1.1rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: 0;
		background: transparent;
		color: var(--muted-foreground);
		cursor: pointer;
		border-radius: var(--radius-sm);
		transition: transform var(--duration-fast) var(--easing-standard);
	}
	.twisty.is-open {
		transform: rotate(90deg);
	}
	.twisty.is-leaf {
		visibility: hidden;
	}
	.icon {
		flex: 0 0 auto;
		display: inline-flex;
	}
	.label {
		overflow: hidden;
		text-overflow: ellipsis;
	}
`

export const ZTree = c(
	(props) => {
		const host = useHost()
		const [expanded, setExpanded] = useState<string[]>([])
		const [selected, setSelected] = useState<string[]>([])
		const [focusId, setFocusId] = useState<string | null>(null)

		const nodes: TreeNode[] = Array.isArray(props.items) ? (props.items as TreeNode[]) : []
		const nodesRef = useRef<TreeNode[]>([])
		nodesRef.current = nodes
		const selectedRef = useRef<string[]>([])
		selectedRef.current = selected
		const seeded = useRef(false)

		// Seed expansion/selection once from node flags + props.
		useEffect(() => {
			if (seeded.current || !nodes.length) return
			seeded.current = true
			const exp = new Set<string>((props.expanded as string[]) || [])
			const sel = new Set<string>((props.selected as string[]) || [])
			walk(nodes, (n) => {
				if (n.isExpanded) exp.add(n.id)
				if (n.isSelected) sel.add(n.id)
			})
			setExpanded([...exp])
			setSelected([...sel])
		}, [props.items])

		const openSet = new Set(expanded)
		const flat = flatten(nodes, openSet)
		const selSet = new Set(selected)
		const mode = (props.selection as string) || 'single'

		const setOpen = (id: string, open: boolean) => {
			setExpanded((prev) => {
				const n = new Set(prev)
				open ? n.add(id) : n.delete(id)
				return [...n]
			})
			open ? props.expand({ id }) : props.collapse({ id })
		}

		const doSelect = (node: TreeNode, additive: boolean) => {
			if (mode === 'none' || node.isDisabled) return
			let next: Set<string>
			if (mode === 'multiple' && additive) {
				next = new Set(selectedRef.current)
				next.has(node.id) ? next.delete(node.id) : next.add(node.id)
			} else {
				next = new Set([node.id])
			}
			setSelected([...next])
			props.select({ ids: [...next], node })
		}

		const move = (fromIndex: number, delta: number) => {
			let i = fromIndex
			for (let step = 0; step < flat.length; step++) {
				i = Math.min(flat.length - 1, Math.max(0, i + delta))
				if (!flat[i].node.isDisabled) break
			}
			if (flat[i]) setFocusId(flat[i].node.id)
		}

		const onKeyDown = (e: KeyboardEvent) => {
			if (!flat.length) return
			let idx = flat.findIndex((r) => r.node.id === focusId)
			if (idx < 0) idx = 0
			const cur = flat[idx]
			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault()
					move(idx, 1)
					break
				case 'ArrowUp':
					e.preventDefault()
					move(idx, -1)
					break
				case 'ArrowRight':
					e.preventDefault()
					if (cur.hasChildren && !cur.isOpen) setOpen(cur.node.id, true)
					else if (cur.hasChildren) move(idx, 1)
					break
				case 'ArrowLeft':
					e.preventDefault()
					if (cur.hasChildren && cur.isOpen) setOpen(cur.node.id, false)
					else {
						// step to parent (previous row with a smaller level)
						for (let j = idx - 1; j >= 0; j--)
							if (flat[j].level < cur.level) {
								setFocusId(flat[j].node.id)
								break
							}
					}
					break
				case 'Home':
					e.preventDefault()
					move(-1, 1)
					break
				case 'End':
					e.preventDefault()
					move(flat.length, -1)
					break
				case 'Enter':
				case ' ':
					e.preventDefault()
					doSelect(cur.node, e.metaKey || e.ctrlKey)
					props.activate({ id: cur.node.id, node: cur.node })
					break
			}
		}

		// Keep DOM focus on the focused row.
		useEffect(() => {
			if (!focusId) return
			const root = (host.current as HTMLElement).shadowRoot
			const row = root?.querySelector(`[data-id="${CSS.escape(focusId)}"]`) as HTMLElement | null
			row?.focus()
		}, [focusId])

		// Imperative API.
		useEffect(() => {
			const el = host.current as any
			el.expand = (id: string) => setOpen(id, true)
			el.collapse = (id: string) => setOpen(id, false)
			el.expandAll = () => {
				const ids: string[] = []
				walk(nodesRef.current || [], (n) => n.children?.length && ids.push(n.id))
				setExpanded(ids)
			}
			el.collapseAll = () => setExpanded([])
			el.select = (id: string) => {
				let found: TreeNode | undefined
				walk(nodesRef.current || [], (n) => {
					if (n.id === id) found = n
				})
				if (found) doSelect(found, false)
			}
			el.getSelection = () => [...(selectedRef.current || [])]
		}, [])

		return (
			<host shadowDom role="tree" onkeydown={onKeyDown}>
				{flat.map((r) => {
					const isFocused = r.node.id === focusId || (focusId === null && r === flat[0])
					const cls = ['row']
					if (selSet.has(r.node.id)) cls.push('is-selected')
					if (r.node.isDisabled) cls.push('is-disabled')
					return (
						<div
							key={r.node.id}
							class={cls.join(' ')}
							data-id={r.node.id}
							role="treeitem"
							aria-level={r.level + 1}
							aria-selected={selSet.has(r.node.id) ? 'true' : 'false'}
							aria-expanded={r.hasChildren ? (r.isOpen ? 'true' : 'false') : undefined}
							tabindex={isFocused ? '0' : '-1'}
							style={{ paddingLeft: `${0.5 + r.level * 1.1}rem` }}
							onclick={() => {
								setFocusId(r.node.id)
								doSelect(r.node, false)
							}}
							ondblclick={() => props.activate({ id: r.node.id, node: r.node })}
						>
							<button
								type="button"
								class={`twisty${r.isOpen ? ' is-open' : ''}${r.hasChildren ? '' : ' is-leaf'}`}
								aria-hidden="true"
								tabindex="-1"
								onclick={(e: MouseEvent) => {
									e.stopPropagation()
									if (r.hasChildren) setOpen(r.node.id, !r.isOpen)
								}}
							>
								›
							</button>
							{r.node.icon && <span class="icon">{r.node.icon}</span>}
							<span class="label">{r.node.label ?? r.node.id}</span>
						</div>
					)
				})}
			</host>
		)
	},
	{
		props: {
			items: { type: Array },
			selection: { type: String, reflect: true },
			selected: { type: Array },
			expanded: { type: Array },
			showGuides: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			select: event<{ ids: string[]; node: TreeNode }>({ bubbles: true, composed: true }),
			expand: event<{ id: string }>({ bubbles: true, composed: true }),
			collapse: event<{ id: string }>({ bubbles: true, composed: true }),
			activate: event<{ id: string; node: TreeNode }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-tree', ZTree)
