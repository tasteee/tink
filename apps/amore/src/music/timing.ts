export const TICKS_PER_BEAT = 480

export const beatsToTicks = (beats: number): number => Math.round(beats * TICKS_PER_BEAT)

export const ticksToBeats = (ticks: number): number => ticks / TICKS_PER_BEAT

export const snapTicksToGrid = (ticks: number, gridTicks: number): number => {
	const safeGrid = Math.max(1, Math.round(gridTicks))
	return Math.max(0, Math.round(ticks / safeGrid) * safeGrid)
}
