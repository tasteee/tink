// World scale: one tile is one meter. The lot is a square of
// LOT_SIZE tiles centered on the world origin.
export const LOT_SIZE = 16
export const HALF_LOT = LOT_SIZE / 2

export const WALL_HEIGHT = 2.6
export const WALL_DOWN_HEIGHT = 0.3
export const WALL_THICKNESS = 0.12
export const FENCE_HEIGHT = 0.9

// A pointer that moves more than this many pixels between
// down and up is a drag (camera move), not a tap.
export const TAP_SLOP_PIXELS = 8

export const SAVE_KEY = 'plot.world.v2'
export const MAX_HISTORY = 60
