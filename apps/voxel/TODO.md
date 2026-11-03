# Voxel editor: what's left

Status: work in progress. Built against the current Zest API.
Has not been built, typechecked or run yet.

## Done

- **Model** (`src/lib/model`): types, packed cell keys, voxel doc
  with change recording, face-culled mesher with baked AO, DDA
  raycast (walls always catch), line / rectangle / prefab / surface
  / connected-cell shapes, project create / parse / clone, glTF
  export (one node per group, nested, pivots as origins).
- **Storage** (`src/lib/storage`): IndexedDB projects + gallery
  layout, download / file-pick helpers.
- **State** (`src/lib/state`): editor (history, colors, groups,
  pivots, move / rotate, room resize), keymap (rebindable, saved),
  gallery, input + camera rig, interaction (aim, ghosts, every
  tool), controls (keys, mouse, pointer lock, tool wheel),
  navigation (open, back, new, duplicate, delete, import, export).
- **Scene** (`src/lib/scene`): fly camera, room grid, group meshes,
  VR pointer + face highlight, ghost preview, selection overlay,
  pivot marker, render-view lights + shadows, gallery room with
  pedestals, outlines, floating names, "new" pedestal, move mode.
- **UI** (`src/lib/ui`): shared (panel, swatch, key combo, menu
  item, toasts, crosshair, fly prompt, keymap dialog), gallery
  (HUD, project menu, new / rename / delete / export dialogs),
  workspace (top bar, toolbar, stamp picker, selection bar, tool
  wheel, color panel, project colors panel, groups panel).

## Left to do

1. **App shell**
   - `src/main.ts`, `src/zest.ts` (import `@tasteee/zest` +
     `ink.css`), `src/app.css`, `src/App.svelte`.
   - App: load gallery from IndexedDB on start, `setupControls()`,
     render `Viewport` + the HUD for the current route.
2. **Missing workspace dialogs**
   - `AimMenuDialog` (E menu): group options (make active, select,
     rename, hide, lock, reset pivot, unnest, delete) or room
     options (new group, settings, gallery).
   - `GroupNameDialog`: `nameGroup` (group selection) and
     `renameGroup` overlays.
   - `ProjectSettingsDialog`: name + room size, warn with
     `countVoxelsOutside` before shrinking.
3. **HUD layout**
   - `WorkspaceHud`: top bar, color panel (left), groups panel
     (right), project colors panel, toolbar + stamp picker +
     selection bar (bottom), tool wheel, crosshair, fly prompt.
   - `GalleryHud` wrapper with dialogs, fly prompt, toasts.
   - Mount `ExportDialog` and `KeymapDialog` once, app-wide.
4. **Build + verify**
   - `pnpm install`, `pnpm --filter @tasteee/voxel typecheck`,
     `pnpm --filter @tasteee/voxel dev` (port 5178).
   - Check Svelte sets z-element props (camelCase, e.g. `isOpen`)
     and that `slot="footer"` works on `z-dialog`.
   - Play-test every tool, undo / redo, hide / lock, pivots,
     render view, export, import.
5. **Repo wiring**
   - Root `package.json`: `dev:voxel`, `build:voxel`, and add
     `build:site` for voxel to the root `build` (ships at `/voxel/`).
   - README for the app.

## Open questions / follow-ups

- Recolor merges history per pause (160 ms debounce); revisit if
  the Zest color picker only fires on commit.
- Pivot z-axis color is a hardcoded blue: Zest has no blue token.
- Voxels stored as a per-group list; a packed format may be needed
  for very large models.
