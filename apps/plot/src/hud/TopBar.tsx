import { ArrowUUpLeft, Broom, Cube, CubeTransparent, Moon, Sun } from '@phosphor-icons/react'
import { resetLot, undo } from '../game/actions'
import { $isNight, $isWallsDown, useHistorySize, useIsNight, useIsWallsDown } from '../game/store'
import './TopBar.css'

const toggleWalls = () => {
	$isWallsDown.set.toggle()
}

const toggleNight = () => {
	$isNight.set.toggle()
}

const confirmReset = () => {
	const isConfirmed = window.confirm('Start over with the starter cottage?')
	if (isConfirmed) resetLot()
}

const TopActions = () => {
	const historySize = useHistorySize()
	const isWallsDown = useIsWallsDown()
	const isNight = useIsNight()
	const canUndo = historySize > 0
	const wallsLabel = isWallsDown ? 'Raise walls' : 'Lower walls'
	const wallsKind = isWallsDown ? 'soft' : 'ghost'
	const timeLabel = isNight ? 'Switch to day' : 'Switch to night'
	const TimeIcon = isNight ? Moon : Sun
	const WallsIcon = isWallsDown ? CubeTransparent : Cube

	return (
		<div className="topActions">
			<z-button size="small" kind="ghost" isDisabled={!canUndo} onClick={undo} aria-label="Undo">
				<ArrowUUpLeft weight="bold" />
			</z-button>
			<z-button size="small" kind={wallsKind} onClick={toggleWalls} aria-label={wallsLabel} aria-pressed={isWallsDown}>
				<WallsIcon weight="bold" />
			</z-button>
			<z-button size="small" kind="ghost" onClick={toggleNight} aria-label={timeLabel}>
				<TimeIcon weight="bold" />
			</z-button>
			<z-button size="small" kind="ghost" onClick={confirmReset} aria-label="Reset lot">
				<Broom weight="bold" />
			</z-button>
		</div>
	)
}

export const TopBar = () => {
	return (
		<header className="topBar">
			<TopActions />
		</header>
	)
}
