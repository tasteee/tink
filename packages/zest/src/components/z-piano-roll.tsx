import { c, css, event, useProp, useState, useRef, useHost, useEffect, useMemo } from 'atomico'

/*
 * z-piano-roll — a full MIDI note editor / piano roll in the spirit of Ableton's,
 * built as a single self-contained element. It owns a list of notes and every
 * common authoring gesture:
 *
 *   • draw / place notes (draw mode: click-drag; select mode: double-click)
 *   • delete (Delete key, right-click, or double-click a note)
 *   • move in time (drag horizontally) and to other pitches (drag vertically)
 *   • resize from either edge (grab the note's left/right ~6px)
 *   • collision handling — a moved/placed note is the "winner"; any older note it
 *     overlaps on the same pitch is trimmed, split, or removed (latest wins)
 *   • marquee multi-select, then multi-move / multi-resize / multi-delete
 *   • duplicate (Ctrl/Cmd+D), select-all (Ctrl/Cmd+A), arrow-key nudge
 *   • scale highlight + two fold modes (fold to used pitches, fold to scale)
 *   • snap-to-grid, zoom, a sticky piano keyboard gutter and bar ruler
 *
 * Coordinate model. Time lives in *beats* (float); pitch is a MIDI number 0-127.
 * A note is { id, pitch, start, duration, velocity }. Screen space is derived:
 *   x = start * beatWidth        width = duration * beatWidth
 *   y = rowIndex(pitch) * rowHeight   (row 0 is the highest visible pitch)
 * All mutation flows through pure helpers (shift/resize/resolveCollisions) so the
 * live drag *preview* and the committed result share one code path.
 *
 * State is two-way via the `notes` property and the `change` event; the element
 * also exposes an imperative API (getNotes/setNotes/selectAll/deleteSelection/…).
 */

const styles = css`
	:host {
		display: flex;
		flex-direction: column;
		height: 360px;
		background: var(--background);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		overflow: hidden;
		font-family: var(--font-sans);
		color: var(--foreground);
		--pr-white-key: color-mix(in oklch, var(--background) 88%, var(--foreground));
		--pr-black-key: color-mix(in oklch, var(--background) 96%, var(--foreground));
		--pr-line: color-mix(in oklch, var(--border) 55%, transparent);
		--pr-bar-line: color-mix(in oklch, var(--border) 100%, transparent);
		--pr-scale-row: color-mix(in oklch, var(--accent) 8%, transparent);
		--pr-note: var(--accent);
		--pr-note-sel: var(--accent-alt);
		outline: none;
	}
	:host([is-hidden]) {
		display: none;
	}
	:host([is-disabled]) {
		opacity: 0.55;
		pointer-events: none;
	}

	/* --- toolbar --- */
	.toolbar {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		border-bottom: 1px solid var(--border);
		background: var(--card);
		flex-shrink: 0;
		user-select: none;
	}
	.tb-group {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		background: color-mix(in oklch, var(--foreground) 6%, transparent);
		border-radius: var(--radius-sm);
		padding: 2px;
	}
	.tb-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		height: 1.75rem;
		padding-inline: 0.55rem;
		border: none;
		background: transparent;
		color: var(--muted-foreground);
		font-family: var(--font-sans);
		font-size: var(--font-size-caption);
		font-weight: var(--font-weight-medium);
		border-radius: var(--small-button-radius);
		cursor: pointer;
		transition: background 0.12s ease, color 0.12s ease;
	}
	.tb-btn:hover {
		color: var(--foreground);
	}
	.tb-btn.is-active {
		background: var(--background);
		color: var(--foreground);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
	}
	.tb-sep {
		width: 1px;
		align-self: stretch;
		background: var(--border);
		margin-inline: 0.15rem;
	}
	.tb-label {
		font-size: var(--font-size-caption);
		color: var(--muted-foreground);
		font-variant-numeric: tabular-nums;
	}
	.tb-select {
		height: 1.75rem;
		background: color-mix(in oklch, var(--foreground) 6%, transparent);
		color: var(--foreground);
		border: 1px solid var(--border);
		border-radius: var(--small-button-radius);
		font-family: var(--font-mono);
		font-size: var(--font-size-caption);
		padding-inline: 0.35rem;
		cursor: pointer;
	}
	.tb-spacer {
		flex: 1;
	}

	/* --- scroll surface + grid layout --- */
	.scroll {
		position: relative;
		flex: 1;
		overflow: auto;
		background: var(--background);
		scrollbar-width: thin;
	}
	.layout {
		display: grid;
		position: relative;
	}
	.corner {
		position: sticky;
		top: 0;
		left: 0;
		z-index: 4;
		background: var(--card);
		border-right: 1px solid var(--border);
		border-bottom: 1px solid var(--border);
	}
	.ruler {
		position: sticky;
		top: 0;
		z-index: 3;
		background: var(--card);
		border-bottom: 1px solid var(--border);
		overflow: hidden;
	}
	.bar-label {
		position: absolute;
		top: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		padding-left: 5px;
		font-family: var(--font-mono);
		font-size: var(--font-size-caption);
		color: var(--muted-foreground);
		border-left: 1px solid var(--pr-bar-line);
		font-variant-numeric: tabular-nums;
		pointer-events: none;
	}
	.keys {
		position: sticky;
		left: 0;
		z-index: 3;
		border-right: 1px solid var(--border);
		overflow: hidden;
	}
	.key {
		position: absolute;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding-right: 6px;
		box-sizing: border-box;
		font-family: var(--font-mono);
		font-size: 9px;
		color: var(--muted-foreground);
		border-bottom: 1px solid var(--pr-line);
		cursor: pointer;
		user-select: none;
	}
	.key.is-white {
		background: var(--pr-white-key);
	}
	.key.is-black {
		background: var(--pr-black-key);
		color: color-mix(in oklch, var(--muted-foreground) 70%, transparent);
	}
	.key.is-c {
		color: var(--foreground);
	}
	.key:hover {
		background: color-mix(in oklch, var(--accent) 22%, var(--pr-white-key));
	}

	/* --- the note world --- */
	.world {
		position: relative;
		z-index: 1;
		touch-action: none;
	}
	.world.mode-draw {
		cursor: crosshair;
	}
	.rowbg {
		position: absolute;
		left: 0;
		right: 0;
		border-bottom: 1px solid var(--pr-line);
		pointer-events: none;
	}
	.rowbg.is-black {
		background: color-mix(in oklch, var(--foreground) 3.5%, transparent);
	}
	.rowbg.is-scale {
		background: var(--pr-scale-row);
	}
	.rowbg.is-root {
		background: color-mix(in oklch, var(--accent) 15%, transparent);
	}
	.gridlines {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 2;
	}
	.note {
		position: absolute;
		box-sizing: border-box;
		background: var(--pr-note);
		border: 1px solid color-mix(in oklch, black 35%, var(--pr-note));
		border-radius: 2px;
		z-index: 3;
		pointer-events: none;
		overflow: hidden;
		box-shadow: inset 0 1px 0 color-mix(in oklch, white 25%, transparent);
	}
	.note.is-selected {
		background: var(--pr-note-sel);
		border-color: color-mix(in oklch, white 70%, var(--pr-note-sel));
		z-index: 4;
	}
	.note .vel {
		position: absolute;
		left: 0;
		bottom: 0;
		top: 0;
		background: color-mix(in oklch, black 22%, transparent);
	}
	.marquee {
		position: absolute;
		z-index: 6;
		border: 1px solid var(--accent);
		background: color-mix(in oklch, var(--accent) 15%, transparent);
		pointer-events: none;
	}
	.playhead {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 2px;
		background: var(--accent-alt);
		z-index: 7;
		pointer-events: none;
	}
`

type Note = {
	id: number
	pitch: number
	start: number
	duration: number
	velocity: number
}

type Gesture = {
	type: 'move' | 'resize-l' | 'resize-r' | 'draw' | 'marquee'
	startBeat: number
	startPitch: number
	movingIds: Set<number>
	orig: Note[] // snapshot of the notes being transformed (draw: the new note)
	additive: boolean
	baseSelection: Set<number>
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const BLACK = new Set([1, 3, 6, 8, 10])
const EDGE = 6 // px hit zone for edge-resize
const EPS = 1e-6

const SCALES: Record<string, number[]> = {
	major: [0, 2, 4, 5, 7, 9, 11],
	minor: [0, 2, 3, 5, 7, 8, 10],
	dorian: [0, 2, 3, 5, 7, 9, 10],
	phrygian: [0, 1, 3, 5, 7, 8, 10],
	lydian: [0, 2, 4, 6, 7, 9, 11],
	mixolydian: [0, 2, 4, 5, 7, 9, 10],
	locrian: [0, 1, 3, 5, 6, 8, 10],
	'harmonic-minor': [0, 2, 3, 5, 7, 8, 11],
	'melodic-minor': [0, 2, 3, 5, 7, 9, 11],
	'pentatonic-major': [0, 2, 4, 7, 9],
	'pentatonic-minor': [0, 3, 5, 7, 10],
	blues: [0, 3, 5, 6, 7, 10],
	chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
}

const noteName = (p: number) => `${NOTE_NAMES[((p % 12) + 12) % 12]}${Math.floor(p / 12) - 1}`
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

// --- pure interval math for collision resolution ---

// Subtract each blocker interval from [s, e]; returns 0, 1, or 2 remaining pieces.
const subtract = (s: number, e: number, blockers: [number, number][]): [number, number][] => {
	let segs: [number, number][] = [[s, e]]
	for (const [bs, be] of blockers) {
		const next: [number, number][] = []
		for (const [cs, ce] of segs) {
			if (be <= cs + EPS || bs >= ce - EPS) {
				next.push([cs, ce]) // no overlap
			} else {
				if (cs < bs - EPS) next.push([cs, bs])
				if (be < ce - EPS) next.push([be, ce])
			}
		}
		segs = next
	}
	return segs
}

export const ZPianoRoll = c(
	(props): any => {
		const host = useHost()
		const worldRef = useRef<HTMLDivElement>()
		const scrollRef = useRef<HTMLDivElement>()
		const idRef = useRef(1)
		const gestureRef = useRef<Gesture | null>(null)
		const nextId = () => {
			const id = idRef.current ?? 1
			idRef.current = id + 1
			return id
		}

		const [notes, setNotes] = useState<Note[]>([])
		const [selection, setSelection] = useState<Set<number>>(() => new Set())
		const [preview, setPreview] = useState<Note[] | null>(null)
		const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
		const [mode, setMode] = useProp<string>('mode')
		const [fold, setFold] = useProp<string>('fold')
		const [snap, setSnap] = useProp<number>('snap')
		const [beatWidthProp, setBeatWidth] = useProp<number>('beatWidth')
		const [rowHeightProp, setRowHeight] = useProp<number>('rowHeight')

		// --- config with defaults ---
		const beatsPerBar = props.beatsPerBar || 4
		const bars = props.bars || 8
		const beatWidth = beatWidthProp || 48
		const rowHeight = rowHeightProp || 18
		const minPitch = props.minPitch ?? 24
		const maxPitch = props.maxPitch ?? 96
		const snapUnit = snap ?? 0.25
		const minLen = snapUnit > 0 ? snapUnit : 0.0625
		const curMode = mode || 'select'
		const curFold = fold || 'none'
		const scaleName = props.scale || ''
		const root = ((props.root || 0) % 12 + 12) % 12
		const defaultVelocity = props.defaultVelocity ?? 100
		const gutterW = props.hideKeyboard ? 0 : 56
		const rulerH = 22

		const inScale = (pitch: number): boolean => {
			const set = SCALES[scaleName]
			if (!set) return false
			return set.includes((((pitch - root) % 12) + 12) % 12)
		}

		// --- ingest the `notes` property when it changes identity ---
		useEffect(() => {
			const raw = props.notes as any[]
			if (!Array.isArray(raw)) return
			let maxId = idRef.current ?? 1
			const norm: Note[] = raw.map((n, i) => {
				const id = typeof n.id === 'number' ? n.id : maxId + i + 1
				maxId = Math.max(maxId, id)
				return {
					id,
					pitch: clamp(Math.round(n.pitch ?? 60), 0, 127),
					start: Math.max(0, n.start ?? 0),
					duration: Math.max(minLen, n.duration ?? minLen),
					velocity: clamp(n.velocity ?? defaultVelocity, 1, 127)
				}
			})
			idRef.current = maxId + 1
			setNotes(norm)
		}, [props.notes])

		const displayed = preview ?? notes
		const totalBeats = Math.max(
			bars * beatsPerBar,
			displayed.reduce((m, n) => Math.max(m, n.start + n.duration), 0)
		)
		const worldW = totalBeats * beatWidth

		// --- which pitch rows are visible (top = highest) ---
		const visibleRows = useMemo(() => {
			const used = new Set<number>()
			for (const n of notes) used.add(n.pitch)
			const rows: number[] = []
			for (let p = maxPitch; p >= minPitch; p--) {
				if (curFold === 'used') {
					if (used.has(p)) rows.push(p)
				} else if (curFold === 'scale') {
					if (inScale(p) || used.has(p)) rows.push(p)
				} else {
					rows.push(p)
				}
			}
			// Fold modes can collapse to nothing; fall back to a sensible octave.
			if (!rows.length) for (let p = maxPitch; p >= maxPitch - 12; p--) rows.push(p)
			return rows
		}, [notes, curFold, scaleName, root, minPitch, maxPitch])

		const rowIndex = useMemo(() => {
			const m = new Map<number, number>()
			visibleRows.forEach((p, i) => m.set(p, i))
			return m
		}, [visibleRows])
		const worldH = visibleRows.length * rowHeight

		const yOf = (pitch: number) => (rowIndex.get(pitch) ?? -1) * rowHeight
		const pitchFromY = (y: number) => visibleRows[clamp(Math.floor(y / rowHeight), 0, visibleRows.length - 1)]

		// --- snapping ---
		const snapDelta = (d: number) => (snapUnit > 0 ? Math.round(d / snapUnit) * snapUnit : d)
		const snapFloor = (v: number) => (snapUnit > 0 ? Math.floor(v / snapUnit) * snapUnit : v)

		// --- collision resolution: `winners` overwrite overlapping same-pitch notes ---
		const resolveCollisions = (list: Note[], winnerIds: Set<number>): Note[] => {
			const winners = list.filter((n) => winnerIds.has(n.id))
			const others = list.filter((n) => !winnerIds.has(n.id))
			const out: Note[] = [...winners]
			for (const o of others) {
				const blockers = winners
					.filter((w) => w.pitch === o.pitch)
					.map((w) => [w.start, w.start + w.duration] as [number, number])
				const segs = subtract(o.start, o.start + o.duration, blockers)
				segs.forEach(([s, e], i) => {
					if (e - s <= EPS) return
					out.push(i === 0 ? { ...o, start: s, duration: e - s } : { ...o, id: nextId(), start: s, duration: e - s })
				})
			}
			return out
		}

		// --- transform a gesture's snapshot into moved notes at the current pointer ---
		const transform = (g: Gesture, curBeat: number, curPitch: number): Note[] => {
			if (g.type === 'draw' || g.type === 'resize-r') {
				return g.orig.map((o) => {
					if (g.type === 'draw') return { ...o, duration: Math.max(minLen, snapDelta(curBeat - g.startBeat)) }
					const dBeat = snapDelta(curBeat - g.startBeat)
					return { ...o, duration: Math.max(minLen, o.duration + dBeat) }
				})
			}
			if (g.type === 'resize-l') {
				const dBeat = snapDelta(curBeat - g.startBeat)
				return g.orig.map((o) => {
					const end = o.start + o.duration
					const ns = clamp(o.start + dBeat, 0, end - minLen)
					return { ...o, start: ns, duration: end - ns }
				})
			}
			// move
			const dBeat = snapDelta(curBeat - g.startBeat)
			const dPitch = curPitch - g.startPitch
			return g.orig.map((o) => ({
				...o,
				start: Math.max(0, o.start + dBeat),
				pitch: clamp(o.pitch + dPitch, 0, 127)
			}))
		}

		const buildResult = (g: Gesture, curBeat: number, curPitch: number): Note[] => {
			const moved = transform(g, curBeat, curPitch)
			const rest = notes.filter((n) => !g.movingIds.has(n.id))
			return resolveCollisions([...rest, ...moved], g.movingIds)
		}

		// --- commit + emit ---
		const commit = (next: Note[], sel?: Set<number>) => {
			setNotes(next)
			if (sel) setSelection(sel)
			props.change({ notes: next.map(({ id, pitch, start, duration, velocity }) => ({ id, pitch, start, duration, velocity })) })
		}

		// --- pointer geometry ---
		const pointToBeatPitch = (e: PointerEvent) => {
			const r = worldRef.current!.getBoundingClientRect()
			const beat = Math.max(0, (e.clientX - r.left) / beatWidth)
			const pitch = pitchFromY(e.clientY - r.top)
			return { beat, pitch, x: e.clientX - r.left, y: e.clientY - r.top }
		}

		const noteAt = (beat: number, pitch: number): Note | null => {
			for (let i = displayed.length - 1; i >= 0; i--) {
				const n = displayed[i]
				if (n.pitch === pitch && beat >= n.start - EPS && beat <= n.start + n.duration + EPS) return n
			}
			return null
		}

		// --- pointer down: decide the gesture ---
		const onPointerDown = (e: PointerEvent) => {
			if (props.isDisabled || e.button === 2) return
			;(host.current as HTMLElement).focus?.()
			const { beat, pitch } = pointToBeatPitch(e)
			const hit = noteAt(beat, pitch)
			const additive = e.shiftKey || e.metaKey || e.ctrlKey
			worldRef.current!.setPointerCapture(e.pointerId)

			if (hit) {
				// selection bookkeeping
				let sel = new Set(selection)
				if (additive) {
					sel.has(hit.id) ? sel.delete(hit.id) : sel.add(hit.id)
				} else if (!sel.has(hit.id)) {
					sel = new Set([hit.id])
				}
				setSelection(sel)
				// edge vs body
				const intoPx = (beat - hit.start) * beatWidth
				const widthPx = hit.duration * beatWidth
				let type: Gesture['type'] = 'move'
				if (widthPx > 3 * EDGE && intoPx < EDGE) type = 'resize-l'
				else if (widthPx > 3 * EDGE && widthPx - intoPx < EDGE) type = 'resize-r'
				const movingIds = sel.has(hit.id) ? sel : new Set([hit.id])
				gestureRef.current = {
					type,
					startBeat: beat,
					startPitch: pitch,
					movingIds,
					orig: notes.filter((n) => movingIds.has(n.id)).map((n) => ({ ...n })),
					additive,
					baseSelection: sel
				}
				return
			}

			// empty space
			if (curMode === 'draw') {
				const start = snapFloor(beat)
				const newNote: Note = { id: nextId(), pitch, start, duration: minLen, velocity: defaultVelocity }
				const ids = new Set([newNote.id])
				setSelection(ids)
				gestureRef.current = {
					type: 'draw',
					startBeat: start,
					startPitch: pitch,
					movingIds: ids,
					orig: [newNote],
					additive: false,
					baseSelection: ids
				}
				setPreview(buildResult(gestureRef.current, beat, pitch))
			} else {
				const base = additive ? new Set(selection) : new Set<number>()
				if (!additive) setSelection(base)
				gestureRef.current = {
					type: 'marquee',
					startBeat: beat,
					startPitch: pitch,
					movingIds: new Set(),
					orig: [],
					additive,
					baseSelection: base
				}
			}
		}

		const onPointerMove = (e: PointerEvent) => {
			const g = gestureRef.current
			if (!g) {
				updateHoverCursor(e)
				return
			}
			const { beat, pitch, x, y } = pointToBeatPitch(e)
			if (g.type === 'marquee') {
				const sx = g.startBeat * beatWidth
				const startY = (rowIndex.get(g.startPitch) ?? 0) * rowHeight
				setMarquee({ x: Math.min(sx, x), y: Math.min(startY, y), w: Math.abs(x - sx), h: Math.abs(y - startY) })
				// select notes intersecting the marquee rect (in beat/pitch space)
				const b0 = Math.min(g.startBeat, beat)
				const b1 = Math.max(g.startBeat, beat)
				const rows0 = Math.min(rowIndex.get(g.startPitch) ?? 0, rowIndex.get(pitch) ?? 0)
				const rows1 = Math.max(rowIndex.get(g.startPitch) ?? 0, rowIndex.get(pitch) ?? 0)
				const sel = new Set(g.baseSelection)
				for (const n of notes) {
					const ri = rowIndex.get(n.pitch)
					if (ri == null) continue
					const hitX = n.start <= b1 && n.start + n.duration >= b0
					const hitY = ri >= rows0 && ri <= rows1
					if (hitX && hitY) sel.add(n.id)
				}
				setSelection(sel)
				return
			}
			setPreview(buildResult(g, beat, pitch))
		}

		const onPointerUp = (e: PointerEvent) => {
			const g = gestureRef.current
			if (!g) return
			try {
				worldRef.current!.releasePointerCapture(e.pointerId)
			} catch {}
			if (g.type === 'marquee') {
				setMarquee(null)
				gestureRef.current = null
				props.select({ ids: [...selection] })
				return
			}
			const { beat, pitch } = pointToBeatPitch(e)
			const next = buildResult(g, beat, pitch)
			setPreview(null)
			gestureRef.current = null
			commit(next, new Set(g.movingIds))
			props.select({ ids: [...g.movingIds] })
		}

		// hover cursor over the world (edge = resize, body = move, else default/crosshair)
		const updateHoverCursor = (e: PointerEvent) => {
			const world = worldRef.current
			if (!world) return
			if (curMode === 'draw') {
				world.style.cursor = 'crosshair'
				return
			}
			const { beat, pitch } = pointToBeatPitch(e)
			const hit = noteAt(beat, pitch)
			if (!hit) {
				world.style.cursor = 'default'
				return
			}
			const intoPx = (beat - hit.start) * beatWidth
			const widthPx = hit.duration * beatWidth
			if (widthPx > 3 * EDGE && (intoPx < EDGE || widthPx - intoPx < EDGE)) world.style.cursor = 'ew-resize'
			else world.style.cursor = 'move'
		}

		// --- double-click: create (empty) or delete (on a note) ---
		const onDblClick = (e: MouseEvent) => {
			if (props.isDisabled) return
			const r = worldRef.current!.getBoundingClientRect()
			const beat = Math.max(0, (e.clientX - r.left) / beatWidth)
			const pitch = pitchFromY(e.clientY - r.top)
			const hit = noteAt(beat, pitch)
			if (hit) {
				commit(notes.filter((n) => n.id !== hit.id), new Set())
				return
			}
			const start = snapFloor(beat)
			const newNote: Note = { id: nextId(), pitch, start, duration: snapUnit > 0 ? snapUnit : 1, velocity: defaultVelocity }
			const ids = new Set([newNote.id])
			commit(resolveCollisions([...notes, newNote], ids), ids)
		}

		// --- right-click: delete note under cursor (or whole selection) ---
		const onContextMenu = (e: MouseEvent) => {
			if (props.isDisabled) return
			e.preventDefault()
			const r = worldRef.current!.getBoundingClientRect()
			const beat = Math.max(0, (e.clientX - r.left) / beatWidth)
			const pitch = pitchFromY(e.clientY - r.top)
			const hit = noteAt(beat, pitch)
			if (!hit) return
			const ids = selection.has(hit.id) ? selection : new Set([hit.id])
			commit(notes.filter((n) => !ids.has(n.id)), new Set())
		}

		// --- keyboard operations ---
		const duplicate = () => {
			if (!selection.size) return
			const sel = notes.filter((n) => selection.has(n.id))
			const minStart = Math.min(...sel.map((n) => n.start))
			const maxEnd = Math.max(...sel.map((n) => n.start + n.duration))
			const offset = Math.max(snapUnit, snapDelta(maxEnd - minStart))
			const copies = sel.map((n) => ({ ...n, id: nextId(), start: n.start + offset }))
			const ids = new Set(copies.map((c) => c.id))
			commit(resolveCollisions([...notes, ...copies], ids), ids)
		}

		const nudge = (dBeat: number, dPitch: number) => {
			if (!selection.size) return
			const moved = notes.map((n) =>
				selection.has(n.id)
					? { ...n, start: Math.max(0, n.start + dBeat), pitch: clamp(n.pitch + dPitch, 0, 127) }
					: n
			)
			commit(resolveCollisions(moved, selection), new Set(selection))
		}

		const onKeyDown = (e: KeyboardEvent) => {
			if (props.isDisabled) return
			const mod = e.metaKey || e.ctrlKey
			if (e.key === 'Delete' || e.key === 'Backspace') {
				e.preventDefault()
				commit(notes.filter((n) => !selection.has(n.id)), new Set())
			} else if (mod && (e.key === 'd' || e.key === 'D')) {
				e.preventDefault()
				duplicate()
			} else if (mod && (e.key === 'a' || e.key === 'A')) {
				e.preventDefault()
				setSelection(new Set(notes.map((n) => n.id)))
			} else if (e.key === 'Escape') {
				setSelection(new Set())
			} else if (e.key === 'ArrowLeft') {
				e.preventDefault()
				nudge(-(snapUnit || 0.25), 0)
			} else if (e.key === 'ArrowRight') {
				e.preventDefault()
				nudge(snapUnit || 0.25, 0)
			} else if (e.key === 'ArrowUp') {
				e.preventDefault()
				nudge(0, e.shiftKey ? 12 : 1)
			} else if (e.key === 'ArrowDown') {
				e.preventDefault()
				nudge(0, e.shiftKey ? -12 : -1)
			}
		}

		// --- imperative API ---
		useEffect(() => {
			const el = host.current as any
			el.getNotes = () => notes.map(({ id, pitch, start, duration, velocity }) => ({ id, pitch, start, duration, velocity }))
			el.setNotes = (arr: any[]) => {
				let maxId = idRef.current ?? 1
				const norm = (arr || []).map((n, i) => {
					const id = typeof n.id === 'number' ? n.id : maxId + i + 1
					maxId = Math.max(maxId, id)
					return {
						id,
						pitch: clamp(Math.round(n.pitch ?? 60), 0, 127),
						start: Math.max(0, n.start ?? 0),
						duration: Math.max(minLen, n.duration ?? minLen),
						velocity: clamp(n.velocity ?? defaultVelocity, 1, 127)
					}
				})
				idRef.current = maxId + 1
				commit(norm, new Set())
			}
			el.selectAll = () => setSelection(new Set(notes.map((n) => n.id)))
			el.clearSelection = () => setSelection(new Set())
			el.deleteSelection = () => commit(notes.filter((n) => !selection.has(n.id)), new Set())
			el.duplicateSelection = duplicate
			el.getSelection = () => [...selection]
		}, [notes, selection])

		// --- vertical grid lines: subdivisions, beats, bars via layered gradients ---
		const subPx = snapUnit > 0 ? snapUnit * beatWidth : beatWidth
		const beatPx = beatWidth
		const barPx = beatsPerBar * beatWidth
		const gridBg = [
			`repeating-linear-gradient(90deg, var(--pr-line) 0 1px, transparent 1px ${subPx}px)`,
			`repeating-linear-gradient(90deg, color-mix(in oklch, var(--border) 80%, transparent) 0 1px, transparent 1px ${beatPx}px)`,
			`repeating-linear-gradient(90deg, var(--pr-bar-line) 0 1px, transparent 1px ${barPx}px)`
		].join(', ')

		// bar labels for the ruler
		const barLabels: any[] = []
		for (let b = 0; b <= Math.floor(totalBeats / beatsPerBar); b++) {
			barLabels.push(
				<div class="bar-label" style={{ left: `${b * barPx}px`, width: `${barPx}px` }}>
					{b + 1}
				</div>
			)
		}

		return (
			<host
				shadowDom
				tabindex="0"
				onkeydown={onKeyDown}
				role="application"
				aria-label="Piano roll MIDI editor"
			>
				{!props.hideToolbar && (
					<div class="toolbar">
						<div class="tb-group">
							<button
								class={curMode !== 'draw' ? 'tb-btn is-active' : 'tb-btn'}
								onclick={() => setMode('select')}
								title="Select / edit (V)"
							>
								Select
							</button>
							<button
								class={curMode === 'draw' ? 'tb-btn is-active' : 'tb-btn'}
								onclick={() => setMode('draw')}
								title="Draw notes (B)"
							>
								Draw
							</button>
						</div>
						<div class="tb-sep" />
						<span class="tb-label">Snap</span>
						<select
							class="tb-select"
							onchange={(e: any) => setSnap(Number(e.target.value))}
						>
							{[
								['1/1', 4],
								['1/2', 2],
								['1/4', 1],
								['1/8', 0.5],
								['1/16', 0.25],
								['1/32', 0.125],
								['Off', 0]
							].map(([label, val]) => (
								<option value={String(val)} selected={snapUnit === (val as number)}>
									{label}
								</option>
							))}
						</select>
						<div class="tb-sep" />
						<div class="tb-group">
							<button
								class={curFold === 'none' ? 'tb-btn is-active' : 'tb-btn'}
								onclick={() => setFold('none')}
								title="Show all pitches"
							>
								All
							</button>
							<button
								class={curFold === 'used' ? 'tb-btn is-active' : 'tb-btn'}
								onclick={() => setFold('used')}
								title="Fold to used notes"
							>
								Fold
							</button>
							<button
								class={curFold === 'scale' ? 'tb-btn is-active' : 'tb-btn'}
								onclick={() => setFold('scale')}
								title="Fold to scale"
							>
								Scale
							</button>
						</div>
						<div class="tb-sep" />
						<span class="tb-label">Zoom</span>
						<div class="tb-group">
							<button class="tb-btn" onclick={() => setBeatWidth(clamp(beatWidth * 0.8, 12, 320))} title="Zoom out (horizontal)">
								H−
							</button>
							<button class="tb-btn" onclick={() => setBeatWidth(clamp(beatWidth * 1.25, 12, 320))} title="Zoom in (horizontal)">
								H+
							</button>
							<button class="tb-btn" onclick={() => setRowHeight(clamp(rowHeight - 3, 9, 40))} title="Shorter rows (vertical)">
								V−
							</button>
							<button class="tb-btn" onclick={() => setRowHeight(clamp(rowHeight + 3, 9, 40))} title="Taller rows (vertical)">
								V+
							</button>
						</div>
						<div class="tb-spacer" />
						<span class="tb-label">{notes.length} notes · {selection.size} sel</span>
					</div>
				)}

				<div class="scroll" ref={scrollRef}>
					<div
						class="layout"
						style={{
							gridTemplateColumns: `${gutterW}px ${worldW}px`,
							gridTemplateRows: `${rulerH}px ${worldH}px`
						}}
					>
						<div class="corner" />
						<div class="ruler" style={{ height: `${rulerH}px` }}>
							{barLabels}
						</div>

						{!props.hideKeyboard && (
							<div class="keys" style={{ height: `${worldH}px` }}>
								{visibleRows.map((p) => {
									const isBlack = BLACK.has(((p % 12) + 12) % 12)
									const isC = p % 12 === 0
									return (
										<div
											class={`key ${isBlack ? 'is-black' : 'is-white'} ${isC ? 'is-c' : ''}`}
											style={{ top: `${yOf(p)}px`, height: `${rowHeight}px` }}
										>
											{isC || rowHeight >= 16 ? noteName(p) : ''}
										</div>
									)
								})}
							</div>
						)}

						<div
							class={`world mode-${curMode}`}
							ref={worldRef}
							style={{ width: `${worldW}px`, height: `${worldH}px` }}
							onpointerdown={onPointerDown}
							onpointermove={onPointerMove}
							onpointerup={onPointerUp}
							onpointercancel={onPointerUp}
							ondblclick={onDblClick}
							oncontextmenu={onContextMenu}
						>
							{/* row backgrounds (black keys, scale tint) */}
							{visibleRows.map((p) => {
								const pc = ((p % 12) + 12) % 12
								const isBlack = BLACK.has(pc)
								const scaleOn = !!SCALES[scaleName]
								const isRoot = scaleOn && pc === root
								const isScale = scaleOn && inScale(p)
								let cls = 'rowbg'
								if (isRoot) cls += ' is-root'
								else if (isScale) cls += ' is-scale'
								else if (isBlack) cls += ' is-black'
								return <div class={cls} style={{ top: `${yOf(p)}px`, height: `${rowHeight}px` }} />
							})}

							{/* vertical grid lines */}
							<div class="gridlines" style={{ backgroundImage: gridBg }} />

							{/* notes */}
							{displayed.map((n) => {
								const ri = rowIndex.get(n.pitch)
								if (ri == null) return null
								const selected = selection.has(n.id)
								const velFrac = 1 - clamp(n.velocity, 1, 127) / 127
								return (
									<div
										class={selected ? 'note is-selected' : 'note'}
										style={{
											left: `${n.start * beatWidth}px`,
											top: `${ri * rowHeight}px`,
											width: `${Math.max(2, n.duration * beatWidth)}px`,
											height: `${rowHeight - 1}px`
										}}
									>
										<div class="vel" style={{ width: `${velFrac * 100}%` }} />
									</div>
								)
							})}

							{/* marquee */}
							{marquee && (
								<div
									class="marquee"
									style={{
										left: `${marquee.x}px`,
										top: `${marquee.y}px`,
										width: `${marquee.w}px`,
										height: `${marquee.h}px`
									}}
								/>
							)}

							{/* playhead */}
							{props.playhead != null && props.playhead >= 0 && (
								<div class="playhead" style={{ left: `${props.playhead * beatWidth}px` }} />
							)}
						</div>
					</div>
				</div>
			</host>
		)
	},
	{
		props: {
			notes: { type: Array },
			bars: { type: Number, reflect: true },
			beatsPerBar: { type: Number, reflect: true },
			snap: { type: Number, reflect: true },
			beatWidth: { type: Number, reflect: true },
			rowHeight: { type: Number, reflect: true },
			minPitch: { type: Number, reflect: true },
			maxPitch: { type: Number, reflect: true },
			mode: { type: String, reflect: true },
			fold: { type: String, reflect: true },
			scale: { type: String, reflect: true },
			root: { type: Number, reflect: true },
			defaultVelocity: { type: Number, reflect: true },
			playhead: { type: Number, reflect: true },
			hideToolbar: { type: Boolean, reflect: true },
			hideKeyboard: { type: Boolean, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			change: event<{ notes: any[] }>({ bubbles: true, composed: true }),
			select: event<{ ids: number[] }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-piano-roll', ZPianoRoll)
