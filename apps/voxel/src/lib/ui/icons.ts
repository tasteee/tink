import type { Component } from 'svelte'
import PlusIcon from 'phosphor-svelte/lib/PlusIcon'
import EraserIcon from 'phosphor-svelte/lib/EraserIcon'
import PaintBrushIcon from 'phosphor-svelte/lib/PaintBrushIcon'
import SelectionIcon from 'phosphor-svelte/lib/SelectionIcon'
import ArrowFatLinesUpIcon from 'phosphor-svelte/lib/ArrowFatLinesUpIcon'
import ArrowsOutCardinalIcon from 'phosphor-svelte/lib/ArrowsOutCardinalIcon'
import CrosshairIcon from 'phosphor-svelte/lib/CrosshairIcon'
import CubeIcon from 'phosphor-svelte/lib/CubeIcon'
import LineSegmentIcon from 'phosphor-svelte/lib/LineSegmentIcon'
import SquareIcon from 'phosphor-svelte/lib/SquareIcon'
import PaintBucketIcon from 'phosphor-svelte/lib/PaintBucketIcon'
import StampIcon from 'phosphor-svelte/lib/StampIcon'
import HouseIcon from 'phosphor-svelte/lib/HouseIcon'
import type { ToolActionIdT, ToolShapeIdT } from '../state/tools'

export type IconT = Component<{ size?: number | string; weight?: 'bold' | 'duotone' | 'fill' | 'light' | 'thin' | 'regular' }>

export const TOOL_ICONS: Record<ToolActionIdT | ToolShapeIdT | 'gallery', IconT> = {
	place: PlusIcon,
	erase: EraserIcon,
	paint: PaintBrushIcon,
	select: SelectionIcon,
	extrude: ArrowFatLinesUpIcon,
	object: ArrowsOutCardinalIcon,
	pivot: CrosshairIcon,
	block: CubeIcon,
	line: LineSegmentIcon,
	square: SquareIcon,
	fill: PaintBucketIcon,
	stamp: StampIcon,
	gallery: HouseIcon
}
