import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { $choices, $hover, $isMenuOpen, $menuCategory, $selectedObjectId, $tool, useChoices, useIsMenuOpen, useMenuCategory, useTool } from '../game/store'
import type { CatalogChoicesT } from '../game/store'
import { ToolId } from '../game/catalog'
import type { ToolIdT } from '../game/catalog'
import { cancelStroke } from '../game/interaction'
import { getMenuItems, menuCategories } from './hudTools'
import type { MenuCategoryInfoT, MenuItemT } from './hudTools'
import './BuildMenu.css'

const closeMenu = () => {
	$isMenuOpen.set(false)
}

const getChosenId = (tool: ToolIdT, choices: CatalogChoicesT, itemTool: ToolIdT): string => {
	const isSameTool = tool === itemTool
	if (!isSameTool) return ''
	const isFloor = itemTool === ToolId.floor
	if (isFloor) return choices.floor
	const isWall = itemTool === ToolId.wall
	if (isWall) return choices.wall
	return choices.object
}

const chooseItem = (menuItem: MenuItemT) => {
	cancelStroke()
	$hover.set({ isVisible: false })
	$selectedObjectId.set('')

	const isFloor = menuItem.tool === ToolId.floor
	const isWall = menuItem.tool === ToolId.wall
	if (isFloor) $choices.set({ floor: menuItem.id })
	if (isWall) $choices.set({ wall: menuItem.id })
	const isPlace = menuItem.tool === ToolId.place
	if (isPlace) $choices.set({ object: menuItem.id })

	$tool.set(menuItem.tool)
	closeMenu()
}

type CategoryChipPropsT = {
	category: MenuCategoryInfoT
	isActive: boolean
}

const CategoryChip = (props: CategoryChipPropsT) => {
	const kind = props.isActive ? 'solid' : 'soft'
	const tone = props.isActive ? 'primary' : 'neutral'
	const CategoryIcon = props.category.Icon

	const handleClick = () => {
		$menuCategory.set(props.category.id)
	}

	return (
		<z-button size="small" kind={kind} tone={tone} onClick={handleClick} aria-pressed={props.isActive}>
			<CategoryIcon weight="bold" />
			{props.category.label}
		</z-button>
	)
}

type MenuItemCardPropsT = {
	menuItem: MenuItemT
	isChosen: boolean
}

// Swatch tile in the item's own colors: main color with an
// accent band, category icon on top.
const MenuItemCard = (props: MenuItemCardPropsT) => {
	const ItemIcon = props.menuItem.Icon
	const swatchStyle: CSSProperties = { background: props.menuItem.swatch }
	const accentStyle: CSSProperties = { background: props.menuItem.accentSwatch }

	const handleClick = () => {
		chooseItem(props.menuItem)
	}

	return (
		<button type="button" className="menuItem" onClick={handleClick} aria-pressed={props.isChosen}>
			<z-card is-flex is-column is-reactive gap="var(--space-sm)" class="menuItemCard">
				<span className="menuItemSwatch" style={swatchStyle}>
					<span className="menuItemAccent" style={accentStyle} />
					<ItemIcon weight="duotone" className="menuItemIcon" />
				</span>
				<z-text size="sm" weight="600">
					{props.menuItem.name}
				</z-text>
				<z-text size="xs" color="muted">
					{props.menuItem.variant}
				</z-text>
			</z-card>
		</button>
	)
}

// z-sheet closes itself on backdrop tap, Esc and its X button;
// mirror that back into the store.
const useSheetCloseSync = () => {
	const sheetRef = useRef<HTMLElement>(null)

	useEffect(() => {
		const sheet = sheetRef.current
		if (sheet === null) return
		sheet.addEventListener('close', closeMenu)
		return () => {
			sheet.removeEventListener('close', closeMenu)
		}
	}, [])

	return sheetRef
}

export const BuildMenu = () => {
	const isMenuOpen = useIsMenuOpen()
	const activeCategoryId = useMenuCategory()
	const tool = useTool()
	const choices = useChoices()
	const sheetRef = useSheetCloseSync()
	const menuItems = getMenuItems(activeCategoryId)

	const chips = menuCategories.map((category) => {
		const isActive = category.id === activeCategoryId
		return <CategoryChip key={category.id} category={category} isActive={isActive} />
	})

	const cards = menuItems.map((menuItem) => {
		const chosenId = getChosenId(tool, choices, menuItem.tool)
		const isChosen = chosenId === menuItem.id
		return <MenuItemCard key={menuItem.id} menuItem={menuItem} isChosen={isChosen} />
	})

	return (
		<z-sheet ref={sheetRef} side="bottom" heading="Build" isOpen={isMenuOpen} class="buildMenu">
			<div className="buildMenuBody">
				<div className="buildMenuCategories">{chips}</div>
				<div className="buildMenuGrid">{cards}</div>
			</div>
		</z-sheet>
	)
}
