import type { Component } from 'svelte'
import CubeIcon from 'phosphor-svelte/lib/CubeIcon'
import LineSegmentIcon from 'phosphor-svelte/lib/LineSegmentIcon'
import SquareIcon from 'phosphor-svelte/lib/SquareIcon'
import ArrowFatLinesUpIcon from 'phosphor-svelte/lib/ArrowFatLinesUpIcon'
import StampIcon from 'phosphor-svelte/lib/StampIcon'
import SelectionIcon from 'phosphor-svelte/lib/SelectionIcon'
import ArrowsOutCardinalIcon from 'phosphor-svelte/lib/ArrowsOutCardinalIcon'
import CrosshairIcon from 'phosphor-svelte/lib/CrosshairIcon'
import HouseIcon from 'phosphor-svelte/lib/HouseIcon'
import type { ToolIdT } from '../state/tools'

export type IconT = Component<{ size?: number | string; weight?: 'bold' | 'duotone' | 'fill' | 'light' | 'thin' | 'regular' }>

export const TOOL_ICONS: Record<ToolIdT | 'gallery', IconT> = {
	block: CubeIcon,
	line: LineSegmentIcon,
	square: SquareIcon,
	extrude: ArrowFatLinesUpIcon,
	stamp: StampIcon,
	select: SelectionIcon,
	object: ArrowsOutCardinalIcon,
	pivot: CrosshairIcon,
	gallery: HouseIcon
}
