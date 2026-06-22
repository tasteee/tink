import { css } from 'atomico'

/**
 * Shared flex/grid layout rules, used by both <z-box> and <z-card>.
 * Direct attribute-selector translation of the React design system's
 * z-box.css (.isFlex -> [is-flex], .xCenter -> [x-center], etc).
 */
export const boxLayoutStyles = css`
	:host {
		margin: var(--z-box-margin);
		margin-top: var(--z-box-margin-top);
		margin-right: var(--z-box-margin-right);
		margin-bottom: var(--z-box-margin-bottom);
		margin-left: var(--z-box-margin-left);
		padding: var(--z-box-padding);
		padding-top: var(--z-box-padding-top);
		padding-right: var(--z-box-padding-right);
		padding-bottom: var(--z-box-padding-bottom);
		padding-left: var(--z-box-padding-left);
		gap: var(--z-box-gap);
		row-gap: var(--z-box-row-gap, var(--z-box-gap));
		column-gap: var(--z-box-column-gap, var(--z-box-gap));
		grid-template-columns: var(--z-box-grid-template-columns);
		grid-template-rows: var(--z-box-grid-template-rows);
		width: var(--z-box-width);
		min-width: var(--z-box-min-width, 0);
		max-width: var(--z-box-max-width);
		height: var(--z-box-height);
		min-height: var(--z-box-min-height);
		max-height: var(--z-box-max-height);
		display: flex;
	}

	:host([is-flex]) {
		display: flex;
		flex-direction: row;
		align-items: stretch;
		justify-content: flex-start;
		flex-wrap: nowrap;
	}

	:host([is-inline-flex]) {
		display: inline-flex;
		flex-direction: row;
		align-items: stretch;
		justify-content: flex-start;
		flex-wrap: nowrap;
	}

	:host([is-grid]) {
		display: grid;
	}

	:host([is-inline-grid]) {
		display: inline-grid;
	}

	@media (min-width: 40rem) {
		:host {
			grid-template-columns: var(--z-box-small-grid-template-columns, var(--z-box-grid-template-columns));
		}
	}

	@media (min-width: 48rem) {
		:host {
			grid-template-columns: var(
				--z-box-medium-grid-template-columns,
				var(--z-box-small-grid-template-columns, var(--z-box-grid-template-columns))
			);
		}
	}

	@media (min-width: 64rem) {
		:host {
			grid-template-columns: var(
				--z-box-large-grid-template-columns,
				var(--z-box-medium-grid-template-columns, var(--z-box-small-grid-template-columns, var(--z-box-grid-template-columns)))
			);
		}
	}

	@media (min-width: 80rem) {
		:host {
			grid-template-columns: var(
				--z-box-extra-large-grid-template-columns,
				var(
					--z-box-large-grid-template-columns,
					var(--z-box-medium-grid-template-columns, var(--z-box-small-grid-template-columns, var(--z-box-grid-template-columns)))
				)
			);
		}
	}

	:host([is-block]) {
		display: block;
	}

	:host([is-inline-block]) {
		display: inline-block;
	}

	:host([is-inline]:not([is-flex]):not([is-inline-flex])) {
		display: inline;
	}

	:host([is-flex][is-inline]),
	:host([is-inline-flex][is-inline]) {
		display: inline-flex;
	}

	:host([is-row]) {
		flex-direction: row;
	}

	:host([is-column]) {
		flex-direction: column;
	}

	:host([does-wrap]) {
		flex-wrap: wrap;
	}

	:host([does-wrap-text]) {
		white-space: normal;
	}

	:host([is-row][x-start]),
	:host([is-flex]:not([is-column])[x-start]),
	:host([is-inline-flex]:not([is-column])[x-start]) {
		justify-content: flex-start;
	}

	:host([is-row][x-center]),
	:host([is-flex]:not([is-column])[x-center]),
	:host([is-inline-flex]:not([is-column])[x-center]) {
		justify-content: center;
	}

	:host([is-row][x-end]),
	:host([is-flex]:not([is-column])[x-end]),
	:host([is-inline-flex]:not([is-column])[x-end]) {
		justify-content: flex-end;
	}

	:host([is-row][x-between]),
	:host([is-flex]:not([is-column])[x-between]),
	:host([is-inline-flex]:not([is-column])[x-between]) {
		justify-content: space-between;
	}

	:host([is-row][x-around]),
	:host([is-flex]:not([is-column])[x-around]),
	:host([is-inline-flex]:not([is-column])[x-around]) {
		justify-content: space-around;
	}

	:host([is-row][x-evenly]),
	:host([is-flex]:not([is-column])[x-evenly]),
	:host([is-inline-flex]:not([is-column])[x-evenly]) {
		justify-content: space-evenly;
	}

	:host([is-row][x-stretch]),
	:host([is-flex]:not([is-column])[x-stretch]),
	:host([is-inline-flex]:not([is-column])[x-stretch]) {
		justify-content: stretch;
	}

	:host([is-row][y-start]),
	:host([is-flex]:not([is-column])[y-start]),
	:host([is-inline-flex]:not([is-column])[y-start]) {
		align-items: flex-start;
	}

	:host([is-row][y-center]),
	:host([is-flex]:not([is-column])[y-center]),
	:host([is-inline-flex]:not([is-column])[y-center]) {
		align-items: center;
	}

	:host([is-row][y-end]),
	:host([is-flex]:not([is-column])[y-end]),
	:host([is-inline-flex]:not([is-column])[y-end]) {
		align-items: flex-end;
	}

	:host([is-row][y-between]),
	:host([is-flex]:not([is-column])[y-between]),
	:host([is-inline-flex]:not([is-column])[y-between]),
	:host([is-row][y-around]),
	:host([is-flex]:not([is-column])[y-around]),
	:host([is-inline-flex]:not([is-column])[y-around]),
	:host([is-row][y-evenly]),
	:host([is-flex]:not([is-column])[y-evenly]),
	:host([is-inline-flex]:not([is-column])[y-evenly]) {
		align-items: stretch;
	}

	:host([is-column][x-start]) {
		align-items: flex-start;
	}

	:host([is-column][x-center]) {
		align-items: center;
	}

	:host([is-column][x-end]) {
		align-items: flex-end;
	}

	:host([is-column][x-between]),
	:host([is-column][x-around]),
	:host([is-column][x-evenly]),
	:host([is-column][x-stretch]) {
		align-items: stretch;
	}

	:host([is-column][y-start]) {
		justify-content: flex-start;
	}

	:host([is-column][y-center]) {
		justify-content: center;
	}

	:host([is-column][y-end]) {
		justify-content: flex-end;
	}

	:host([is-column][y-between]) {
		justify-content: space-between;
	}

	:host([is-column][y-around]) {
		justify-content: space-around;
	}

	:host([is-column][y-evenly]) {
		justify-content: space-evenly;
	}
`
