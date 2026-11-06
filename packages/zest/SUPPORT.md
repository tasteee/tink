# Support

What zest runs in, what it promises, and what happens when it changes its mind.

## Browsers

**Supported: Chrome 117+ and Edge 117+.** That is Chromium, current and the
version before it. Tests run in Chromium: Playwright's Chromium in CI, Edge on
Windows developer machines.

**Not supported: Firefox and Safari.** They are not tested and zest makes no
promise about them. Some of it may work. A control that needs a missing
platform feature (`popover`, `ElementInternals`) will render but not open, or
not take part in its form. Bug reports that only reproduce there are closed.

The floor is set by the platform features the library leans on. The oldest
Chromium that has all of them is the oldest one zest supports.

| Feature | Used for | Chrome / Edge |
| --- | --- | --- |
| `ElementInternals` (form-associated custom elements) | every form control | 77 |
| `adoptedStyleSheets` | every shadow root's styles | 73 |
| `color-mix(in oklch …)` | most theme colours | 111 |
| `popover` attribute / `showPopover()` | `z-select`, `z-combobox`, menus, tooltips | 114 |
| `@starting-style` | overlay enter transitions | 117 |
| `scrollbar-color` | themed scrollbars (decorative; degrades) | 121 |
| Import maps | unbundled plain-HTML use only | 89 |

Older Chromium gets an unstyled or partly styled page, not a broken one:
`@starting-style` and `scrollbar-color` are decorative and degrade silently.

## Frameworks

Each of these is built and driven in Chromium by the consumer smoke test
(`pnpm test:consumers`, and the `consumers` job in CI). It packs the real
tarball, installs it into a clean project, builds that project, clicks a
`z-switch`, and checks the framework's own event handler saw the change.

| Framework | Status | Notes |
| --- | --- | --- |
| Plain HTML / ES modules | Supported, tested | `dist/zest.js` bundles Atomico, so no import map is needed. Fonts are opt-in (`fonts.css`). |
| React 19 + TypeScript | Supported, tested | JSX typings ship with the package: add `/// <reference types="@tasteee/zest/react" />`. Props are camelCase properties, events are lowercase handlers (`onchange`). On hydration React applies neither properties nor `on*` listeners to custom elements; bind those through refs. |
| Vue 3 | Supported, tested | Set `isCustomElement` for `z-*` tags; listen with `@change`; use `.prop` for rich bindings. No template typings. |
| Svelte 5 | Supported, tested | Listen with `onchange`. No template typings. |
| SSR | Markup only | The bundle needs DOM globals and cannot be imported in Node. Server output is the tags; elements upgrade in the browser. |

## Stability

From 1.0, zest follows [Semantic Versioning](https://semver.org/).

- **Patch:** bug fixes only.
- **Minor:** new elements, props, values and events. Nothing that worked
  stops working.
- **Major:** the only release that may remove or rename something, and only
  after it was deprecated (see below).

The public surface is every element in `custom-elements.json`, with its
attributes, properties, events, slots, CSS custom properties and CSS parts.
The release gate (`scripts/check-release-surface.mjs`) and the unit and
browser test suites guard it.

## Languages and direction

Every string the library says is replaceable through `setLocale()`; layout
mirrors under `dir="rtl"`. The keys and their English defaults live in
`src/shared/locale.ts`. The one exception: overlay positioning is physical.

## Deprecation

- A deprecated attribute, property, value or event keeps working for at
  least one minor version after the deprecation lands.
- While it works, it warns once per page load in development builds and
  says what to use instead.
- The removal is listed under **Removed** in `CHANGELOG.md` in the version
  that removes it, and under **Deprecated** in the version that deprecated
  it.
- In code, a deprecation is one call to `warnDeprecated(subject,
  replacement)` from `src/shared/deprecate.ts`. It warns once per page load
  in development builds and never in a production bundle.
- Held-back elements (see `scripts/held-back.mjs`) are not part of the
  public surface and carry no such promise.

## Reporting problems

Open an issue at https://github.com/tasteee/tink/issues with the element,
the browser and version, and the smallest markup that shows it.
