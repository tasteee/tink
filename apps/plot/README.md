# plot

Mobile-first 3D lot builder. A proof of concept for a life-sim style
build mode: zoom around your lot, paint floors, draw walls, plant trees,
and furnish rooms.

**Live**: `<GitHub Pages URL>/plot/`. Every merge to `main` deploys it.
The root `pnpm build` builds the main site, then builds this app into
`apps/blog/dist/plot` with the site's base path (`VITE_BASE_PATH`), so
the existing Pages workflow (and the Netlify/Vercel previews) ship it
at `/plot/`.

Local dev, if you ever want it:

```sh
pnpm dev:plot     # from the repo root, http://localhost:5177
```

The dev server listens on the LAN (`host: true`) so you can open it on
a phone.

## Controls

| Gesture | Look / Plants / Furniture / Bulldoze | Floor / Walls |
| --- | --- | --- |
| One finger drag | pan | draw |
| Tap | select / place / remove | paint one tile |
| Pinch | zoom | zoom |
| Two finger drag | orbit | pan |
| ⟲ ⟳ buttons | turn camera 90° | turn camera 90° |

Desktop: left drag pans (or draws), right drag orbits, wheel zooms.

## Stack

- **react-three-fiber + three** for the scene. Every model is built
  from low-poly primitives in `src/scene/models`; floor and brick
  textures are drawn on canvases at runtime (`src/scene/textures.ts`).
  No asset files.
- **@tasteee/zest** for the HUD. Zest sizes in `rem`, so `app.css`
  shrinks the root font size on phones to scale every control down.
- **datass** for state (`src/game/store.ts`). The world autosaves to
  `localStorage` and keeps an undo history.

## Layout

```
src/
  game/    rules: catalog, grid math, footprints, actions, stores
  scene/   3D: camera rig, ground, floors, walls, objects, previews
  hud/     zest overlay: top bar, tool bar, catalog tray, selection
```

## Screens

| Phone | Phone, build mode | Desktop |
| --- | --- | --- |
| ![Look mode](docs/mobile-look.png) | ![Furniture tool, walls lowered](docs/mobile-build.png) | ![Plant ghost preview](docs/desktop-plants.png) |
