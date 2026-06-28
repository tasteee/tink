import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type ChangeEvent,
	type PointerEvent as ReactPointerEvent
} from 'react'
import { Link } from 'wouter'
import { FilmStripIcon, XIcon } from '@phosphor-icons/react'
import './tools.css'

// ── Frame Extractor ────────────────────────────────────────────────────────
//
// Upload a phone/desktop video, it derives the true frame rate, then lets you
// scrub *every* frame with touch gestures and save any frame full-resolution.
//
// Architecture (ported + reworked from an earlier prototype):
//   • fps detection — play muted briefly, sample requestVideoFrameCallback
//     mediaTimes, take the median delta → frames-per-second.
//   • frames — a flat array of { timestamp, imageUrl } where imageUrl is filled
//     lazily. We only ever hold a *window* of decoded frames around the current
//     index in memory (seek → drawImage → toBlob → objectURL), unloading the
//     rest. That gives instant scrubbing without holding hundreds of full-res
//     bitmaps.
//   • download — re-seeks and captures at native resolution (PNG), so saved
//     frames are full quality, not the downscaled scrub-cache version.
//   • gestures — vertical drag = moderate scrub (down=forward), horizontal drag
//     = fine scrub at 1/5 speed (right=forward), triple-tap = download.

type Frame = { timestamp: number; imageUrl: string | null }

type Meta = {
	duration: number
	width: number
	height: number
	fps: number
	total: number
}

type Plan = { width: number; height: number; quality: number }

// rVFC isn't in every TS lib.dom version — narrow the surface we touch.
type FrameCallbackVideo = HTMLVideoElement & {
	requestVideoFrameCallback?: (cb: (now: number, meta: { mediaTime: number }) => void) => number
	cancelVideoFrameCallback?: (handle: number) => void
}

const KNOWN_VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'm4v', 'webm', 'ogg', 'ogv', '3gp', '3g2'])
const ACCEPTED_VIDEO_TYPES =
	'video/mp4,video/quicktime,video/x-m4v,video/webm,video/ogg,.mp4,.mov,.m4v,.webm,.ogv,.ogg,.3gp,.3g2'

const MOBILE_MAX_DIMENSION = 960
const DESKTOP_MAX_DIMENSION = 1440
const MOBILE_JPEG_QUALITY = 0.72
const DESKTOP_JPEG_QUALITY = 0.82
const SAFE_SEEK_OFFSET = 0.001

const DEFAULT_FPS_FALLBACK = 30
const MAX_ESTIMATED_FPS = 240
const MIN_SAMPLE_FRAMES = 10
const MAX_SAMPLE_FRAMES = 24
const SAMPLE_TIMEOUT_MS = 1500

// Scrub feel: pixels of finger travel per single frame step.
const VERTICAL_PX_PER_FRAME = 4 // down/up — moderate
const HORIZONTAL_PX_PER_FRAME = 20 // left/right — fine (1/5 of vertical speed)
const AXIS_LOCK_THRESHOLD = 12 // px before a gesture commits to an axis
const TAP_MOVE_TOLERANCE = 10 // px — beyond this it's a scrub, not a tap
const TRIPLE_TAP_WINDOW_MS = 450

// Lazy window: how many frames either side of the current index to keep decoded.
const LOAD_RADIUS = 100
const UNLOAD_RADIUS = 200

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const getFileExtension = (fileName: string) => {
	const segments = fileName.toLowerCase().split('.')
	return segments.length > 1 ? (segments.at(-1) ?? '') : ''
}

const isLikelyVideoFile = (file: File) =>
	file.type.startsWith('video/') || KNOWN_VIDEO_EXTENSIONS.has(getFileExtension(file.name))

const formatSeconds = (timestamp: number) => {
	const safe = Number.isFinite(timestamp) ? Math.max(0, timestamp) : 0
	const minutes = Math.floor(safe / 60)
	const seconds = safe % 60
	return `${minutes.toString().padStart(2, '0')}:${seconds.toFixed(2).padStart(5, '0')}`
}

const isMobileLayout = () =>
	typeof window !== 'undefined' &&
	(window.matchMedia('(max-width: 768px)').matches || navigator.maxTouchPoints > 0)

const getPlan = (width: number, height: number): Plan => {
	const mobile = isMobileLayout()
	const maxDimension = mobile ? MOBILE_MAX_DIMENSION : DESKTOP_MAX_DIMENSION
	const scale = Math.min(1, maxDimension / Math.max(width, height))
	return {
		width: Math.max(1, Math.round(width * scale)),
		height: Math.max(1, Math.round(height * scale)),
		quality: mobile ? MOBILE_JPEG_QUALITY : DESKTOP_JPEG_QUALITY
	}
}

const waitForVideoEvent = (video: HTMLVideoElement, eventName: 'loadedmetadata' | 'loadeddata') =>
	new Promise<void>((resolve, reject) => {
		const onSuccess = () => {
			cleanup()
			resolve()
		}
		const onError = () => {
			cleanup()
			reject(new Error('This browser could not decode the selected video.'))
		}
		const cleanup = () => {
			video.removeEventListener(eventName, onSuccess)
			video.removeEventListener('error', onError)
		}
		video.addEventListener(eventName, onSuccess, { once: true })
		video.addEventListener('error', onError, { once: true })
	})

const seekVideo = (video: HTMLVideoElement, timestamp: number) => {
	if (Math.abs(video.currentTime - timestamp) < 0.0005) return Promise.resolve()
	return new Promise<void>((resolve, reject) => {
		const onSeeked = () => {
			cleanup()
			resolve()
		}
		const onError = () => {
			cleanup()
			reject(new Error('Seeking failed while reading the video.'))
		}
		const cleanup = () => {
			video.removeEventListener('seeked', onSeeked)
			video.removeEventListener('error', onError)
		}
		video.addEventListener('seeked', onSeeked, { once: true })
		video.addEventListener('error', onError, { once: true })
		video.currentTime = timestamp
	})
}

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
	new Promise<Blob>((resolve, reject) => {
		canvas.toBlob(
			(blob) => (blob ? resolve(blob) : reject(new Error('Frame encoding failed.'))),
			type,
			quality
		)
	})

// Play a short burst muted and read back the per-frame mediaTimes that
// requestVideoFrameCallback reports; the median gap between them is 1/fps.
const detectVideoFps = async (video: HTMLVideoElement): Promise<number> => {
	const vfc = video as FrameCallbackVideo
	if (!vfc.requestVideoFrameCallback) return DEFAULT_FPS_FALLBACK

	const originalTime = video.currentTime
	const originalRate = video.playbackRate
	const originalMuted = video.muted
	const mediaTimes: number[] = []
	let handle: number | null = null

	try {
		await seekVideo(video, 0)
		video.muted = true
		video.playbackRate = 1

		await new Promise<void>((resolve) => {
			const start = performance.now()
			const onFrame = (_now: number, meta: { mediaTime: number }) => {
				mediaTimes.push(meta.mediaTime)
				const done = mediaTimes.length >= MAX_SAMPLE_FRAMES || performance.now() - start >= SAMPLE_TIMEOUT_MS
				if (done) return resolve()
				handle = vfc.requestVideoFrameCallback?.(onFrame) ?? null
			}
			handle = vfc.requestVideoFrameCallback?.(onFrame) ?? null
			window.setTimeout(resolve, SAMPLE_TIMEOUT_MS + 200)
			void video.play().catch(() => undefined)
		})
	} catch {
		return DEFAULT_FPS_FALLBACK
	} finally {
		if (handle !== null) vfc.cancelVideoFrameCallback?.(handle)
		video.pause()
		video.playbackRate = originalRate
		video.muted = originalMuted
		await seekVideo(video, Math.min(originalTime, Math.max(0, video.duration - SAFE_SEEK_OFFSET))).catch(
			() => undefined
		)
	}

	if (mediaTimes.length < MIN_SAMPLE_FRAMES) return DEFAULT_FPS_FALLBACK
	const deltas: number[] = []
	for (let i = 1; i < mediaTimes.length; i += 1) {
		const delta = mediaTimes[i] - mediaTimes[i - 1]
		if (delta > 0.0001) deltas.push(delta)
	}
	if (deltas.length === 0) return DEFAULT_FPS_FALLBACK
	deltas.sort((a, b) => a - b)
	const median = deltas[Math.floor(deltas.length / 2)]
	const fps = 1 / median
	if (!Number.isFinite(fps) || fps <= 0) return DEFAULT_FPS_FALLBACK
	return clamp(fps, 1, MAX_ESTIMATED_FPS)
}

export const FrameExtractor = () => {
	const [videoFile, setVideoFile] = useState<File | null>(null)
	const [frames, setFrames] = useState<Frame[]>([])
	const [currentIndex, setCurrentIndex] = useState(0)
	const [meta, setMeta] = useState<Meta | null>(null)
	const [isProcessing, setIsProcessing] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [isDragOver, setIsDragOver] = useState(false)
	const [savedFlash, setSavedFlash] = useState(false)
	const [showHint, setShowHint] = useState(false)

	const videoRef = useRef<HTMLVideoElement>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const stageRef = useRef<HTMLDivElement>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const planRef = useRef<Plan | null>(null)
	const activeVideoUrlRef = useRef<string | null>(null)

	// Refs that mirror state so event handlers read live values without re-binding.
	const framesRef = useRef<Frame[]>([])
	const indexRef = useRef(0)
	useEffect(() => {
		framesRef.current = frames
	}, [frames])
	useEffect(() => {
		indexRef.current = currentIndex
	}, [currentIndex])

	// Serialises every access to the shared <video> element's currentTime so the
	// lazy loader and a download capture can't seek over each other.
	const videoLockRef = useRef<Promise<unknown>>(Promise.resolve())
	const withVideoLock = useCallback(<T,>(fn: () => Promise<T>): Promise<T> => {
		const run = videoLockRef.current.then(fn, fn)
		videoLockRef.current = run.then(
			() => undefined,
			() => undefined
		)
		return run
	}, [])

	const gesture = useRef({
		active: false,
		pointerId: -1,
		startX: 0,
		startY: 0,
		lastX: 0,
		lastY: 0,
		axis: null as 'vertical' | 'horizontal' | null,
		accum: 0,
		moved: false
	})
	const tapCountRef = useRef(0)
	const tapTimerRef = useRef<number | null>(null)

	// ── load a file ─────────────────────────────────────────────────────────
	const loadVideoFile = useCallback((file?: File | null) => {
		if (!file) return
		if (!isLikelyVideoFile(file)) {
			setError('Choose a video such as MP4, MOV, M4V, WEBM, or OGG. HEVC works when the browser can decode it.')
			return
		}
		setError(null)
		setVideoFile(file)
	}, [])

	const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => loadVideoFile(event.target.files?.[0])

	const reset = useCallback(() => {
		setVideoFile(null)
		setFrames([])
		setMeta(null)
		setCurrentIndex(0)
		setError(null)
		setIsProcessing(false)
	}, [])

	// ── setup: decode metadata, detect fps, build the frame index ────────────
	useEffect(() => {
		if (!videoFile) return
		const video = videoRef.current
		const canvas = canvasRef.current
		if (!video || !canvas) return

		let cancelled = false
		const url = URL.createObjectURL(videoFile)
		activeVideoUrlRef.current = url
		setIsProcessing(true)
		setError(null)
		setFrames([])
		framesRef.current = []
		setCurrentIndex(0)
		indexRef.current = 0

		const setup = async () => {
			try {
				video.pause()
				video.src = url
				video.load()
				await waitForVideoEvent(video, 'loadedmetadata')
				if (cancelled) return
				if (!Number.isFinite(video.duration) || video.duration <= 0)
					throw new Error('The video did not expose a readable duration.')
				if (!video.videoWidth || !video.videoHeight)
					throw new Error('The video did not expose usable dimensions.')
				if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA)
					await waitForVideoEvent(video, 'loadeddata')
				if (cancelled) return

				const fps = await detectVideoFps(video)
				if (cancelled) return

				const plan = getPlan(video.videoWidth, video.videoHeight)
				canvas.width = plan.width
				canvas.height = plan.height
				planRef.current = plan

				const total = Math.max(1, Math.round(video.duration * fps))
				const built: Frame[] = Array.from({ length: total }, (_, i) => ({
					timestamp: Math.min(Math.max(0, video.duration - SAFE_SEEK_OFFSET), i / fps),
					imageUrl: null
				}))
				framesRef.current = built
				setMeta({ duration: video.duration, width: video.videoWidth, height: video.videoHeight, fps, total })
				setFrames(built)
				setIsProcessing(false)
				setShowHint(true)
				window.setTimeout(() => setShowHint(false), 4000)
			} catch (err) {
				if (cancelled) return
				setError(err instanceof Error ? err.message : 'This video could not be processed in this browser.')
				setIsProcessing(false)
				setVideoFile(null)
			}
		}
		void setup()

		return () => {
			cancelled = true
			framesRef.current.forEach((frame) => frame.imageUrl && URL.revokeObjectURL(frame.imageUrl))
			if (activeVideoUrlRef.current) {
				URL.revokeObjectURL(activeVideoUrlRef.current)
				activeVideoUrlRef.current = null
			}
			video.removeAttribute('src')
			try {
				video.load()
			} catch {
				/* ignore */
			}
		}
	}, [videoFile])

	// ── lazy windowed extraction ─────────────────────────────────────────────
	useEffect(() => {
		const video = videoRef.current
		const canvas = canvasRef.current
		const plan = planRef.current
		if (!video || !canvas || !plan || frames.length === 0) return
		const ctx = canvas.getContext('2d')
		if (!ctx) return

		let cancelled = false

		// Unload frames outside the keep-window to bound memory.
		setFrames((prev) => {
			const center = indexRef.current
			let changed = false
			const next = prev.map((frame, i) => {
				if (frame.imageUrl && (i < center - UNLOAD_RADIUS || i > center + UNLOAD_RADIUS)) {
					URL.revokeObjectURL(frame.imageUrl)
					changed = true
					return { ...frame, imageUrl: null }
				}
				return frame
			})
			return changed ? next : prev
		})

		const run = async () => {
			const center = indexRef.current
			// Build a nearest-first load order so the visible frame appears first.
			const order: number[] = [center]
			for (let d = 1; d <= LOAD_RADIUS; d += 1) {
				order.push(center - d, center + d)
			}
			for (const i of order) {
				if (cancelled) break
				if (i < 0 || i >= framesRef.current.length) continue
				if (Math.abs(i - indexRef.current) > LOAD_RADIUS) break // user scrubbed away
				if (framesRef.current[i]?.imageUrl) continue
				try {
					const objectUrl = await withVideoLock(async () => {
						await seekVideo(video, framesRef.current[i].timestamp)
						ctx.drawImage(video, 0, 0, plan.width, plan.height)
						const blob = await canvasToBlob(canvas, 'image/jpeg', plan.quality)
						return URL.createObjectURL(blob)
					})
					if (cancelled) {
						URL.revokeObjectURL(objectUrl)
						break
					}
					setFrames((prev) => {
						if (!prev[i] || prev[i].imageUrl) {
							URL.revokeObjectURL(objectUrl)
							return prev
						}
						const next = [...prev]
						next[i] = { ...next[i], imageUrl: objectUrl }
						return next
					})
				} catch {
					/* skip unreadable frame */
				}
			}
		}
		void run()

		return () => {
			cancelled = true
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentIndex, frames.length, withVideoLock])

	// Revoke any remaining object URLs on unmount.
	useEffect(
		() => () => {
			framesRef.current.forEach((frame) => frame.imageUrl && URL.revokeObjectURL(frame.imageUrl))
			if (activeVideoUrlRef.current) URL.revokeObjectURL(activeVideoUrlRef.current)
		},
		[]
	)

	// ── download current frame, full resolution ──────────────────────────────
	const downloadCurrentFrame = useCallback(async () => {
		const video = videoRef.current
		const frame = framesRef.current[indexRef.current]
		if (!video || !frame || !video.videoWidth) return
		try {
			const blob = await withVideoLock(async () => {
				await seekVideo(video, frame.timestamp)
				const full = document.createElement('canvas')
				full.width = video.videoWidth
				full.height = video.videoHeight
				const fctx = full.getContext('2d')
				if (!fctx) throw new Error('Canvas unavailable')
				fctx.drawImage(video, 0, 0, full.width, full.height)
				return canvasToBlob(full, 'image/png')
			})
			const url = URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.download = `frame-${frame.timestamp.toFixed(2)}s.png`
			link.rel = 'noopener'
			link.style.display = 'none'
			document.body.appendChild(link)
			link.click()
			requestAnimationFrame(() => {
				document.body.removeChild(link)
				URL.revokeObjectURL(url)
			})
			if (navigator.vibrate) navigator.vibrate(40)
			setSavedFlash(true)
			window.setTimeout(() => setSavedFlash(false), 900)
		} catch (err) {
			console.error('Download failed', err)
		}
	}, [withVideoLock])

	// ── gestures ──────────────────────────────────────────────────────────────
	const stepBy = (delta: number) =>
		setCurrentIndex((prev) => clamp(prev + delta, 0, Math.max(0, framesRef.current.length - 1)))

	const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (gesture.current.active) return
		gesture.current = {
			active: true,
			pointerId: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			lastX: event.clientX,
			lastY: event.clientY,
			axis: null,
			accum: 0,
			moved: false
		}
		stageRef.current?.setPointerCapture(event.pointerId)
	}

	const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
		const g = gesture.current
		if (!g.active || event.pointerId !== g.pointerId) return
		const dx = event.clientX - g.lastX
		const dy = event.clientY - g.lastY
		g.lastX = event.clientX
		g.lastY = event.clientY

		if (!g.axis) {
			const totalX = event.clientX - g.startX
			const totalY = event.clientY - g.startY
			if (Math.abs(totalX) < AXIS_LOCK_THRESHOLD && Math.abs(totalY) < AXIS_LOCK_THRESHOLD) return
			g.axis = Math.abs(totalY) >= Math.abs(totalX) ? 'vertical' : 'horizontal'
			g.moved = true
			g.accum = 0
		}

		if (g.axis === 'vertical') {
			g.accum += dy // down (positive) → forward
			const step = Math.trunc(g.accum / VERTICAL_PX_PER_FRAME)
			if (step !== 0) {
				stepBy(step)
				g.accum -= step * VERTICAL_PX_PER_FRAME
			}
		} else {
			g.accum += dx // right (positive) → forward
			const step = Math.trunc(g.accum / HORIZONTAL_PX_PER_FRAME)
			if (step !== 0) {
				stepBy(step)
				g.accum -= step * HORIZONTAL_PX_PER_FRAME
			}
		}
	}

	const endGesture = (event: ReactPointerEvent<HTMLDivElement>) => {
		const g = gesture.current
		if (!g.active || event.pointerId !== g.pointerId) return
		g.active = false
		stageRef.current?.releasePointerCapture?.(event.pointerId)

		const tapped =
			!g.moved &&
			Math.abs(event.clientX - g.startX) < TAP_MOVE_TOLERANCE &&
			Math.abs(event.clientY - g.startY) < TAP_MOVE_TOLERANCE
		if (!tapped) return

		tapCountRef.current += 1
		if (tapTimerRef.current) window.clearTimeout(tapTimerRef.current)
		if (tapCountRef.current >= 3) {
			tapCountRef.current = 0
			void downloadCurrentFrame()
		} else {
			tapTimerRef.current = window.setTimeout(() => {
				tapCountRef.current = 0
			}, TRIPLE_TAP_WINDOW_MS)
		}
	}

	// Native wheel listener (non-passive) so desktop trackpad/mouse can scrub too.
	useEffect(() => {
		const stage = stageRef.current
		if (!stage || frames.length === 0) return
		const onWheel = (event: WheelEvent) => {
			event.preventDefault()
			const dominant = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX
			const step = (dominant > 0 ? 1 : -1) * (event.shiftKey ? 10 : 1)
			setCurrentIndex((prev) => clamp(prev + step, 0, Math.max(0, framesRef.current.length - 1)))
		}
		stage.addEventListener('wheel', onWheel, { passive: false })
		return () => stage.removeEventListener('wheel', onWheel)
	}, [frames.length])

	const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key === 'ArrowRight') stepBy(1)
		else if (event.key === 'ArrowLeft') stepBy(-1)
		else if (event.key === 'ArrowDown') stepBy(10)
		else if (event.key === 'ArrowUp') stepBy(-10)
		else if (event.key === 'Escape') reset()
	}

	// ── render ────────────────────────────────────────────────────────────────
	const currentFrame = frames[currentIndex]
	const inViewer = !isProcessing && frames.length > 0

	return (
		<div className="FrameExtractor">
			{/* hidden decode surfaces */}
			<video ref={videoRef} className="fx-hidden" muted playsInline preload="metadata" />
			<canvas ref={canvasRef} className="fx-hidden" />

			{!videoFile && (
				<div className="fx-intro">
					<Link href="/" className="fx-back-link">
						← Tools
					</Link>
					<z-box isColumn gap="3" xStart>
						<span className="eyebrow">
							<span className="line" /> Tool · video
						</span>
						<z-heading size="lg">Frame extractor</z-heading>
						<z-text color="muted" style={{ maxWidth: '46ch' }}>
							Upload a clip and scrub it frame by frame. Drag up/down to move fast, left/right to nudge a
							frame at a time, and triple-tap to download the exact frame at full resolution.
						</z-text>
					</z-box>

					<input
						ref={fileInputRef}
						type="file"
						className="fx-hidden"
						accept={ACCEPTED_VIDEO_TYPES}
						onChange={handleFileInput}
					/>
					<div
						className={isDragOver ? 'fx-drop-zone fx-drop-zone--over' : 'fx-drop-zone'}
						onDragOver={(event) => {
							event.preventDefault()
							setIsDragOver(true)
						}}
						onDragLeave={() => setIsDragOver(false)}
						onDrop={(event) => {
							event.preventDefault()
							setIsDragOver(false)
							loadVideoFile(event.dataTransfer.files?.[0])
						}}
					>
						<z-empty-state
							isBordered
							heading="Drop a video here"
							description="MP4, MOV, M4V, or WEBM — straight from your phone or desktop"
						>
							<span slot="icon">
								<FilmStripIcon size={22} weight="duotone" />
							</span>
							<z-button kind="solid" tone="primary" size="medium" onClick={() => fileInputRef.current?.click()}>
								Choose video
							</z-button>
						</z-empty-state>
					</div>

					{error && (
						<z-alert tone="warning" heading="Couldn’t use that file">
							{error}
						</z-alert>
					)}
				</div>
			)}

			{videoFile && isProcessing && (
				<div className="fx-processing">
					<z-progress isIndeterminate style={{ width: 'min(20rem, 70vw)' }} />
					<z-text size="sm" color="muted">
						Reading the video & measuring its frame rate…
					</z-text>
				</div>
			)}

			{inViewer && (
				// eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
				<div
					ref={stageRef}
					className="fx-stage"
					tabIndex={0}
					onPointerDown={onPointerDown}
					onPointerMove={onPointerMove}
					onPointerUp={endGesture}
					onPointerCancel={endGesture}
					onKeyDown={onKeyDown}
				>
					<z-button
						className="fx-stage-close"
						kind="ghost"
						tone="neutral"
						size="small"
						// Keep the press off the stage's gesture handlers, or pointer
						// capture hijacks it and the click never lands.
						onPointerDown={(event) => event.stopPropagation()}
						onPointerUp={(event) => event.stopPropagation()}
						onClick={reset}
						aria-label="Close"
					>
						<XIcon size={18} weight="bold" />
					</z-button>

					<div className="fx-counter">
						<z-badge tone={savedFlash ? 'success' : 'primary'} kind="soft">
							{savedFlash ? 'Saved ✓' : `${currentIndex + 1} / ${meta?.total ?? frames.length}`}
						</z-badge>
						{currentFrame && !savedFlash && (
							<z-badge tone="neutral" kind="outline">
								{formatSeconds(currentFrame.timestamp)}
							</z-badge>
						)}
					</div>

					{currentFrame?.imageUrl ? (
						<img
							src={currentFrame.imageUrl}
							alt={`Frame ${currentIndex + 1}`}
							className="fx-frame"
							draggable={false}
						/>
					) : (
						<div className="fx-frame-loading">Loading…</div>
					)}

					{showHint && (
						<div className="fx-hint">
							<z-badge tone="neutral" kind="soft">
								↕ scrub fast · ↔ fine scrub · triple-tap to save
							</z-badge>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
