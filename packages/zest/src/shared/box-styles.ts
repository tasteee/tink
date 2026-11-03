import { css } from 'atomico'

/**
 * Shared flex layout rules, used by <z-box> (and, via the box props +
 * this stylesheet, its thin z-row/z-column wrappers). `aligns-x`/`aligns-y`
 * are resolved in JS (see box-schema.ts's getBoxHostStyle) into the
 * --z-box-justify/--z-box-align custom properties consumed below.
 */
export const boxLayoutStyles = css`
	:host {
		/* Longhands only. box-schema.ts resolves every edge from the most
		   specific prop, so a shorthand declaration here would only be
		   overridden by whichever of these four sits below it. */
		margin-top: var(--z-box-margin-top);
		margin-inline-end: var(--z-box-margin-right);
		margin-bottom: var(--z-box-margin-bottom);
		margin-inline-start: var(--z-box-margin-left);
		padding-top: var(--z-box-padding-top);
		padding-inline-end: var(--z-box-padding-right);
		padding-bottom: var(--z-box-padding-bottom);
		padding-inline-start: var(--z-box-padding-left);
		gap: var(--z-box-gap);
		row-gap: var(--z-box-row-gap, var(--z-box-gap));
		column-gap: var(--z-box-column-gap, var(--z-box-gap));
		width: var(--z-box-width);
		min-width: var(--z-box-min-width, 0);
		max-width: var(--z-box-max-width);
		height: var(--z-box-height);
		min-height: var(--z-box-min-height);
		max-height: var(--z-box-max-height);
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		justify-content: var(--z-box-justify, flex-start);
		align-items: var(--z-box-align, stretch);
	}

	/* is-inline composes with either display: inline-flex or inline-grid. */
	:host([is-inline]) {
		display: inline-flex;
	}

	:host([display='grid']) {
		display: grid;
		grid-template-columns: var(--z-box-grid-template-columns);
		grid-template-rows: var(--z-box-grid-template-rows);
	}

	:host([display='grid'][is-inline]) {
		display: inline-grid;
	}

	@media (min-width: 40rem) {
		:host([display='grid']) {
			grid-template-columns: var(--z-box-small-grid-template-columns, var(--z-box-grid-template-columns));
		}
	}

	@media (min-width: 48rem) {
		:host([display='grid']) {
			grid-template-columns: var(
				--z-box-medium-grid-template-columns,
				var(--z-box-small-grid-template-columns, var(--z-box-grid-template-columns))
			);
		}
	}

	@media (min-width: 64rem) {
		:host([display='grid']) {
			grid-template-columns: var(
				--z-box-large-grid-template-columns,
				var(--z-box-medium-grid-template-columns, var(--z-box-small-grid-template-columns, var(--z-box-grid-template-columns)))
			);
		}
	}

	@media (min-width: 80rem) {
		:host([display='grid']) {
			grid-template-columns: var(
				--z-box-extra-large-grid-template-columns,
				var(
					--z-box-large-grid-template-columns,
					var(--z-box-medium-grid-template-columns, var(--z-box-small-grid-template-columns, var(--z-box-grid-template-columns)))
				)
			);
		}
	}

	:host([direction='horizontal']) {
		flex-direction: row;
	}

	:host([direction='vertical']) {
		flex-direction: column;
	}

	:host([does-wrap]) {
		flex-wrap: wrap;
	}

	:host([does-wrap-text]) {
		white-space: normal;
	}

	:host([is-full-width]) {
		width: 100%;
	}

	:host([is-full-height]) {
		height: 100%;
	}
`
