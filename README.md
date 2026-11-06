# tink

Sites and apps built with **Zest**, a framework-agnostic web component
library. Zest has its own repo: https://github.com/tasteee/zest. Its docs are
at https://tasteee.github.io/zest/docs.

## Live sites

Every merge to `main` builds and deploys to GitHub Pages
([workflow](./.github/workflows/deploy-pages.yml)).

| Site | URL |
| --- | --- |
| Home (portfolio HQ) | https://tasteee.github.io/tink/ |
| Tools | https://tasteee.github.io/tink/tools |
| Plot (3D lot builder) | https://tasteee.github.io/tink/plot/ |
| Vink (tasteink visualizer) | https://tasteee.github.io/tink/vink/ |

Voxel and Bridge are not deployed. Run them locally.

## What lives here

| Path | What it is |
| --- | --- |
| [`apps/blog`](./apps/blog) | The main site: my home page and small tools. |
| [`apps/plot`](./apps/plot) | Mobile-first 3D lot builder. Built into the main site at `/plot/`. |
| [`apps/vink`](./apps/vink) | The tasteink audio visualizer (Svelte 5 + canvas). Loads a song, reacts to it, records a YouTube-ready video. Built into the main site at `/vink/`. |
| [`apps/voxel`](./apps/voxel) | First-person voxel editor (Svelte 5 + Threlte). |
| [`apps/bridge`](./apps/bridge) | Svelte experiments, pinned to the published zest 0.5.x. Not part of zest 1.0. |

## Zest dependency

The apps install `@tasteee/zest` from the `build` branch of the zest repo
(`github:tasteee/zest#build`). That branch holds the finished package, and
the zest repo's CI updates it on every push to `main`. The lockfile pins the
exact commit; to take a newer zest, run `pnpm update @tasteee/zest`.

## Develop

```sh
pnpm install
pnpm dev          # the home page and tools
pnpm build        # typecheck and build the home page, tools, plot, voxel, vink
pnpm typecheck
```
