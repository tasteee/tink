import { useEffect, useRef, useState } from 'atomico'

/*
 * Shared open/close choreography for the text-editor floating family: entrance
 * fades in + rises 4px over 120ms ease-out, exit fades in place over 80ms
 * before the surface is considered fully closed. Every floating element in
 * this family is a persistent singleton (same shape as z-toast) rather than a
 * conditionally-mounted node, so the CSS transition just needs three phases —
 * see shared/editor-overlay-styles.ts for the matching .surface/.is-open/.is-closing rules.
 */
export type VisibilityPhaseT = 'closed' | 'open' | 'closing'

export const useVisibilityPhase = (isOpen: boolean, closeDurationMs = 80): VisibilityPhaseT => {
	const [phase, setPhase] = useState<VisibilityPhaseT>(isOpen ? 'open' : 'closed')
	const timerRef = useRef<ReturnType<typeof setTimeout>>()

	useEffect(() => {
		clearTimeout(timerRef.current)

		if (isOpen) {
			setPhase('open')
			return
		}

		if (phase === 'closed') return
		setPhase('closing')
		timerRef.current = setTimeout(() => setPhase('closed'), closeDurationMs)
		return () => clearTimeout(timerRef.current)
	}, [isOpen])

	return phase
}
