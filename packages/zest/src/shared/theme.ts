// The theme layer behind <z-theme-switcher>.
//
// Two ideas are kept deliberately separate here, because conflating them is
// what makes most theme switchers feel broken:
//
//   preference — what the reader asked for: 'light', 'dark', or 'system'.
//                This is what persists and what the switcher's UI reflects.
//   theme      — what is actually painted right now: 'light' or 'dark'.
//                Under the 'system' preference this tracks the OS and can
//                change without anyone touching the switcher.
//
// Applying a theme means writing data-theme onto <html>, which is what every
// token block in ink.css keys off. Custom properties cross shadow boundaries,
// so that single attribute re-themes every z-* element on the page.

export const Theme = {
	dark: 'dark',
	light: 'light'
} as const

export type ThemeT = (typeof Theme)[keyof typeof Theme]

export const ThemePreference = {
	...Theme,
	system: 'system'
} as const

export type ThemePreferenceT = (typeof ThemePreference)[keyof typeof ThemePreference]

// Which of the two canonical themes a theme belongs with. It decides what
// 'system' resolves to, and which way toggleTheme flips from here.
export const ThemeScheme = {
	dark: 'dark',
	light: 'light'
} as const

export type ThemeSchemeT = (typeof ThemeScheme)[keyof typeof ThemeScheme]

const THEME_SCHEMES: Record<ThemeT, ThemeSchemeT> = {
	dark: ThemeScheme.dark,
	light: ThemeScheme.light
}

export const getThemeScheme = (theme: ThemeT): ThemeSchemeT => {
	return THEME_SCHEMES[theme]
}

export const getAllThemes = (): ThemeT[] => {
	return Object.values(Theme)
}

export type ThemeStateT = {
	preference: ThemePreferenceT
	theme: ThemeT
}

export type ThemeListenerT = (state: ThemeStateT) => void

const STORAGE_KEY = 'zest-theme-preference'
const THEME_ATTRIBUTE = 'data-theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

const listeners = new Set<ThemeListenerT>()

// Dark is zest's home look. A page only follows the OS when the reader (or
// the app) asks for 'system'.
let currentPreference: ThemePreferenceT = ThemePreference.dark

const checkIsBrowser = (): boolean => {
	return typeof document !== 'undefined'
}

const ALL_PREFERENCES: string[] = Object.values(ThemePreference)

const checkIsThemePreference = (candidate: string | null): candidate is ThemePreferenceT => {
	if (candidate === null) return false
	return ALL_PREFERENCES.includes(candidate)
}

// Storage is allowed to fail — Safari in private mode throws on read, and an
// embedded page can have storage blocked outright. A theme switcher losing
// its memory is a much smaller problem than one that throws on boot, so both
// accessors degrade to "no stored preference" instead.
const readStoredPreference = (): ThemePreferenceT | null => {
	if (!checkIsBrowser()) return null

	try {
		const stored = window.localStorage.getItem(STORAGE_KEY)
		if (!checkIsThemePreference(stored)) return null
		return stored
	} catch {
		return null
	}
}

const writeStoredPreference = (preference: ThemePreferenceT): void => {
	if (!checkIsBrowser()) return

	try {
		window.localStorage.setItem(STORAGE_KEY, preference)
	} catch {
		return
	}
}

const getDarkQuery = (): MediaQueryList | null => {
	const hasMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
	if (!hasMatchMedia) return null
	return window.matchMedia(DARK_QUERY)
}

export const getSystemTheme = (): ThemeT => {
	const darkQuery = getDarkQuery()
	if (!darkQuery) return Theme.dark
	return darkQuery.matches ? Theme.dark : Theme.light
}

// Every preference except 'system' names a theme outright. 'system' is the one
// that has to be resolved, and it only ever resolves to one of the two
// canonical themes — the OS tells us light or dark, not which flavour of light.
export const resolveTheme = (preference: ThemePreferenceT): ThemeT => {
	const isFollowingSystem = preference === ThemePreference.system
	if (isFollowingSystem) return getSystemTheme()
	return preference
}

export const getThemePreference = (): ThemePreferenceT => {
	return currentPreference
}

export const getTheme = (): ThemeT => {
	return resolveTheme(currentPreference)
}

const buildThemeState = (): ThemeStateT => {
	return { preference: currentPreference, theme: resolveTheme(currentPreference) }
}

const applyThemeAttribute = (): void => {
	if (!checkIsBrowser()) return
	document.documentElement.setAttribute(THEME_ATTRIBUTE, resolveTheme(currentPreference))
}

const ALL_THEMES: string[] = Object.values(Theme)

const checkIsTheme = (candidate: string | null): candidate is ThemeT => {
	if (candidate === null) return false
	return ALL_THEMES.includes(candidate)
}

// A theme the page itself declared, by writing data-theme onto <html> in the
// markup or from an inline head script.
const readAuthoredTheme = (): ThemeT | null => {
	if (!checkIsBrowser()) return null

	const authored = document.documentElement.getAttribute(THEME_ATTRIBUTE)
	if (!checkIsTheme(authored)) return null
	return authored
}

const notifyListeners = (): void => {
	const state = buildThemeState()
	for (const listener of listeners) listener(state)
}

// --- Transitioning between themes ---------------------------------------
//
// A theme swap changes hundreds of values at once, most of which cannot be
// transitioned in CSS: custom properties don't interpolate unless registered,
// and the material themes swap gradients and translucent surfaces, none of
// which can animate from their flat equivalents at all.
//
// So the change is sequenced rather than blended. The page fades out, the
// attribute swaps while nothing is visible, and the page fades back in. Out is
// slow and in is quick — the two durations are separate tokens, and the swap
// lands the moment the fade out completes.
//
// This used to go through the View Transition API, which is the obvious tool
// and the wrong one. Its default root animation cross-fades the two snapshots
// under mix-blend-mode: plus-lighter — the frames are added rather than
// interpolated, so halfway through a dark-to-light swap the sum blows past
// white and the whole screen flashes. Sequencing has no overlap, so there is
// no blend to get wrong.
//
// ink.css handles the one thing that must not fade: the page colour itself
// transitions on its own underneath, so the gap is never empty.
//
// The fade is not gated on prefers-reduced-motion. That preference is about
// movement, and WCAG's definition of motion animation explicitly excludes
// opacity and colour changes; the alternative here is a full-screen luminance
// snap, which is the harsher experience. A zero fade-out token opts out.

const FADING_CLASS = 'isThemeFading'
const FADE_OUT_PROPERTY = '--theme-fade-out-duration'
const FALLBACK_FADE_OUT_MS = 500

const parseDurationMs = (rawDuration: string): number | null => {
	const trimmed = rawDuration.trim()

	const isMilliseconds = trimmed.endsWith('ms')
	if (isMilliseconds) {
		const milliseconds = Number.parseFloat(trimmed)
		return Number.isFinite(milliseconds) ? milliseconds : null
	}

	const isSeconds = trimmed.endsWith('s')
	if (!isSeconds) return null

	const seconds = Number.parseFloat(trimmed)
	if (!Number.isFinite(seconds)) return null
	return seconds * 1000
}

// The token is the single source of truth for how long the fade out takes.
// The fade itself is CSS; this only decides when to flip the attribute, so it
// has to read the same value rather than keep a copy that could drift the
// moment anyone retimes the token.
const getThemeFadeOutMs = (): number => {
	if (!checkIsBrowser()) return FALLBACK_FADE_OUT_MS

	const declared = getComputedStyle(document.documentElement).getPropertyValue(FADE_OUT_PROPERTY)
	const parsed = parseDurationMs(declared)
	if (parsed === null) return FALLBACK_FADE_OUT_MS
	return parsed
}

let fadeTimeoutId = 0

const runThemeFade = (commit: () => void): void => {
	const root = document.documentElement

	// The swap lands when the fade out completes — the page is at zero and
	// nobody can see it happen. Removing the class is what starts the fade in.
	const fadeOutMs = getThemeFadeOutMs()

	// A second change mid-fade abandons the first rather than queueing behind
	// it — the reader's latest choice is the one worth animating to.
	window.clearTimeout(fadeTimeoutId)

	root.classList.add(FADING_CLASS)

	fadeTimeoutId = window.setTimeout(() => {
		commit()
		root.classList.remove(FADING_CLASS)
	}, fadeOutMs)
}

const commitThemeChange = (): void => {
	if (checkIsBrowser()) {
		window.clearTimeout(fadeTimeoutId)
		document.documentElement.classList.remove(FADING_CLASS)
	}
	applyThemeAttribute()
	notifyListeners()
}

const runThemeChange = (): void => {
	if (!checkIsBrowser()) {
		commitThemeChange()
		return
	}

	// A zero fade-out token is the opt-out: apply the theme immediately.
	if (getThemeFadeOutMs() <= 0) {
		commitThemeChange()
		return
	}

	runThemeFade(commitThemeChange)
}

export const setThemePreference = (preference: ThemePreferenceT): void => {
	if (!checkIsThemePreference(preference)) return
	const previousTheme = resolveTheme(currentPreference)

	currentPreference = preference
	writeStoredPreference(preference)

	// Choosing 'system' while the system already agrees changes the preference
	// but not a single pixel, so animating it would be a flash for nothing.
	const isSameTheme = resolveTheme(preference) === previousTheme
	if (isSameTheme) {
		commitThemeChange()
		return
	}

	runThemeChange()
}

// Convenience for the icon switcher, which has no 'system' state to offer.
// Flipping from 'system' commits to the opposite of whatever the system is
// currently showing, which is the only reading of "toggle" that isn't a no-op.

export const toggleTheme = (): void => {
	const isCurrentlyDark = getThemeScheme(getTheme()) === ThemeScheme.dark
	setThemePreference(isCurrentlyDark ? ThemePreference.light : ThemePreference.dark)
}

export const subscribeToTheme = (listener: ThemeListenerT): (() => void) => {
	listeners.add(listener)
	return () => {
		listeners.delete(listener)
	}
}

// Under the 'system' preference the painted theme can change with no user
// action at all, so the OS query stays subscribed for the life of the page and
// re-applies whenever it flips.
const watchSystemTheme = (): void => {
	const darkQuery = getDarkQuery()
	if (!darkQuery) return

	darkQuery.addEventListener('change', () => {
		const isFollowingSystem = currentPreference === ThemePreference.system
		if (!isFollowingSystem) return

		runThemeChange()
	})
}

// Runs once when this module is first imported, which happens as a side effect
// of importing z-theme-switcher. Reading and applying the stored preference
// here rather than on the element's first render means the page doesn't flash
// the default theme before the switcher mounts.
//
// It still can't beat first paint — nothing loaded as a module can. Pages that
// care should inline the snippet documented on the z-theme-switcher page,
// which sets the attribute in <head> before any stylesheet resolves.
export const initTheme = (): ThemeStateT => {
	if (!checkIsBrowser()) return buildThemeState()

	// A stored preference is the reader's own past choice, so it outranks
	// everything. Failing that, a data-theme already on <html> was put there
	// deliberately — by the markup, or by the inline head script that beats the
	// flash — and adopting it is the only way that declaration survives this
	// module loading. Only then do we fall back to the dark default.
	const storedPreference = readStoredPreference()
	if (storedPreference) {
		currentPreference = storedPreference
		applyThemeAttribute()
		return buildThemeState()
	}

	const authoredTheme = readAuthoredTheme()
	if (authoredTheme) currentPreference = authoredTheme

	applyThemeAttribute()
	return buildThemeState()
}

let hasStarted = false

export const startTheme = (): void => {
	if (hasStarted || !checkIsBrowser()) return
	hasStarted = true

	initTheme()
	watchSystemTheme()
}
