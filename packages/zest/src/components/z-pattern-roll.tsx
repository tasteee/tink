import { c, css, event, useProp, useState, useRef, useHost, useEffect, useMemo } from 'atomico'

/*
 * z-pattern-roll — a chord-relative pattern editor, sibling of z-piano-roll.
 * Instead of absolute MIDI pitches, its vertical axis is *chord-tone degrees*
 * (N1 = root of the active chord, N2 = 2nd chord tone, …). You author a pattern
 * once and it renders good-sounding MIDI over ANY chord it's later applied to —
 * the same idea as the Nashville Number System, but relative to the chord.
 *
 * It reuses z-piano-roll's whole gesture engine (draw / move / edge-resize /
 * marquee multi-select / multi-move-resize-delete / duplicate / collision
 * trim+split "latest wins" / snap / zoom), swapping pitch rows for degree rows
 * and adding the pattern-specific per-signal fields: octave modifier, velocity,
 * probability, enabled.
 *
 * A *signal* is { id, tone, octave, start, duration, velocity, probability,
 * enabled }. Screen space:
 *   x = start * beatWidth        width = duration * beatWidth
 *   y = (tones - tone) * rowHeight    (top row = highest degree)
 * Collisions are resolved per (tone, octave) — two signals sharing a row but
 * differing in octave resolve to different pitches, so they don't collide.
 *
 * Two-way via the `signals` property + `change` event; also an imperative API
 * (getSignals/setSignals/selectAll/deleteSelection/duplicateSelection/…).
 * See docs/z-pattern-roll.md for the concept, references and amore integration.
 */

const styles = css`
	:host {
		display: flex;
		flex-direction: column;
		height: 320px;
		background: var(--background);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		overflow: hidden;
		font-family: var(--font-sans);
		color: var(--foreground);
		--pr-line: color-mix(in oklch, var(--border) 55%, transparent);
		--pr-bar-line: color-mix(in oklch, var(--border) 100%, transparent);
		--pr-row: color-mix(in oklch, var(--background) 92%, var(--foreground));
		--pr-row-alt: color-mix(in oklch, var(--background) 97%, var(--foreground));
		--pr-root-row: color-mix(in oklch, var(--accent) 12%, transparent);
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
	.tb-btn:disabled {
		opacity: 0.4;
		cursor: default;
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
	.beat-label {
		position: absolute;
		top: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		padding-left: 5px;
		font-family: var(--font-mono);
		font-size: var(--font-size-caption);
		color: var(--muted-foreground);
		border-left: 1px solid var(--pr-line);
		font-variant-numeric: tabular-nums;
		pointer-events: none;
	}
	.beat-label.is-bar {
		border-left-color: var(--pr-bar-line);
		color: var(--foreground);
	}
	.keys {
		position: sticky;
		left: 0;
		z-index: 3;
		border-right: 1px solid var(--border);
		overflow: hidden;
		background: var(--card);
	}
	.deg {
		position: absolute;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		font-family: var(--font-mono);
		font-size: 11px;
		font-weight: var(--font-weight-semibold);
		color: var(--muted-foreground);
		border-bottom: 1px solid var(--pr-line);
		cursor: default;
		user-select: none;
	}
	.deg.is-root {
		color: var(--foreground);
		background: color-mix(in oklch, var(--accent) 10%, transparent);
	}

	/* --- the signal world --- */
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
		background: var(--pr-row);
	}
	.rowbg.is-alt {
		background: var(--pr-row-alt);
	}
	.rowbg.is-root {
		background: var(--pr-root-row);
	}
	.gridlines {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 2;
	}
	.signal {
		position: absolute;
		box-sizing: border-box;
		background: var(--pr-note);
		border: 1px solid color-mix(in oklch, black 35%, var(--pr-note));
		border-radius: 3px;
		z-index: 3;
		pointer-events: none;
		overflow: hidden;
		display: flex;
		align-items: center;
		padding-inline: 4px;
		gap: 3px;
		font-family: var(--font-mono);
		font-size: 10px;
		font-weight: var(--font-weight-semibold);
		color: color-mix(in oklch, black 78%, var(--pr-note));
		box-shadow: inset 0 1px 0 color-mix(in oklch, white 25%, transparent);
	}
	.signal.is-selected {
		background: var(--pr-note-sel);
		border-color: color-mix(in oklch, white 70%, var(--pr-note-sel));
		color: color-mix(in oklch, black 78%, var(--pr-note-sel));
		z-index: 4;
	}
	.signal.is-disabled {
		filter: grayscale(1);
		opacity: 0.4;
	}
	.signal .vel {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		background: color-mix(in oklch, black 22%, transparent);
		pointer-events: none;
	}
	.signal .prob {
		position: absolute;
		left: 0;
		bottom: 0;
		height: 3px;
		background: color-mix(in oklch, white 55%, transparent);
		pointer-events: none;
	}
	.signal .label {
		position: relative;
		z-index: 1;
		white-space: nowrap;
	}
	.signal .oct {
		position: relative;
		z-index: 1;
		opacity: 0.85;
		font-size: 9px;
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

type Signal = {
	id: number
	tone: number
	octave: number
	start: number
	duration: number
	velocity: number
	probability: number
	enabled: boolean
}

type Gesture = {
	type: 'move' | 'resize-l' | 'resize-r' | 'draw' | 'marquee'
	startBeat: number
	startTone: number
	movingIds: Set<number>
	orig: Signal[]
	additive: boolean
	baseSelection: Set<number>
}

const EDGE = 6 // px hit zone for edge-resize
const EPS = 1e-6

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const collisionKey = (s: Signal) => `${s.tone}:${s.octave}`

// Subtract each blocker interval from [s, e]; returns 0, 1, or 2 remaining pieces.
const subtract = (s: number, e: number, blockers: [number, number][]): [number, number][] => {
	let segs: [number, number][] = [[s, e]]
	for (const [bs, be] of blockers) {
		const next: [number, number][] = []
		for (const [cs, ce] of segs) {
			if (be <= cs + EPS || bs >= ce - EPS) {
				next.push([cs, ce])
			} else {
				if (cs < bs - EPS) next.push([cs, bs])
				if (be < ce - EPS) next.push([be, ce])
			}
		}
		segs = next
	}
	return segs
}

export const ZPatternRoll = c(
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

		const [signals, setSignals] = useState<Signal[]>([])
		const [selection, setSelection] = useState<Set<number>>(() => new Set())
		const [preview, setPreview] = useState<Signal[] | null>(null)
		const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
		const [mode, setMode] = useProp<string>('mode')
		const [snap, setSnap] = useProp<number>('snap')
		const [beatWidthProp, setBeatWidth] = useProp<number>('beatWidth')
		const [rowHeightProp, setRowHeight] = useProp<number>('rowHeight')

		// --- config with defaults ---
		const tones = Math.max(1, props.tones || 8)
		const chordSize = props.chordSize && props.chordSize > 0 ? Math.round(props.chordSize) : 0
		const beatsPerBar = props.beatsPerBar || 4
		const length = props.length || 4
		const beatWidth = beatWidthProp || 48
		const rowHeight = rowHeightProp || 22
		const snapUnit = snap ?? 0.25
		const minLen = snapUnit > 0 ? snapUnit : 0.0625
		const curMode = mode || 'select'
		const defaultVelocity = props.defaultVelocity ?? 100
		const defaultOctave = props.defaultOctave ?? 0
		const gutterW = props.hideKeyboard ? 0 : 48
		const rulerH = 22

		const normalize = (raw: any[]): Signal[] => {
			let maxId = idRef.current ?? 1
			const out = (raw || []).map((s, i) => {
				const id = typeof s.id === 'number' ? s.id : maxId + i + 1
				maxId = Math.max(maxId, id)
				return {
					id,
					tone: clamp(Math.round(s.tone ?? 1), 1, tones),
					octave: Math.round(s.octave ?? defaultOctave),
					start: Math.max(0, s.start ?? 0),
					duration: Math.max(minLen, s.duration ?? minLen),
					velocity: clamp(Math.round(s.velocity ?? defaultVelocity), 1, 127),
					probability: clamp(s.probability ?? 1, 0, 1),
					enabled: s.enabled !== false
				}
			})
			idRef.current = maxId + 1
			return out
		}

		// --- ingest the `signals` property when it changes identity ---
		useEffect(() => {
			if (!Array.isArray(props.signals)) return
			setSignals(normalize(props.signals as any[]))
		}, [props.signals])

		const displayed = preview ?? signals
		const totalBeats = Math.max(
			length,
			displayed.reduce((m, s) => Math.max(m, s.start + s.duration), 0)
		)
		const worldW = totalBeats * beatWidth

		// --- degree rows: top = highest degree (N{tones}), bottom = N1 ---
		const degrees = useMemo(() => {
			const rows: number[] = []
			for (let t = tones; t >= 1; t--) rows.push(t)
			return rows
		}, [tones])
		const worldH = tones * rowHeight

		const yOf = (tone: number) => (tones - tone) * rowHeight
		const toneFromY = (y: number) => clamp(tones - Math.floor(y / rowHeight), 1, tones)

		// --- snapping ---
		const snapDelta = (d: number) => (snapUnit > 0 ? Math.round(d / snapUnit) * snapUnit : d)
		const snapFloor = (v: number) => (snapUnit > 0 ? Math.floor(v / snapUnit) * snapUnit : v)

		// --- collision resolution keyed on (tone, octave); winners overwrite ---
		const resolveCollisions = (list: Signal[], winnerIds: Set<number>): Signal[] => {
			const winners = list.filter((s) => winnerIds.has(s.id))
			const others = list.filter((s) => !winnerIds.has(s.id))
			const out: Signal[] = [...winners]
			for (const o of others) {
				const blockers = winners
					.filter((w) => collisionKey(w) === collisionKey(o))
					.map((w) => [w.start, w.start + w.duration] as [number, number])
				const segs = subtract(o.start, o.start + o.duration, blockers)
				segs.forEach(([s, e], i) => {
					if (e - s <= EPS) return
					out.push(i === 0 ? { ...o, start: s, duration: e - s } : { ...o, id: nextId(), start: s, duration: e - s })
				})
			}
			return out
		}

		// --- transform a gesture's snapshot into moved signals at the pointer ---
		const transform = (g: Gesture, curBeat: number, curTone: number): Signal[] => {
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
			const dTone = curTone - g.startTone
			return g.orig.map((o) => ({
				...o,
				start: Math.max(0, o.start + dBeat),
				tone: clamp(o.tone + dTone, 1, tones)
			}))
		}

		const buildResult = (g: Gesture, curBeat: number, curTone: number): Signal[] => {
			const moved = transform(g, curBeat, curTone)
			const rest = signals.filter((s) => !g.movingIds.has(s.id))
			return resolveCollisions([...rest, ...moved], g.movingIds)
		}

		const emit = (list: Signal[]) =>
			props.change({
				signals: list.map(({ id, tone, octave, start, duration, velocity, probability, enabled }) => ({
					id,
					tone,
					octave,
					start,
					duration,
					velocity,
					probability,
					enabled
				}))
			})

		const commit = (next: Signal[], sel?: Set<number>) => {
			setSignals(next)
			if (sel) setSelection(sel)
			emit(next)
		}

		// --- pointer geometry ---
		const pointToBeatTone = (e: PointerEvent | MouseEvent) => {
			const r = worldRef.current!.getBoundingClientRect()
			const beat = Math.max(0, (e.clientX - r.left) / beatWidth)
			const tone = toneFromY(e.clientY - r.top)
			return { beat, tone, x: e.clientX - r.left, y: e.clientY - r.top }
		}

		const signalAt = (beat: number, tone: number): Signal | null => {
			for (let i = displayed.length - 1; i >= 0; i--) {
				const s = displayed[i]
				if (s.tone === tone && beat >= s.start - EPS && beat <= s.start + s.duration + EPS) return s
			}
			return null
		}

		// --- pointer down: decide the gesture ---
		const onPointerDown = (e: PointerEvent) => {
			if (props.isDisabled || e.button === 2) return
			;(host.current as HTMLElement).focus?.()
			const { beat, tone } = pointToBeatTone(e)
			const hit = signalAt(beat, tone)
			const additive = e.shiftKey || e.metaKey || e.ctrlKey
			worldRef.current!.setPointerCapture(e.pointerId)

			if (hit) {
				let sel = new Set(selection)
				if (additive) {
					sel.has(hit.id) ? sel.delete(hit.id) : sel.add(hit.id)
				} else if (!sel.has(hit.id)) {
					sel = new Set([hit.id])
				}
				setSelection(sel)
				const intoPx = (beat - hit.start) * beatWidth
				const widthPx = hit.duration * beatWidth
				let type: Gesture['type'] = 'move'
				if (widthPx > 3 * EDGE && intoPx < EDGE) type = 'resize-l'
				else if (widthPx > 3 * EDGE && widthPx - intoPx < EDGE) type = 'resize-r'
				const movingIds = sel.has(hit.id) ? sel : new Set([hit.id])
				gestureRef.current = {
					type,
					startBeat: beat,
					startTone: tone,
					movingIds,
					orig: signals.filter((s) => movingIds.has(s.id)).map((s) => ({ ...s })),
					additive,
					baseSelection: sel
				}
				return
			}

			if (curMode === 'draw') {
				const start = snapFloor(beat)
				const created: Signal = {
					id: nextId(),
					tone,
					octave: defaultOctave,
					start,
					duration: minLen,
					velocity: defaultVelocity,
					probability: 1,
					enabled: true
				}
				const ids = new Set([created.id])
				setSelection(ids)
				gestureRef.current = {
					type: 'draw',
					startBeat: start,
					startTone: tone,
					movingIds: ids,
					orig: [created],
					additive: false,
					baseSelection: ids
				}
				setPreview(buildResult(gestureRef.current, beat, tone))
			} else {
				const base = additive ? new Set(selection) : new Set<number>()
				if (!additive) setSelection(base)
				gestureRef.current = {
					type: 'marquee',
					startBeat: beat,
					startTone: tone,
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
			const { beat, tone, x, y } = pointToBeatTone(e)
			if (g.type === 'marquee') {
				const sx = g.startBeat * beatWidth
				const startY = yOf(g.startTone)
				setMarquee({ x: Math.min(sx, x), y: Math.min(startY, y), w: Math.abs(x - sx), h: Math.abs(y - startY) })
				const b0 = Math.min(g.startBeat, beat)
				const b1 = Math.max(g.startBeat, beat)
				const t0 = Math.min(g.startTone, tone)
				const t1 = Math.max(g.startTone, tone)
				const sel = new Set(g.baseSelection)
				for (const s of signals) {
					const hitX = s.start <= b1 && s.start + s.duration >= b0
					const hitY = s.tone >= t0 && s.tone <= t1
					if (hitX && hitY) sel.add(s.id)
				}
				setSelection(sel)
				return
			}
			setPreview(buildResult(g, beat, tone))
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
			const { beat, tone } = pointToBeatTone(e)
			const next = buildResult(g, beat, tone)
			setPreview(null)
			gestureRef.current = null
			commit(next, new Set(g.movingIds))
			props.select({ ids: [...g.movingIds] })
		}

		const updateHoverCursor = (e: PointerEvent) => {
			const world = worldRef.current
			if (!world) return
			if (curMode === 'draw') {
				world.style.cursor = 'crosshair'
				return
			}
			const { beat, tone } = pointToBeatTone(e)
			const hit = signalAt(beat, tone)
			if (!hit) {
				world.style.cursor = 'default'
				return
			}
			const intoPx = (beat - hit.start) * beatWidth
			const widthPx = hit.duration * beatWidth
			if (widthPx > 3 * EDGE && (intoPx < EDGE || widthPx - intoPx < EDGE)) world.style.cursor = 'ew-resize'
			else world.style.cursor = 'move'
		}

		// --- double-click: create (empty) or delete (on a signal) ---
		const onDblClick = (e: MouseEvent) => {
			if (props.isDisabled) return
			const { beat, tone } = pointToBeatTone(e)
			const hit = signalAt(beat, tone)
			if (hit) {
				commit(signals.filter((s) => s.id !== hit.id), new Set())
				return
			}
			const created: Signal = {
				id: nextId(),
				tone,
				octave: defaultOctave,
				start: snapFloor(beat),
				duration: snapUnit > 0 ? snapUnit : 1,
				velocity: defaultVelocity,
				probability: 1,
				enabled: true
			}
			const ids = new Set([created.id])
			commit(resolveCollisions([...signals, created], ids), ids)
		}

		// --- right-click: delete signal under cursor (or whole selection) ---
		const onContextMenu = (e: MouseEvent) => {
			if (props.isDisabled) return
			e.preventDefault()
			const { beat, tone } = pointToBeatTone(e)
			const hit = signalAt(beat, tone)
			if (!hit) return
			const ids = selection.has(hit.id) ? selection : new Set([hit.id])
			commit(signals.filter((s) => !ids.has(s.id)), new Set())
		}

		// --- selection operations ---
		const duplicate = () => {
			if (!selection.size) return
			const sel = signals.filter((s) => selection.has(s.id))
			const minStart = Math.min(...sel.map((s) => s.start))
			const maxEnd = Math.max(...sel.map((s) => s.start + s.duration))
			const offset = Math.max(snapUnit, snapDelta(maxEnd - minStart))
			const copies = sel.map((s) => ({ ...s, id: nextId(), start: s.start + offset }))
			const ids = new Set(copies.map((c) => c.id))
			commit(resolveCollisions([...signals, ...copies], ids), ids)
		}

		// Map every selected signal through fn, then resolve collisions (selection wins).
		const patchSelection = (fn: (s: Signal) => Signal) => {
			if (!selection.size) return
			const moved = signals.map((s) => (selection.has(s.id) ? fn(s) : s))
			commit(resolveCollisions(moved, selection), new Set(selection))
		}

		const nudgeTime = (dBeat: number) => patchSelection((s) => ({ ...s, start: Math.max(0, s.start + dBeat) }))
		const nudgeTone = (dTone: number) => patchSelection((s) => ({ ...s, tone: clamp(s.tone + dTone, 1, tones) }))
		const shiftOctave = (d: number) => patchSelection((s) => ({ ...s, octave: clamp(s.octave + d, -4, 4) }))
		const shiftVelocity = (d: number) => patchSelection((s) => ({ ...s, velocity: clamp(s.velocity + d, 1, 127) }))
		const shiftProbability = (d: number) =>
			patchSelection((s) => ({ ...s, probability: clamp(Math.round((s.probability + d) * 100) / 100, 0, 1) }))
		const toggleEnabled = () => patchSelection((s) => ({ ...s, enabled: !s.enabled }))
		const resetModifiers = () => patchSelection((s) => ({ ...s, octave: 0, velocity: defaultVelocity, probability: 1 }))

		const onKeyDown = (e: KeyboardEvent) => {
			if (props.isDisabled) return
			const mod = e.metaKey || e.ctrlKey
			const k = e.key
			if (k === 'Delete' || k === 'Backspace') {
				e.preventDefault()
				commit(signals.filter((s) => !selection.has(s.id)), new Set())
			} else if (mod && (k === 'd' || k === 'D')) {
				e.preventDefault()
				duplicate()
			} else if (mod && (k === 'a' || k === 'A')) {
				e.preventDefault()
				setSelection(new Set(signals.map((s) => s.id)))
			} else if (k === 'Escape') {
				setSelection(new Set())
			} else if (k === 'ArrowLeft') {
				e.preventDefault()
				nudgeTime(-(snapUnit || 0.25))
			} else if (k === 'ArrowRight') {
				e.preventDefault()
				nudgeTime(snapUnit || 0.25)
			} else if (k === 'ArrowUp') {
				e.preventDefault()
				if (e.shiftKey) shiftOctave(1)
				else if (e.altKey) shiftVelocity(5)
				else nudgeTone(1)
			} else if (k === 'ArrowDown') {
				e.preventDefault()
				if (e.shiftKey) shiftOctave(-1)
				else if (e.altKey) shiftVelocity(-5)
				else nudgeTone(-1)
			} else if (k === ',') {
				e.preventDefault()
				shiftProbability(-0.1)
			} else if (k === '.') {
				e.preventDefault()
				shiftProbability(0.1)
			} else if (k === 'm' || k === 'M') {
				toggleEnabled()
			} else if (k === 'r' || k === 'R') {
				resetModifiers()
			}
		}

		// --- imperative API ---
		useEffect(() => {
			const el = host.current as any
			el.getSignals = () =>
				signals.map(({ id, tone, octave, start, duration, velocity, probability, enabled }) => ({
					id,
					tone,
					octave,
					start,
					duration,
					velocity,
					probability,
					enabled
				}))
			el.setSignals = (arr: any[]) => commit(normalize(arr), new Set())
			el.selectAll = () => setSelection(new Set(signals.map((s) => s.id)))
			el.clearSelection = () => setSelection(new Set())
			el.deleteSelection = () => commit(signals.filter((s) => !selection.has(s.id)), new Set())
			el.duplicateSelection = duplicate
			el.getSelection = () => [...selection]
		}, [signals, selection])

		// --- vertical grid lines: subdivisions, beats, bars ---
		const subPx = snapUnit > 0 ? snapUnit * beatWidth : beatWidth
		const beatPx = beatWidth
		const barPx = beatsPerBar * beatWidth
		const gridBg = [
			`repeating-linear-gradient(90deg, var(--pr-line) 0 1px, transparent 1px ${subPx}px)`,
			`repeating-linear-gradient(90deg, color-mix(in oklch, var(--border) 80%, transparent) 0 1px, transparent 1px ${beatPx}px)`,
			`repeating-linear-gradient(90deg, var(--pr-bar-line) 0 1px, transparent 1px ${barPx}px)`
		].join(', ')

		// beat labels for the ruler (bars emphasized)
		const beatLabels: any[] = []
		for (let b = 0; b < Math.ceil(totalBeats); b++) {
			const isBar = b % beatsPerBar === 0
			beatLabels.push(
				<div class={isBar ? 'beat-label is-bar' : 'beat-label'} style={{ left: `${b * beatPx}px`, width: `${beatPx}px` }}>
					{isBar ? `${Math.floor(b / beatsPerBar) + 1}` : `.${(b % beatsPerBar) + 1}`}
				</div>
			)
		}

		const isRootRow = (tone: number) => chordSize > 0 && (tone - 1) % chordSize === 0
		const octaveBand = (tone: number) => (chordSize > 0 ? Math.floor((tone - 1) / chordSize) : 0)

		return (
			<host shadowDom tabindex="0" onkeydown={onKeyDown} role="application" aria-label="Chord pattern editor">
				{!props.hideToolbar && (
					<div class="toolbar">
						<div class="tb-group">
							<button
								class={curMode !== 'draw' ? 'tb-btn is-active' : 'tb-btn'}
								onclick={() => setMode('select')}
								title="Select / edit"
							>
								Select
							</button>
							<button
								class={curMode === 'draw' ? 'tb-btn is-active' : 'tb-btn'}
								onclick={() => setMode('draw')}
								title="Draw signals"
							>
								Draw
							</button>
						</div>
						<div class="tb-sep" />
						<span class="tb-label">Snap</span>
						<select class="tb-select" onchange={(e: any) => setSnap(Number(e.target.value))}>
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
						<span class="tb-label">Zoom</span>
						<div class="tb-group">
							<button class="tb-btn" onclick={() => setBeatWidth(clamp(beatWidth * 0.8, 12, 320))} title="Zoom out (horizontal)">
								H−
							</button>
							<button class="tb-btn" onclick={() => setBeatWidth(clamp(beatWidth * 1.25, 12, 320))} title="Zoom in (horizontal)">
								H+
							</button>
							<button class="tb-btn" onclick={() => setRowHeight(clamp(rowHeight - 3, 12, 48))} title="Shorter rows">
								V−
							</button>
							<button class="tb-btn" onclick={() => setRowHeight(clamp(rowHeight + 3, 12, 48))} title="Taller rows">
								V+
							</button>
						</div>
						<div class="tb-sep" />
						<span class="tb-label">Selection</span>
						<div class="tb-group">
							<button class="tb-btn" disabled={!selection.size} onclick={() => shiftOctave(-1)} title="Octave − (Shift+↓)">
								Oct−
							</button>
							<button class="tb-btn" disabled={!selection.size} onclick={() => shiftOctave(1)} title="Octave + (Shift+↑)">
								Oct+
							</button>
							<button class="tb-btn" disabled={!selection.size} onclick={toggleEnabled} title="Mute / enable (M)">
								Mute
							</button>
							<button class="tb-btn" disabled={!selection.size} onclick={duplicate} title="Duplicate (Ctrl/⌘+D)">
								Dup
							</button>
						</div>
						<div class="tb-spacer" />
						<span class="tb-label">{signals.length} signals · {selection.size} sel</span>
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
							{beatLabels}
						</div>

						{!props.hideKeyboard && (
							<div class="keys" style={{ height: `${worldH}px` }}>
								{degrees.map((t) => (
									<div
										class={isRootRow(t) ? 'deg is-root' : 'deg'}
										style={{ top: `${yOf(t)}px`, height: `${rowHeight}px` }}
									>
										N{t}
									</div>
								))}
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
							{/* row backgrounds (octave bands + root rows) */}
							{degrees.map((t) => {
								let cls = 'rowbg'
								if (isRootRow(t)) cls += ' is-root'
								else if (octaveBand(t) % 2 === 1) cls += ' is-alt'
								return <div class={cls} style={{ top: `${yOf(t)}px`, height: `${rowHeight}px` }} />
							})}

							{/* vertical grid lines */}
							<div class="gridlines" style={{ backgroundImage: gridBg }} />

							{/* signals */}
							{displayed.map((s) => {
								const selected = selection.has(s.id)
								const velFrac = 1 - clamp(s.velocity, 1, 127) / 127
								const widthPx = Math.max(3, s.duration * beatWidth)
								let cls = 'signal'
								if (selected) cls += ' is-selected'
								if (!s.enabled) cls += ' is-disabled'
								return (
									<div
										class={cls}
										style={{
											left: `${s.start * beatWidth}px`,
											top: `${yOf(s.tone)}px`,
											width: `${widthPx}px`,
											height: `${rowHeight - 1}px`
										}}
									>
										<div class="vel" style={{ width: `${velFrac * 100}%` }} />
										{s.probability < 1 && <div class="prob" style={{ width: `${s.probability * 100}%` }} />}
										{widthPx > 18 && <span class="label">N{s.tone}</span>}
										{s.octave !== 0 && widthPx > 30 && (
											<span class="oct">{s.octave > 0 ? `+${s.octave}` : s.octave}</span>
										)}
									</div>
								)
							})}

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
			signals: { type: Array },
			tones: { type: Number, reflect: true },
			chordSize: { type: Number, reflect: true },
			length: { type: Number, reflect: true },
			beatsPerBar: { type: Number, reflect: true },
			snap: { type: Number, reflect: true },
			beatWidth: { type: Number, reflect: true },
			rowHeight: { type: Number, reflect: true },
			mode: { type: String, reflect: true },
			defaultVelocity: { type: Number, reflect: true },
			defaultOctave: { type: Number, reflect: true },
			playhead: { type: Number, reflect: true },
			hideToolbar: { type: Boolean, reflect: true },
			hideKeyboard: { type: Boolean, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			change: event<{ signals: any[] }>({ bubbles: true, composed: true }),
			select: event<{ ids: number[] }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-pattern-roll', ZPatternRoll)
