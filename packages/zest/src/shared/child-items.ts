import { useEffect, useHost, useState } from 'atomico'

/*
 * Declarative item children, the markup alternative to array-valued `items`
 * props. A list element (z-menu, z-context-menu, z-command, z-tabs) reads its
 * direct <z-*-item> children into plain item records, so plain HTML can build
 * a menu without any JS:
 *
 *   <z-menu>
 *     <z-menu-item value="rename" shortcut="⌘R">Rename</z-menu-item>
 *   </z-menu>
 *
 * Each child is assigned a unique slot name (`item-0`, `item-1`, …). The owner
 * renders <slot name={item.slot} /> where the row's content goes, so a child's
 * own light-DOM content (icons, hints, badges) becomes the row. Rows the owner
 * doesn't render (filtered out, panel closed) simply stay unassigned and hidden.
 *
 * Children are re-read whenever they're added, removed, re-labelled, or have
 * any of the listed attributes change.
 */

export type ChildItemT = {
	/** the child's tag name, e.g. 'z-menu-item' or 'z-menu-separator' */
	tag: string
	value: string
	label: string
	/** slot name carrying the child's own content */
	slot: string
	/** every observed attribute, raw ('' for present boolean attributes) */
	attributes: Record<string, string | null>
}

const readChildren = (host: HTMLElement, tags: string[], attributes: string[]): ChildItemT[] =>
	Array.from(host.querySelectorAll(tags.map((tag) => `:scope > ${tag}`).join(', '))).map((node, index) => {
		const slot = `item-${index}`
		if (node.getAttribute('slot') !== slot) node.setAttribute('slot', slot)
		const label = node.getAttribute('label') || (node.textContent || '').trim()
		const record: Record<string, string | null> = {}
		attributes.forEach((name) => (record[name] = node.getAttribute(name)))
		return { tag: node.localName, value: node.getAttribute('value') || label, label, slot, attributes: record }
	})

export const useChildItems = (tag: string | string[], attributes: string[]): ChildItemT[] => {
	const tags = Array.isArray(tag) ? tag : [tag]
	const host = useHost()
	const [items, setItems] = useState<ChildItemT[]>([])

	useEffect(() => {
		const el = host.current as HTMLElement
		const read = () => setItems(readChildren(el, tags, attributes))
		read()
		const observer = new MutationObserver(read)
		observer.observe(el, {
			childList: true,
			subtree: true,
			characterData: true,
			attributeFilter: ['value', 'label', ...attributes]
		})
		return () => observer.disconnect()
	}, [])

	return items
}

/** `is-foo` attribute present? (boolean attributes read as '' when set) */
export const hasFlag = (item: ChildItemT, name: string): boolean => item.attributes[name] != null
