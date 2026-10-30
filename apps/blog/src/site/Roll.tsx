import './roll.css'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'wouter'

// The docs' X link lands here (/docs/x). Self-hosted so it starts instantly: no YouTube
// embed, no ads. A blurred, muted copy of the video behind the player paints
// the ambient glow and is kept in step with the real one.

const SRC = `${import.meta.env.BASE_URL}roll.mp4`
const POSTER = `${import.meta.env.BASE_URL}roll.jpg`

// Browsers allow sound only when play() runs inside the user's click. The X
// link calls primeRoll() in its click handler; the page then adopts that
// already-playing element instead of starting a fresh one.
let primed: HTMLVideoElement | null = null

const createVideo = () => {
	const video = document.createElement('video')
	video.src = SRC
	video.poster = POSTER
	video.playsInline = true
	video.preload = 'auto'
	return video
}

export const primeRoll = () => {
	primed = createVideo()
	primed.play().catch(() => {})
}

const BackIcon = () => (
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<path d="M19 12H5" />
		<path d="m11 18-6-6 6-6" />
	</svg>
)

const SoundIcon = () => (
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<path d="M11 5 6 9H3v6h3l5 4V5Z" />
		<path d="M15.5 8.5a5 5 0 0 1 0 7" />
		<path d="M18.5 5.5a9 9 0 0 1 0 13" />
	</svg>
)

// Mirror play/pause/seek from the player onto the ambient copy.
const useAmbientSync = (main: React.RefObject<HTMLVideoElement | null>, ambient: React.RefObject<HTMLVideoElement | null>) => {
	useEffect(() => {
		const video = main.current
		const glow = ambient.current
		if (!video || !glow) return
		const sync = () => {
			if (Math.abs(glow.currentTime - video.currentTime) > 0.25) glow.currentTime = video.currentTime
			if (video.paused) glow.pause()
			else glow.play().catch(() => {})
		}
		const events = ['play', 'pause', 'seeked', 'timeupdate']
		events.forEach((name) => video.addEventListener(name, sync))
		return () => events.forEach((name) => video.removeEventListener(name, sync))
	}, [main, ambient])
}

export const Roll = () => {
	const [, navigate] = useLocation()
	const frameRef = useRef<HTMLDivElement>(null)
	const videoRef = useRef<HTMLVideoElement | null>(null)
	const ambientRef = useRef<HTMLVideoElement>(null)
	const [isReady, setIsReady] = useState(false)
	const [isMuted, setIsMuted] = useState(false)
	useAmbientSync(videoRef, ambientRef)

	// Back to wherever they came from, or the docs when opened cold.
	const goBack = () => {
		if (window.history.length > 1) window.history.back()
		else navigate('/docs')
	}

	// Adopt the primed element (or make one on a cold load) and mount it in the
	// frame. Layout effect, so the ambient sync below sees it.
	useLayoutEffect(() => {
		// videoRef survives StrictMode's dev remount, so the element is reused there
		const video = videoRef.current ?? primed ?? createVideo()
		primed = null
		video.className = 'RollVideo'
		video.controls = true
		videoRef.current = video
		frameRef.current?.prepend(video)
		const onReady = () => setIsReady(true)
		if (video.readyState >= 2) onReady()
		else video.addEventListener('loadeddata', onReady, { once: true })
		return () => {
			video.removeEventListener('loadeddata', onReady)
			video.pause()
			video.remove()
		}
	}, [])

	// Primed and playing: nothing to do. Otherwise try with sound; if the browser
	// refuses (a cold load with no click), play muted and offer sound.
	useEffect(() => {
		const video = videoRef.current
		if (!video || !video.paused) return
		video.play().catch(() => {
			video.muted = true
			setIsMuted(true)
			video.play().catch(() => {})
		})
	}, [])

	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') goBack()
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	})

	const unmute = () => {
		const video = videoRef.current
		if (!video) return
		video.muted = false
		setIsMuted(false)
		video.play().catch(() => {})
	}

	return (
		<div className={isReady ? 'Roll is-ready' : 'Roll'}>
			<video ref={ambientRef} className="RollAmbient" src={SRC} muted playsInline preload="auto" aria-hidden="true" tabIndex={-1} />
			<div className="RollVignette" />

			<header className="RollTop">
				<button type="button" className="RollBack" onClick={goBack} aria-label="Go back">
					<BackIcon />
					<span>Back</span>
				</button>
				<span className="RollHint">
					<kbd>esc</kbd>
				</span>
			</header>

			<figure className="RollStage">
				<div ref={frameRef} className="RollFrame">
					{isMuted && (
						<button type="button" className="RollUnmute" onClick={unmute}>
							<SoundIcon />
							<span>Tap for sound</span>
						</button>
					)}
				</div>
				<figcaption className="RollCaption">You know the rules.</figcaption>
			</figure>
		</div>
	)
}
