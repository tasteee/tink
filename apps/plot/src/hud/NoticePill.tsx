import { useEffect } from 'react'
import { useDatass } from 'datass'
import { getFloorDef, getWallDef } from '../game/catalog'
import { getEdgesOnLine, getTilesInRect } from '../game/grid'
import { StrokeKind, useChoices, useNotice, useStroke } from '../game/store'
import type { CatalogChoicesT, StrokeT } from '../game/store'
import { formatFunds } from './hudTools'
import './NoticePill.css'

const NOTICE_DURATION_MS = 2200

// Live price while dragging out floors or walls.
const getStrokeSummary = (stroke: StrokeT, choices: CatalogChoicesT): string => {
	const start = { x: stroke.startX, z: stroke.startZ }
	const end = { x: stroke.endX, z: stroke.endZ }

	const isFloorStroke = stroke.kind === StrokeKind.floor
	if (isFloorStroke) {
		const tileCount = getTilesInRect(start, end).length
		const cost = tileCount * getFloorDef(choices.floor).cost
		return `${tileCount} tiles · ${formatFunds(cost)}`
	}

	const isWallStroke = stroke.kind === StrokeKind.wall
	if (!isWallStroke) return ''
	const wallCount = getEdgesOnLine(start, end).length
	const cost = wallCount * getWallDef(choices.wall).cost
	return `${wallCount} walls · ${formatFunds(cost)}`
}

const useRecentNotice = (): string => {
	const notice = useNotice()
	const isVisible = useDatass.boolean(false)

	useEffect(() => {
		const hasMessage = notice.message !== ''
		if (!hasMessage) return
		isVisible.set(true)
		const timeoutId = window.setTimeout(() => {
			isVisible.set(false)
		}, NOTICE_DURATION_MS)
		return () => {
			window.clearTimeout(timeoutId)
		}
	}, [notice.stamp])

	const message = isVisible.state ? notice.message : ''
	return message
}

export const NoticePill = () => {
	const stroke = useStroke()
	const choices = useChoices()
	const noticeMessage = useRecentNotice()
	const strokeSummary = getStrokeSummary(stroke, choices)
	const message = strokeSummary !== '' ? strokeSummary : noticeMessage
	const hasMessage = message !== ''
	if (!hasMessage) return null

	return (
		<div className="noticePill" role="status">
			<z-text size="xs" weight="600">
				{message}
			</z-text>
		</div>
	)
}
