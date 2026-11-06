import { defineElement } from '../shared/define-element'
import { c, css, event, useEffect, useState } from 'atomico'
import {
	Theme,
	ThemePreference,
	ThemeScheme,
	getTheme,
	getThemePreference,
	getThemeScheme,
	setThemePreference,
	startTheme,
	subscribeToTheme,
	toggleTheme
} from '../shared/theme'
import type { ThemePreferenceT, ThemeStateT, ThemeT } from '../shared/theme'
import { oneOf } from '../shared/prop-types'
import { useLocale, type LocaleKeyT } from '../shared/locale'

/*
 * z-theme-switcher — the control that decides whether the page is painted in
 * zest's dark ink or its light haze.
 *
 * Two kinds, one state. `segmented` is the honest one: three explicit choices,
 * including following the OS, laid out as a single joined control. `icon` is
 * the compact one for a crowded header — a single button that flips between
 * light and dark, with no 'system' state to land on.
 *
 * Both read and write the same module-level theme state, so any number of
 * switchers anywhere on the page stay in agreement without being wired to each
 * other. Importing this file starts that state: the stored preference is read
 * and applied immediately, not on first render.
 */

startTheme()

const styles = css`
	:host {
		display: inline-flex;
		user-select: none;
		-webkit-user-select: none;
		--switcher-height: var(--control-height-md);
		--switcher-padding-inline: 0.75rem;
		--switcher-font-size: var(--font-size-2);
		--switcher-icon-size: 0.9375rem;
		--switcher-gap: 0.4375rem;
	}

	:host([is-hidden]) {
		display: none;
	}

	:host([size='sm']) {
		--switcher-height: var(--control-height-sm);
		--switcher-padding-inline: 0.5625rem;
		--switcher-font-size: var(--font-size-1);
		--switcher-icon-size: 0.8125rem;
		--switcher-gap: 0.375rem;
	}

	:host([size='lg']) {
		--switcher-height: var(--control-height-lg);
		--switcher-padding-inline: 1rem;
		--switcher-font-size: var(--font-size-3);
		--switcher-icon-size: 1.125rem;
		--switcher-gap: 0.5rem;
	}

	/* The accent the selected segment and the icon button paint with. Neutral
	   by default so the control reads as chrome rather than as a call to
	   action; the tone attributes below opt into the accents. */
	:host {
		--switcher-accent: var(--foreground);
		--switcher-accent-foreground: var(--primary-foreground);
	}

	:host([tone='primary']) {
		--switcher-accent: var(--purple);
		--switcher-accent-foreground: white;
	}

	:host([tone='secondary']) {
		--switcher-accent: var(--pink);
		--switcher-accent-foreground: white;
	}

	.segmented {
		display: inline-flex;
		align-items: center;
		box-sizing: border-box;
		padding: 3px;
		gap: 2px;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		/* The track is a channel milled into the panel; the selected segment
		   rises out of it. Inert in the flat themes. */
		background: var(--material-surface);
		box-shadow: var(--elevation-carved);
	}

	.segment {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--switcher-gap);
		box-sizing: border-box;
		height: var(--switcher-height);
		padding-inline: var(--switcher-padding-inline);
		border: 1px solid transparent;
		border-radius: calc(var(--radius-lg) - 3px);
		background: transparent;
		color: var(--muted-foreground);
		font-family: inherit;
		font-size: var(--switcher-font-size);
		font-weight: var(--font-weight-medium);
		line-height: 1;
		white-space: nowrap;
		cursor: pointer;
		transition: color var(--duration-fast) var(--easing-standard), background-color var(--duration-fast) var(--easing-standard), border-color var(--duration-fast) var(--easing-standard);
	}

	.segment:hover {
		color: var(--foreground);
	}

	.segment[aria-checked='true'] {
		--emissive-color: var(--switcher-accent);
		background: var(--material-tone), var(--switcher-accent);
		box-shadow: var(--elevation-raised), var(--emissive-tone);
		border-color: var(--switcher-accent);
		color: var(--switcher-accent-foreground);
	}

	.segment:focus-visible {
		outline: 3px solid var(--focus-ring);
		outline-offset: 2px;
	}

	.iconButton {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		width: calc(var(--switcher-height) + 6px);
		height: calc(var(--switcher-height) + 6px);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		/* A single pressable cap, so it is raised rather than carved. */
		background: var(--material-raised), transparent;
		box-shadow: var(--elevation-raised);
		color: var(--muted-foreground);
		cursor: pointer;
		transition:
			color var(--duration-fast) var(--easing-standard),
			border-color var(--duration-fast) var(--easing-standard),
			box-shadow var(--material-press-duration) ease;
	}

	.iconButton:active {
		box-shadow: var(--elevation-pressed);
	}

	.iconButton:hover {
		color: var(--foreground);
		border-color: var(--color-neutral-4);
	}

	.iconButton:focus-visible {
		outline: 3px solid var(--focus-ring);
		outline-offset: 2px;
	}

	/* The two glyphs are stacked in the same cell and cross-faded, so the
	   button never changes size and the swap reads as one object turning
	   rather than two icons replacing each other. */
	.glyphStack {
		display: grid;
		place-items: center;
		width: var(--switcher-icon-size);
		height: var(--switcher-icon-size);
	}

	.glyph {
		grid-area: 1 / 1;
		display: inline-flex;
		transition: opacity var(--duration-move) var(--easing-standard), transform var(--duration-move) var(--easing-standard);
	}

	.glyph.is-hidden {
		opacity: 0;
		transform: scale(0.7) rotate(-40deg);
	}

	.glyph.is-shown {
		opacity: 1;
		transform: none;
	}

	svg {
		display: block;
		width: var(--switcher-icon-size);
		height: var(--switcher-icon-size);
		stroke: currentColor;
		stroke-width: 1.6;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;
	}
`

const SunIcon = () => (
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<circle cx="12" cy="12" r="4" />
		<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
	</svg>
)

const MoonIcon = () => (
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
	</svg>
)

const MonitorIcon = () => (
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<rect x="2.5" y="4" width="19" height="13" rx="2" />
		<path d="M9 20.5h6M12 17v3.5" />
	</svg>
)

// Console: a rack unit, faceplate and rails.
// Studio: a knob with its pointer and travel arc.
type SegmentT = {
	preference: ThemePreferenceT
	labelKey: LocaleKeyT
	icon: () => unknown
}

// The full catalogue. A switcher renders whichever subset its `themes`
// property names, in the order it names them, so a product can offer two
// themes or all three without the component knowing anything about the choice.
const SEGMENTS_BY_PREFERENCE: Record<string, SegmentT> = {
	[ThemePreference.light]: { preference: ThemePreference.light, labelKey: 'themeLight', icon: SunIcon },
	[ThemePreference.dark]: { preference: ThemePreference.dark, labelKey: 'themeDark', icon: MoonIcon },
	[ThemePreference.system]: { preference: ThemePreference.system, labelKey: 'themeSystem', icon: MonitorIcon }
}

const DEFAULT_PREFERENCES: ThemePreferenceT[] = [ThemePreference.light, ThemePreference.dark, ThemePreference.system]

// Takes unknown[] rather than ThemePreferenceT[] because the value can arrive
// from an HTML attribute as parsed JSON, where nothing has been validated. The
// lookup below is the validation: a name that isn't in the catalogue is simply
// not rendered.
const resolveSegments = (requested: unknown[] | undefined): SegmentT[] => {
	const hasRequest = Array.isArray(requested) && requested.length > 0
	const names: unknown[] = hasRequest ? requested : DEFAULT_PREFERENCES

	const segments: SegmentT[] = []
	for (const name of names) {
		const segment = SEGMENTS_BY_PREFERENCE[String(name)]
		if (segment) segments.push(segment)
	}

	// An unrecognised list would otherwise render an empty control, which
	// looks like a bug rather than like a configuration mistake.
	const isEmpty = segments.length === 0
	if (isEmpty) return DEFAULT_PREFERENCES.map((name) => SEGMENTS_BY_PREFERENCE[name])
	return segments
}

const getIconButtonLabel = (theme: ThemeT, t: (key: LocaleKeyT) => string): string => {
	const isDark = getThemeScheme(theme) === ThemeScheme.dark
	if (isDark) return t('switchToLight')
	return t('switchToDark')
}

export const ZThemeSwitcher = c(
	(props) => {
		const t = useLocale()
		const [preference, setPreference] = useState<ThemePreferenceT>(getThemePreference)
		const [theme, setTheme] = useState<ThemeT>(getTheme)

		// One subscription per element. It covers both the case where another
		// switcher on the page changed the preference and the case where the OS
		// flipped underneath a 'system' preference.
		useEffect(() => {
			const unsubscribe = subscribeToTheme((state: ThemeStateT) => {
				setPreference(state.preference)
				setTheme(state.theme)
			})

			setPreference(getThemePreference())
			setTheme(getTheme())

			return unsubscribe
		}, [])

		const isIconKind = props.kind === 'icon'
		const shouldShowLabels = !props.isIconOnly

		const handleSegmentClick = (nextPreference: ThemePreferenceT): void => {
			setThemePreference(nextPreference)
			props.change({ preference: nextPreference, theme: getTheme() })
		}

		const handleIconClick = (): void => {
			toggleTheme()
			props.change({ preference: getThemePreference(), theme: getTheme() })
		}

		if (isIconKind) {
			const isDark = theme === Theme.dark
			const buttonLabel = getIconButtonLabel(theme, t)
			const sunClass = isDark ? 'glyph is-hidden' : 'glyph is-shown'
			const moonClass = isDark ? 'glyph is-shown' : 'glyph is-hidden'

			return (
				<host shadowDom>
					<button class="iconButton" type="button" aria-label={buttonLabel} title={buttonLabel} onclick={handleIconClick}>
						<span class="glyphStack">
							<span class={sunClass}>
								<SunIcon />
							</span>
							<span class={moonClass}>
								<MoonIcon />
							</span>
						</span>
					</button>
				</host>
			)
		}

		const segments = resolveSegments(props.themes).map((segment) => {
			const isSelected = segment.preference === preference
			const SegmentIcon = segment.icon
			const segmentLabel = t(segment.labelKey)

			return (
				<button
					class="segment"
					type="button"
					role="radio"
					aria-checked={isSelected}
					aria-label={segmentLabel}
					title={segmentLabel}
					onclick={() => handleSegmentClick(segment.preference)}
				>
					<SegmentIcon />
					{shouldShowLabels ? <span>{segmentLabel}</span> : null}
				</button>
			)
		})

		return (
			<host shadowDom>
				<div class="segmented" role="radiogroup" aria-label={t('colorTheme')}>
					{segments}
				</div>
			</host>
		)
	},
	{
		props: {
			kind: { type: oneOf('segmented', 'icon'), reflect: true },
			tone: { type: oneOf('primary', 'secondary'), reflect: true },
			themes: { type: Array },
			isIconOnly: { type: Boolean, reflect: true },
			size: { type: oneOf('sm', 'md', 'lg'), reflect: true },
			isHidden: { type: Boolean, reflect: true },
			change: event<{ preference: ThemePreferenceT; theme: ThemeT }>({ bubbles: true, composed: true })
		},
		styles
	}
)

defineElement('z-theme-switcher', ZThemeSwitcher)
