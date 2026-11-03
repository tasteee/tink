# Support

What zest runs in, what it promises, and what happens when it changes its mind.

## Browsers

The floor is set by the platform features the library leans on, not by a
policy chosen first and justified later. The oldest browser that has all of
them is the oldest browser zest supports.

| Feature | Used for | Chrome / Edge | Firefox | Safari |
| --- | --- | --- | --- | --- |
| `ElementInternals` (form-associated custom elements) | every form control | 77 | 98 | 16.4 |
| `adoptedStyleSheets` | every shadow root's styles | 73 | 101 | 16.4 |
| `color-mix(in oklch …)` | most theme colours | 111 | 113 | 16.2 |
| `popover` attribute / `showPopover()` | `z-select`, `z-combobox`, menus, tooltips | 114 | 125 | 17 |
| `@starting-style` | overlay enter transitions | 117 | 129 | 17.5 |
| `scrollbar-color` | themed scrollbars (decorative; degrades) | 121 | 64 | — (ignored) |
| Import maps | unbundled plain-HTML use only | 89 | 108 | 16.4 |

**Supported: Chrome 117+, Edge 117+, Firefox 129+, Safari 17.5+.** In
practice that is the last two major versions of each. Older browsers get an
unstyled or partly styled page, not a broken one: `@starting-style` and
`scrollbar-color` are decorative and degrade silently; the `popover` attribute
and `ElementInternals` are not, and a control missing them renders but does
not open or does not take part in its form.

Tests run in Chromium (Edge on Windows developer machines, Playwright's
Chromium in CI). Firefox and WebKit are supported on the strength of the
table, not of a test run — that gap is on the roadmap in
`docs/production-readiness-plan.md`.

## Frameworks

`examples/` holds one small app per framework that builds from the published
package and is driven through a validated form in CI:

| Framework | Status | Notes |
| --- | --- | --- |
| Plain HTML / ES modules | Verified | Needs an import map for `@tasteee/wired` and `atomico` without a bundler; see the README. Fonts are opt-in (`fonts.css`). |
| React 19 | Verified, with a caveat | On hydration React applies neither properties nor `on*` listeners to custom elements; bind rich props and custom events through refs. Client-only rendering has no such limit. |
| Vue 3 | Verified | Set `isCustomElement` for `z-*` tags; `.prop` for rich bindings. |
| Svelte 5 | Verified | Nothing special. |
| SSR | Markup only | The bundle needs DOM globals and cannot be imported in Node. Server output is the tags; elements upgrade in the browser. No declarative shadow DOM yet. |

## Stability

A component page's status is a claim backed by an evidence table — form
participation, keyboard, screen reader, browser tests, screenshots — and a
test refuses `stable` unless every row is green. Anything else is `beta`:
usable, documented, and allowed to change its API between minor versions
with a changelog entry.

## Languages and direction

Every string the library says is replaceable through `setLocale()`; layout
mirrors under `dir="rtl"`. See `docs/fundamentals/internationalization.md`
for the key list and the one exception (overlay positioning is physical).

## Deprecation

- A deprecated attribute, property, value or event keeps working for at
  least one minor version after the deprecation lands.
- While it works, it warns once per page load in development builds and
  says what to use instead.
- The removal is listed under **Removed** in `CHANGELOG.md` in the version
  that removes it, and under **Deprecated** in the version that deprecated
  it.
- Held-back elements (see `scripts/check-release-surface.mjs`) are not part
  of the public surface and carry no such promise.

## Reporting problems

Open an issue at https://github.com/tasteee/zest/issues with the element,
the browser and version, and the smallest markup that shows it.
