# Changelog

All notable changes to `@tasteee/zest`. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[Semantic Versioning](https://semver.org/). Until 1.0, a minor version may
change an element's API, and says so here when it does.

## [Unreleased]

### Removed from the public surface

Held back until they are documented and tested. Their source stays in the
repo; they are no longer exported, in the manifest, or in the package:
`z-selection-toolbar`, `z-gutter-handle`, `z-slash-menu`,
`z-mention-popover`, `z-format-toolbar`, `z-bubble-menu`, `z-drag-handle`,
`z-drop-indicator`, `z-table-toolbar`, `z-table-axis-handle`,
`z-status-bar`, `z-comment-mark`, `z-comment-gutter-icon`,
`z-comment-thread-panel`. The package now has 97 elements.

### Added

- **JSX typings for React.** `/// <reference types="@tasteee/zest/react" />`
  types every `z-*` element with its real props and events, generated from the
  manifest. A wrong value such as `kind="huge"` is a compile error.
- Every element's docs page now lists its slots, CSS custom properties, CSS
  parts, keyboard map and accessibility notes. `custom-elements.json` carries
  the slots, properties and parts too.
- `z-pagination` `label`: names the navigation landmark, so a page with
  several paginations can tell them apart.
- `custom-elements.json` carries a description for every element, attribute
  and event, so editors show docs on hover.

### Changed

- **Browser support is Chrome and Edge 117+.** Firefox and Safari were listed
  but never tested; they are no longer promised. See `SUPPORT.md`.
- `tone`, `size`, `kind`, `color`, `direction`, `side`, `align` and `position`
  are typed on every element that takes one, so `tone="purple"` and
  `size="huge"` are TypeScript errors. Each element
  accepts only the values it can render, all from one shared list per prop.
  Runtime behaviour is unchanged. `z-container` and `z-spacer` keep an open
  `size`, since they take any CSS length.
- More props are typed, so a wrong value is a TypeScript error:
  `aligns-x` and `aligns-y` (`z-box`, `z-row`, `z-column`, `z-grid`,
  `z-center`), `stack-below`, `z-accordion` `type`, `z-avatar` `status`,
  `z-chassis` `rail-side`, `z-input` `type`, `z-link` `underline`,
  `z-scroll` `overscroll` and `scrollbar`, `z-skeleton` `shape`,
  `z-sortable` `axis`, `z-stat` `label-size`, `z-surface` `level` and
  `z-tree` `selection`.
- **`tone="neutral"` is no longer allowed on `z-checkbox`, `z-combobox`,
  `z-hover-card`, `z-input`, `z-menu`, `z-number-input`, `z-popover`,
  `z-radio`, `z-select`, `z-switch`, `z-tabs`, `z-textarea` and
  `z-tooltip`.** It was typed but never styled, so it gave the default
  accent, not a neutral one. Use `primary` or `secondary`, or leave it unset.
- **`z-surface` `kind="filled"` is now `kind="solid"`**, the same word
  `z-button` uses for a tone-filled surface.

### Removed

- `z-label` `size`. It had no styles and did nothing.

### Fixed

- `z-grid` `min-column-width` forced a column wider than its container, so a
  grid with `min-column-width="22rem"` scrolled a phone sideways. The minimum
  now shrinks to the container.
- `z-scroll` and `z-scroll-area` widened the grid or flex parent that held
  them instead of scrolling inside it.
- `z-dropzone` could not be used from the keyboard. The drop area is now a
  focusable button: Enter or Space opens the file picker.
- `z-drawer` and `z-sheet` dialogs had no accessible name. They are now
  labelled by their heading and described by their description.
- `z-collapsible` content regions had no name. They are now labelled by their
  trigger.
- `z-avatar` put `aria-label` on a bare `span`, which ARIA does not allow. A
  named avatar is now `role="img"`. Its initials failed contrast in the neutral
  tone (3.78:1) and now read in every tone, in both themes.
- Seven more strings ignored `setLocale()`: `dropFilesHere`, `filesSelected`,
  `goToSlide`, `showMore`, `showLess`, `copy` and `copied`.
- `z-marquee` threw `Cannot read properties of null` when a prop changed.
- `z-alert-dialog` had no accessible name; it is now labelled by its heading
  and described by its description.
- The `z-command` results list had no accessible name.
- `z-color-picker` could not be closed with Escape. Escape now closes it and
  returns focus to the swatch.
- `z-context-menu` opened from the keyboard (the context-menu key, Shift+F10)
  left focus on the target, so the arrow keys did nothing. Focus now moves
  into the menu and returns when it closes.
- `z-sidebar` group labels failed colour contrast.
- Sixteen strings were hardcoded in English and ignored `setLocale()`. They are
  now locale keys: `cancel`, `confirm`, `learnMore`, `remove`, `previousSlide`,
  `nextSlide`, `files`, `chooseColor`, `saturationAndBrightness`, `hue`,
  `commandSearch`, `commandResults`, `commandPlaceholder`, `commandEmpty`,
  `removeSelectedFiles`, `pagination`, `previousPage`, `nextPage`,
  `colorTheme`, `themeLight`, `themeDark`, `themeSystem`, `switchToLight` and
  `switchToDark`. `z-sheet` now uses the existing `close` key.
- `z-surface` no longer has a `tone="plain"` style. `plain` is a `kind`.
- The `z-alert` docs listed an `info` tone that does not exist, and two demos
  used it. They now use `primary`.
- The docs listed `color="white"` on seven text elements. It was renamed
  `strong` in 0.9.0.
- The docs listed `small | medium | large` sizes on about 20 elements, which
  0.9.0 renamed to `sm | md | lg`.
- The `z-callout` docs listed the old `note`, `tip`, `important` and `caution`
  tones, which were renamed in 0.9.0.

## [0.9.0]

This release changes attribute names across the library. Every rename is
listed under **Changed**; the docs site and demos use the new names.

### Added

- Form participation for every form control (`z-input`, `z-textarea`,
  `z-number-input`, `z-checkbox`, `z-switch`, `z-radio-group`, `z-select`,
  `z-combobox`, `z-input-otp`, `z-slider`, `z-range`, `z-color-picker`,
  `z-filter`, `z-toggle-button-group`). Each submits under its `name`,
  blocks submit while `is-required` and empty, resets, follows a disabled
  `<fieldset>`, and exposes `validity`, `checkValidity()`,
  `reportValidity()` and `setCustomValidity()`.
- `z-button type="submit" | "reset"` drives the owning form.
- `description` and `error` on every form control, wired to
  `aria-describedby`; `z-field` sets them for you.
- Keyboard maps for menu, tabs, table, dialog, popover and radio group;
  focus returns to the trigger when an overlay closes.
- A light theme, and a theme API: `setThemePreference()`, `toggleTheme()`,
  `getTheme()`, `subscribeToTheme()`. Dark stays the default.
- `z-theme-switcher`: light / dark / system segments, or a compact icon
  toggle.
- `setLocale()` / `getLocale()`: every string zest writes is replaceable.
- `@tasteee/zest/fonts.css`: the Google Fonts request, now opt-in.
- Per-element imports: `@tasteee/zest/z-button` registers one element.
- `z-code-block`: `added-lines`, `removed-lines`, `focus-lines`, `is-plain`.
- `z-box display="grid"` with `columns`, `rows` and per-breakpoint columns.
- `z-card` `heading`, `description`, `gap` and `direction`.
- `z-toolbar direction="vertical"`.
- Typed enum props: `size="huge"` is a TypeScript error.
- A release gate (`scripts/check-release-surface.mjs`), unit and real-browser
  test suites, `SUPPORT.md` and `LICENSE`.

### Changed

- **Booleans start with `is` / `has` / `can` / `should` / `was` / `will` /
  `does`**, and none default to true (markup could never turn them off):
  `multiple` → `is-multiple`, `loop` → `does-loop`, `wrap` → `does-wrap`,
  `full-width` → `is-full-width`, `full-height` → `is-full-height`,
  `show-value` → `does-show-value`, `pulse` → `does-pulse`,
  `grow` → `can-grow`, `collapsible` → `is-collapsible`,
  `floating` → `is-floating`, `fixed` → `is-fixed`,
  `hide-close` → `is-close-hidden`, `hide-copy` → `is-copy-hidden`,
  `hide-header` → `is-header-hidden`, `hide-labels` → `is-unlabeled`,
  `hide-replay` → `is-replay-hidden`, `no-jump` → `is-jump-disabled`,
  `no-add` → `is-add-disabled`, `no-highlight` → `is-plain`, and the rest
  shown in each element's API reference.
- **Flag groups are enums**: `is-row` / `is-column` / `is-horizontal` /
  `vertical` / `orientation` → `direction`; `x-*` / `y-*` → `aligns-x` /
  `aligns-y`; `variant` → `kind` (`outlined` → `outline`); toggle
  `is-purple` / `is-small` / `is-ghost` … → `tone` / `size` / `kind`.
- **Sizes** are `sm` / `md` / `lg` everywhere (was `small` / `medium` /
  `large`).
- **`z-toggle` → `z-toggle-button`**, `z-toggle-group` →
  `z-toggle-button-group`, `z-toggle-group-item` →
  `z-toggle-button-group-item`.
- **`z-range`** takes `value` (`[lower, upper]`) and `handles` arrays;
  events carry `{ value }`.
- **`z-text` / `z-display` / `z-label` `weight`** is any number.
- **`z-callout`** uses `tone` (`note` → `primary`, `tip` → `success`,
  `important` → `secondary`, `caution` → `danger`).
- **`z-text` `color="white"`** is `color="strong"`.
- `ink.css` no longer loads fonts; import `fonts.css` next to it.
- Spacing uses logical properties, so `dir="rtl"` mirrors layouts.
- Focus rings use `--focus-ring` everywhere.
- Atomico 2.2 is required.

### Removed

- `z-range-handle` (use `z-range` `handles`).
- `z-dialog` `size` (set `--z-dialog-width` from outside) and the unused
  `tone` on `z-dialog`, `z-drawer` and `z-sheet`.
- Unused props: `z-editor-canvas snap`, `z-relative-time format`,
  `z-sortable group` / `animation`.

### Fixed

- Icon-only `z-button` and `z-toggle-button` have an accessible name.
- `z-tabs` no longer loses keyboard focus when it re-renders, and tabs
  without panel content stay out of the accessibility tree.
- `z-menu` focuses its first item as soon as it opens.
- `z-toaster` strings are localisable and its position mirrors in RTL.
- Soft badge and button text keeps its hue (mixed in oklab).
- `z-code-block` copy button is styled again (it had fallen back to a bare
  native button).

## [0.8.1]

Published from the standalone repo; superseded by 0.9.0.
