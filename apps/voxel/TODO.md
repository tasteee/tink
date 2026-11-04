# Voxel editor: what's left

Status: the app builds, typechecks clean (svelte-check: 0 errors,
0 warnings), and runs. Smoke-tested in headless Chromium: gallery,
new project dialog, entering a project, placing blocks, tool wheel,
render view and the E menu all work.

Run it: `pnpm dev:voxel` (port 5178). Live on Pages at
`<site base>/voxel/`, e.g. `https://tasteee.github.io/tink/voxel/`.

## Done

- Model, storage, state, scenes and every panel / dialog in the
  spec's MVP (see the PR description for the full list).
- App shell, HUD layout, E menu, group name dialog, project
  settings dialog.
- Fixes from the first run: per-scene task keys (scene switch
  crashed), nested `$state.raw` (build failed), removed
  `PCFSoftShadowMap` (three r187), pointer-lock move spikes,
  visible labels via `z-field`, closer workspace spawn, simpler
  color row.

## Left to do

1. **Distance fade for the grid.** At 128³ the far grid lines
   shimmer. Plan: `scene.fog` in the background token color
   (near ~24, far ~0.75 × room), with `fog: false` on voxel,
   pointer, ghost and pivot materials so only lines fade.
2. **Play-test by hand** (headless can't move the mouse while
   locked): look, line / square / extrude drags, stamp depth drag,
   select + group, object move / rotate, pivot nudge, recolor,
   hide / lock, undo / redo, export .vx / .glb / .gltf, import.
3. **Bundle size.** `@threlte/extras` pulls in draco / basis
   decoders (~1.7 MB main chunk). Import `HTML` and `Outlines`
   from their component paths, or drop extras.
4. **README** for the app. (Root scripts and the Pages build are
   wired: it ships at `<site base>/voxel/`.)
5. **Polish**
   - Gallery: room reads dark; try a lighter wall token.
   - Pointer beam is long at close range; shorten or fade it.
   - Tool wheel flick uses raw mouse deltas; tune the dead zone.

## Open questions / follow-ups

- Recolor merges history per pause (160 ms debounce); revisit if
  the Zest color picker only fires on commit.
- Pivot z-axis color is a hardcoded blue: Zest has no blue token.
- Voxels stored as a per-group list; a packed format may be needed
  for very large models.
- Zest `label` on `z-input` / `z-number-input` is aria-only; a
  visible label needs `z-field`. Maybe worth a Zest change.
