import { defineElement } from '../shared/define-element'
import { c, css } from 'atomico'
import { oneOf } from '../shared/prop-types'
import { baseStyles, insetProps, insetVars, resolveRadius } from '../shared/layout-schema'

/*
 * z-surface, a themed container panel. `level` is the everyday path: a neutral
 * elevation stepped from the theme ramp (0 = page base … 3 = overlay). For
 * accented surfaces, `tone` picks the colour family and `kind` the treatment
 * (filled / soft / outline / ghost / plain) layered on top of it. `radius` and
 * `inset` are tokenized; `is-bordered`, `is-elevated` and `is-interactive` are
 * explicit toggles. Tone drives a single `--tone` custom property that the
 * kinds compose against (same pattern as z-badge).
 */
const styles = css`
	:host {
		display: block;
		--tone: var(--color-neutral-6);
		background: transparent;
		color: var(--foreground);
		border: 1px solid transparent;
		border-radius: var(--z-surface-radius, var(--radius-lg));
		padding-top: var(--z-surface-pad-top, var(--space-md));
		padding-bottom: var(--z-surface-pad-bottom, var(--space-md));
		padding-inline-start: var(--z-surface-pad-left, var(--space-md));
		padding-inline-end: var(--z-surface-pad-right, var(--space-md));
	}

	:host([is-full-width]) {
		width: 100%;
	}

	/* tones set --tone */
	:host([tone='plain']) {
		--tone: var(--foreground);
	}
	:host([tone='neutral']) {
		--tone: var(--color-neutral-6);
	}
	:host([tone='primary']) {
		--tone: var(--purple);
	}
	:host([tone='secondary']) {
		--tone: var(--pink);
	}
	:host([tone='success']) {
		--tone: var(--success);
	}
	:host([tone='warning']) {
		--tone: var(--warning);
	}
	:host([tone='danger']) {
		--tone: var(--destructive);
	}

	/* kinds compose the tone */
	:host([kind='plain']) {
		background: var(--background-light);
	}
	:host([kind='filled']) {
		background: var(--tone);
		color: var(--primary-foreground);
	}
	/* purple/pink fills are light; dark text reads better on them */
	:host([kind='filled'][tone='primary']),
	:host([kind='filled'][tone='secondary']) {
		color: var(--color-neutral-8);
	}
	/* Tone tints are mixed with transparent, NOT the background: the neutral
	   background carries a faint green hue, and interpolating hue against it in
	   oklch drags the result around the colour wheel (purple → olive). Mixing
	   with transparent keeps the tone's hue and just lowers its alpha, the same
	   approach z-badge uses. */
	:host([kind='soft']) {
		background: color-mix(in oklch, var(--tone) 16%, transparent);
	}
	:host([kind='outline']) {
		background: transparent;
		border-color: color-mix(in srgb, var(--tone) 45%, var(--border));
	}
	:host([kind='ghost']) {
		background: transparent;
		border-color: transparent;
	}

	/* Neutral elevation levels, stepped straight from the theme's neutral ramp
	   (level 0 = page base … 3 = overlay). The everyday way to reach for a
	   surface, layering UI without touching tone/kind. Each gets a hairline
	   so it reads on its own. */
	:host([level]) {
		border-color: var(--border);
	}
	:host([level='0']) {
		background: var(--color-neutral-0);
	}
	:host([level='1']) {
		background: var(--color-neutral-1);
	}
	:host([level='2']) {
		background: var(--color-neutral-2);
	}
	:host([level='3']) {
		background: var(--color-neutral-3);
	}

	/* explicit toggles */
	:host([is-bordered]) {
		border-color: color-mix(in srgb, var(--tone) 45%, var(--border));
	}
	/* Shadowless elevation: this system uses borders over shadows, so "raised"
	   reads as a lighter surface lifted off the page plus a hairline ring. */
	:host([is-elevated]) {
		background: var(--color-neutral-2);
		border-color: color-mix(in srgb, var(--tone) 30%, var(--border));
	}
	:host([is-interactive]) {
		cursor: pointer;
		transition: border-color var(--motion-fast) var(--ease-enter);
	}
	:host([is-interactive]:hover),
	:host([is-interactive]:focus-within) {
		border-color: color-mix(in oklch, var(--foreground) 40%, transparent);
	}
`

const getHostStyle = (props: { radius?: string } & Parameters<typeof insetVars>[0]): Record<string, string> => {
	const style: Record<string, string> = { ...insetVars(props, '--z-surface') }
	const radius = resolveRadius(props.radius)
	if (radius) style['--z-surface-radius'] = radius
	return style
}

export const ZSurface = c(
	(props) => (
		<host shadowDom style={getHostStyle(props)}>
			<slot />
		</host>
	),
	{
		props: {
			level: { type: String, reflect: true },
			tone: { type: String, reflect: true },
			kind: { type: oneOf('filled', 'soft', 'outline', 'ghost', 'plain'), reflect: true },
			radius: String,
			isBordered: { type: Boolean, reflect: true },
			isElevated: { type: Boolean, reflect: true },
			isInteractive: { type: Boolean, reflect: true },
			isFullWidth: { type: Boolean, reflect: true },
			...insetProps
		},
		styles: [baseStyles, styles]
	}
)

defineElement('z-surface', ZSurface)
