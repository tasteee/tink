# tink

Monorepo for **Zest**, a framework-agnostic web component library, and the
sites and apps built with it.

## Live sites

Every merge to `main` builds and deploys to GitHub Pages
([workflow](./.github/workflows/deploy-pages.yml)).

| Site | URL |
| --- | --- |
| Docs and home | https://tasteee.github.io/tink/ |
| Element docs | https://tasteee.github.io/tink/docs |
| Tools | https://tasteee.github.io/tink/tools |
| Plot (3D lot builder) | https://tasteee.github.io/tink/plot/ |
| Vink (tasteink visualizer) | https://tasteee.github.io/tink/vink/ |

Voxel and Bridge are not deployed. Run them locally.

## What lives here

| Path | What it is |
| --- | --- |
| [`packages/zest`](./packages/zest) | `@tasteee/zest`, the web component library. See its [README](./packages/zest/README.md), [CHANGELOG](./packages/zest/CHANGELOG.md) and [SUPPORT](./packages/zest/SUPPORT.md). |
| [`apps/blog`](./apps/blog) | The main site: home, the Zest docs, and small tools. |
| [`apps/plot`](./apps/plot) | Mobile-first 3D lot builder. Built into the main site at `/plot/`. |
| [`apps/vink`](./apps/vink) | The tasteink audio visualizer (Svelte 5 + canvas). Loads a song, reacts to it, records a YouTube-ready video. Built into the main site at `/vink/`. |
| [`apps/voxel`](./apps/voxel) | First-person voxel editor (Svelte 5 + Threlte). |
| [`apps/bridge`](./apps/bridge) | Svelte experiments, still on the published zest 0.5.x. |
| [`design-tokens`](./design-tokens) | Shared design tokens. |
| [`pages`](./pages) | Static component test pages. |

## Zest v1 scope

Some elements are held back from v1: resizable panels, virtual list,
markdown, terminal, post meta, chart, editor canvas, progressive blur, and
the chat family. Their source stays in `packages/zest/src/components`, but
they are not exported, not in the manifest, and not in the docs. The list
lives in [`packages/zest/scripts/held-back.mjs`](./packages/zest/scripts/held-back.mjs)
and the release gate fails the build if one leaks back in.

## Develop

```sh
pnpm install
pnpm dev          # builds zest, then runs zest (watch) and the docs site
pnpm build        # zest, typecheck, docs site, plot
pnpm typecheck
```

Zest tests: `pnpm --filter @tasteee/zest test:unit`.
