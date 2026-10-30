# Zest → OpenPencil (via Claude Code)

Build the Zest design system as native OpenPencil variables, with a real
single-toggle Dark/Light mode, using Claude Code + OpenPencil's MCP server.

## Files in this folder

- `zest-tokens.json`: source of truth (primitives, semantic-dark, semantic-light, type). Machine-readable.
- `zest-tokens.css`: same system as CSS custom properties (dark default, `[data-theme="light"]` override). Doubles as the realigned `ink.css`.

## 1. Install

- OpenPencil app: https://app.openpencil.dev (web) or the desktop build.
- The MCP server (needs [Bun](https://bun.sh)):

```bash
bun add -g @open-pencil/mcp
```

## 2. Register the MCP with Claude Code

From the repo root:

```bash
claude mcp add openpencil -- bunx @open-pencil/mcp
```

Then start Claude Code in the repo (`claude`) and confirm the `openpencil`
tools are listed (`create_variable`, `set_variable`, `bind_variable`,
`list_variables`, `set_text`, `set_font`, …).

## 3. Create / open a .fig target

In OpenPencil, create a new file `Zest.fig` in this repo (or let the agent
create one via the MCP). The MCP edits `.fig` files on disk.

## 4. Paste this build prompt into Claude Code

> Read `design-tokens/zest-tokens.json`, it's the source of truth for our
> "Zest" design system. Using the OpenPencil MCP, build it into `Zest.fig` as
> native variables. Structure:
>
> 1. **Primitives** collection (one mode). Create every color scale as
>    `dom/1..12`, `sub/1..12`, `neutral/1..12`, `success/1..12`,
>    `warning/1..12`, `danger/1..12`, `neutral-light/1..12` from
>    `primitives.color`. Then the numeric primitives: `spacing/*`, `radius/*`,
>    `fontSize/*`, `fontWeight/*` from `primitives`. Hide primitives from
>    pickers (no scopes / minimal scopes).
> 2. **Semantic** collection with **two modes: Dark and Light**. Create the 42
>    roles from `semantic-dark` (keys like `bg`, `surface`, `border`, `text`,
>    `dom-solid`, `sub-solid`, `success-solid`, …). For each role, the **Dark**
>    mode value aliases the primitive named in `semantic-dark[role]` and the
>    **Light** mode value aliases the primitive in `semantic-light[role]`
>    (references look like `{color.dom.9}` → primitive `dom/9`). Never hardcode
>    hex in the semantic layer, always alias a primitive.
> 3. Set each semantic variable's scope to match its role (fills for
>    bg/surface/solid, stroke for border, text for text/on-\*).
> 4. **Text styles** from the `type` set (DM Sans / DM Mono), `display`, `h1`–
>    `h4`, `body`, `small`, `caption`, `code`, using the referenced
>    `fontSize`/`fontWeight`/`lineHeight`.
>
> Work incrementally: create primitives first, validate with `list_variables`,
> then semantics (both modes), then text styles. Report counts as you go.

## Result

One `Zest.fig` with hidden primitive scales, a semantic layer that flips
Dark↔Light from a single mode switch, and text styles, the design source of
truth, versionable as a file in this repo.
