# Changelog

All notable changes to `@tasteee/zest`. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[Semantic Versioning](https://semver.org/). Until 1.0, a minor version may
change a `beta` element's API, and says so here when it does.

## [Unreleased]

### Added

- Form participation for `z-input`, `z-textarea`, `z-number-input`,
  `z-checkbox`, `z-switch`, `z-radio-group`, `z-select` and `z-combobox`.
  Each is a form-associated custom element: it submits under its host
  `name`, blocks submission while `is-required` and empty, resets, follows a
  disabled `<fieldset>`, and exposes `form`, `validity`,
  `validationMessage`, `willValidate`, `labels`, `checkValidity()`,
  `reportValidity()` and `setCustomValidity()`. See
  `docs/fundamentals/forms.md`.
- `z-button type="submit"` submits the owning form through
  `requestSubmit()`, so validation runs; `type="reset"` resets it. A named
  submit button contributes `name`/`value` for that submission.
- `is-required` on `z-switch`, `z-select`, `z-combobox` and `z-radio-group`;
  `name` on `z-select`, `z-combobox` and `z-radio-group`; `is-disabled` on
  `z-radio-group`; `name` and `value` on `z-button`.
- Enter submits the owning form from `z-input` and `z-number-input`.
- `z-number-input` reports `badInput`, `rangeUnderflow`, `rangeOverflow` and
  `stepMismatch` to the form.
- A real-browser test project (`npm run test:browser`), an axe-core
  accessibility helper, a screenshot harness (`npm run test:screens`), and
  framework examples for React, Vue and Svelte that build and run in CI.
- `SUPPORT.md`: the browser floor, framework status, and the deprecation rule.
- An evidence table on every component page. Status is `beta` until every
  row is green; a test enforces it.
- `description` and `error` on every form control: accessible description
  and error text, rendered hidden inside the control and pointed at with
  `aria-describedby`; `z-field` sets them for you. `z-field` also forwards
  `is-invalid` while it shows an error.
- `label` on `z-popover`, naming its panel. Focus moves into the panel on
  open and back to the trigger on Escape.
- Keyboard: `z-menu` moves focus through its items (↑/↓, Home/End,
  type-ahead, Esc and Tab close, focus returns to the trigger); `z-tabs`
  arrows swap in RTL; `z-table` rows are keyboard-operable with
  `is-clickable`; `z-dialog` wraps Tab at its edges; `z-radio-group` moves
  selection with the arrow keys.
- Forced-colors support in the shared interaction styles, and the closing
  phase of floating surfaces is skipped under reduced motion.
- A screenshot matrix for the core set (`e2e/`), docs examples that assert
  their claims, an API contract test between the manifest and the
  declarations, and a coverage bar for the core set.

- `setLocale()` / `getLocale()`: every string zest writes itself is
  replaceable per app; `docs/fundamentals/internationalization.md` lists
  the keys.
- `@tasteee/zest/fonts.css`: the opt-in Google Fonts request that used to
  be inside `ink.css`. Self-hosting is a set of `@font-face` rules.
- Form participation for `z-input-otp`, `z-slider`, `z-range`,
  `z-color-picker`, `z-filter` and `z-toggle-button-group` (`name` on each;
  `is-required` on `z-input-otp`; `is-disabled` on `z-toggle-button-group`).
- Enum attributes on the core set are typed as literal unions in the
  declarations and the manifest (`size: 'sm' | 'md' | 'lg'`), so
  `size="huge"` is a TypeScript error.
- `#/status` in the docs: every element's evidence in one filterable table.

### Changed

- `ink.css` no longer loads fonts. Import `@tasteee/zest/fonts.css` next
  to it to keep Google Fonts, or self-host the same family names.
- Spacing inside components is written with logical properties, so
  `dir="rtl"` mirrors margins, borders and corner radii; `z-button-group`
  corners now follow the row direction.
- `name` now reflects on every form control. The inner native control no
  longer carries a `name`; the host does.
- `z-number-input`'s stepper buttons are no longer in the tab order (arrow
  keys step the value, as on a native number input).
- `z-radio-group` is focusable (`tabindex="-1"`) and forwards focus to its
  checked or first enabled radio, so `reportValidity()` lands somewhere.
- Every component page's status moved from `stable` to `beta`. Nothing about
  the elements changed; the label now means something.
- README: the light theme is described as it is, the boolean rule names the
  default-true attributes (generated from source), the token link points at
  `docs/structure/tokens.md`, and the plain-HTML example includes the import
  map it needs.
- Every focus ring uses `--focus-ring`; the translucent `--ring` treatment
  is gone and the CSS lint refuses it.
- Soft buttons and badges pull their text a quarter of the way to the
  foreground, and the light theme's `--muted-foreground` is one step
  darker: each measured under 4.5:1 on tinted surfaces.
- `z-input` and `z-textarea` commit `change` on blur from the control's
  value rather than the last render's.

### Deprecated

- `z-dialog size="small" | "medium" | "large"` — use `sm` / `md` / `lg`.
  The old words keep working for one minor and warn once in development.

### Fixed

- Icon-only `z-button` and `z-toggle-button` had no accessible name: the
  host's `aria-label` / `aria-labelledby` is now the inner button's name.
- `z-menu` and `z-popover` put `aria-haspopup` / `aria-expanded` on a
  role-less wrapper; they now go on the slotted trigger's control.
- `z-tooltip` gave its trigger no accessible description; the content is
  now forwarded as `aria-description`.
- The nine form controls had dropped out of the element inventory (manifest,
  README catalog, `dist/elements/*` subpaths) after they moved to
  `defineFormElement`; the inventory and the release gate now see them.
- A page without a bundler could not load `dist/zest.js` because of the
  bare `@tasteee/wired` and `atomico` imports; the README now shows the
  import map. Bundling wired in is an open question for the next minor.

## [0.8.0] — 2026-09

The last release before this changelog. See git history.
