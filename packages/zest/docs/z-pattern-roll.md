# z-pattern-roll

A **chord-relative pattern editor** — a sibling of [`z-piano-roll`](z-piano-roll.md)
whose vertical axis is not absolute pitch but **chord-tone degrees** (`N1`, `N2`,
`N3`, …). You author a rhythmic/melodic *pattern* once, and it produces
good-sounding MIDI over **any** chord it is later applied to.

```html
<z-pattern-roll tones="8" length="4" chord-size="3"></z-pattern-roll>
```

```js
const roll = document.querySelector('z-pattern-roll')
roll.signals = [
  // tone = 1-based chord degree, octave = octave shift, start/duration in beats
  { tone: 1, octave: 0, start: 0,   duration: 0.5, velocity: 110 },
  { tone: 3, octave: 0, start: 0.5, duration: 0.5, velocity: 90  },
  { tone: 5, octave: 0, start: 1,   duration: 1,   velocity: 100 },
  { tone: 1, octave: 1, start: 2,   duration: 1,   velocity: 100, probability: 0.75 }
]
roll.addEventListener('change', (e) => save(e.detail.signals))
```

---

## 1. The concept

### The problem it solves

A normal piano roll stores **absolute pitches** (`C4`, `E4`, `G4`). That melody
only fits the chord it was written over. Transpose to a different chord and it
clashes — every note has to be re-drawn.

A **pattern** stores **relative positions within a chord** instead. Rather than
"play E4", it says "play the **2nd tone** of whatever chord is sounding right
now." Apply that same pattern over a C‑major chord and the 2nd tone is `E`; apply
it over an F‑minor chord and the 2nd tone is `Ab`. The *shape* (rhythm, contour,
dynamics) is preserved; the *pitches* adapt. One pattern → musical results across
an entire progression, in any key.

This is the same idea as the **Nashville Number System**, where songs are written
as numbers relative to the key so they transpose to any key instantly — except
here the numbers are relative to the **chord**, not the key. Related theory:
scale degrees, chord tones (1‑3‑5‑7), figured bass, and Roman‑numeral analysis.

### The vocabulary

- **Signal** — one cell in the pattern. The pattern analog of a "note". It has a
  time position + length (like a note) but its pitch is expressed as a **degree**.
- **`N` degree (`tone`)** — a 1-based index into the *active chord's* notes. `N1`
  is the root, `N2` the second chord tone, and so on. When the index exceeds the
  chord size it **wraps up an octave**: over a triad (3 notes), `N4` is the root
  one octave up, `N5` the second tone up an octave, etc.
- **Octave modifier (`octave`)** — an extra whole-octave shift applied on top of
  the degree, so the same degree can be voiced low or high independent of wrap.
- **velocity / probability / enabled** — per-signal expression: loudness (1–127),
  chance of firing (0–1, for humanized/generative feel), and a mute toggle.

### The resolution formula

This is exactly amore's `resolveSignalToMidi` (`apps/amore/src/music/theory.ts`):

```
zeroBased   = tone - 1
index       = zeroBased mod chordNotes.length      // which chord tone
wrapOctaves = floor(zeroBased / chordNotes.length)  // octaves gained by wrapping
midi        = chordNotes[index] + (wrapOctaves + octave) * 12
```

So a pattern authored against `N1…N8` renders correctly whether the chord has 2
notes (power chord), 3 (triad), 4 (seventh), or 7 (thirteenth) — the degrees
simply wrap.

---

## 2. Prior art & references

Chord-relative / degree-based sequencing is a well-established idea:

| Tool | What it does |
| --- | --- |
| **Xfer Records — Cthulhu** | Pattern arpeggiator that triggers *held chord notes by index/step* — the closest analog to this element. |
| **Plugin Boutique — Scaler 2** | "Performances"/patterns that adapt rhythm & voicing to whatever chord is selected/detected. |
| **Mixed In Key — Captain Chords / Captain Plugins** | Rhythm & melody patterns played relative to an underlying chord progression. |
| **Audiomodern — ChordJam / InstaChord** | Chord-relative strumming/sequencing and re-voicing. |
| **RapidComposer** | Phrase patterns expressed in scale/chord degrees, re-applied across progressions. |
| **Hooktheory — Hookpad** | Composition in scale degrees rather than absolute notes. |
| **Ableton Live 12 MIDI Tools / Arpeggiator**, **Logic Arpeggiator/Scripter** | Scale-aware, chord-relative note generation. |

Music-theory background (useful reading):

- **Nashville Number System** — numbers relative to a key: <https://en.wikipedia.org/wiki/Nashville_Number_System>
- **Chord tones / scale degrees** — <https://en.wikipedia.org/wiki/Factor_(chord)> · <https://en.wikipedia.org/wiki/Degree_(music)>
- **Figured bass** (historical relative-interval notation) — <https://en.wikipedia.org/wiki/Figured_bass>

---

## 3. How the editor works (high level)

`z-pattern-roll` reuses the entire interaction engine of `z-piano-roll`, so every
authoring gesture is identical — only the **vertical meaning** changes (chord
degrees instead of MIDI pitches) and there are a few **pattern-specific**
per-signal properties.

### Layout

- **Degree gutter (left, sticky):** one row per degree, labeled `N1` … `N{tones}`
  for the core band, plus `tone-margin` extra octave bands above and below,
  labeled with a `+n`/`-n` suffix (`N1+1` … `N{tones}+1`, `N1-1` … `N{tones}-1`,
  …) so wrapped-octave degrees are reachable by scrolling rather than clamped
  away. If `chord-size` is set, the rows that resolve to a chord root (`N1`,
  `N{size+1}`, …, and their wrapped equivalents) are banded so you can see
  octave boundaries at a glance. On mount, the view scrolls so the core
  `N1…N{tones}` band is vertically centered, and zooms so 4 beats span the full
  width.
- **Beat ruler (top, sticky):** beat numbers, with heavier lines on bar
  boundaries (`beats-per-bar`).
- **Grid (scrollable):** subdivision / beat / bar lines; signals drawn as blocks.
- **Toolbar:** Select/Draw mode, snap, zoom (H/V), and a selection group
  (octave ±, mute, duplicate) that acts on the current selection.

### Gestures (ported from z-piano-roll)

- **Draw** (draw mode: click-drag) / **double-click** (select mode) to place a
  signal; drag while placing to set its length.
- **Move** — drag a block horizontally (time) or vertically (to another degree
  row). **Delete** — `Delete`, right-click, or double-click a block.
- **Resize** — grab a block's left/right ~6px edge.
- **Collision handling (latest wins)** — dropping/placing a signal over an
  existing one **on the same degree *and* octave** trims, splits, or removes the
  older signal. (Two signals that share a row but differ in octave resolve to
  different pitches, so they are *not* treated as colliding.)
- **Marquee** multi-select, then **multi-move / multi-resize / multi-delete**.
- **Duplicate** (`Ctrl/⌘+D`), **select-all** (`Ctrl/⌘+A`), **nudge** (arrows).

### Pattern-specific editing

Because the pattern model carries octave / velocity / probability / enabled (the
same fields amore's context menu edits), those are editable inline on the
selection:

| Action | Binding | Effect |
| --- | --- | --- |
| Octave shift | `Shift+↑` / `Shift+↓` (or toolbar Oct ±) | `octave` ± 1 (−4…4), shown as a badge on the block |
| Velocity | `Alt+↑` / `Alt+↓` | `velocity` ± 5 (1…127), shown as block fill intensity |
| Probability | `,` / `.` | `probability` ∓/± 0.1 (0…1), shown as a bottom strip |
| Mute / enable | `M` (or toolbar) | toggles `enabled`; disabled blocks render dimmed |
| Reset modifiers | `R` | octave→0, velocity→default, probability→1 |

---

## 4. Properties & attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `signals` | `Signal[]` | `[]` | **property** — the pattern (see model below); two-way via `change` |
| `tones` | number | `8` | size of the core degree band (`N1…N{tones}`) |
| `tone-margin` | number | `3` | extra whole octave bands rendered above and below the core band (labeled `N1+1…N{tones}+1`, `N1-1…N{tones}-1`, …), so patterns can wrap an octave without scrolling blind |
| `chord-size` | number | — | if set, bands octave boundaries / marks root-equivalent rows |
| `length` | number (beats) | `4` | pattern length in beats (grid extends to fit longer signals) |
| `beats-per-bar` | number | `4` | bar grouping for ruler emphasis |
| `snap` | number (beats) | `0.25` | grid snap (0 = free) |
| `beat-width` | number (px) | `48` | horizontal zoom (px per beat) |
| `row-height` | number (px) | `22` | vertical zoom (px per degree row) |
| `mode` | `select` `draw` | `select` | interaction mode |
| `default-velocity` | number | `100` | velocity for newly drawn signals |
| `default-octave` | number | `0` | octave modifier for newly drawn signals |
| `playhead` | number (beats) | — | draws a playhead line at this beat |
| `hide-toolbar` | boolean | — | hide the toolbar |
| `hide-keyboard` | boolean | — | hide the degree gutter |
| `is-disabled` | boolean | — | disable interaction |
| `is-hidden` | boolean | — | hide the element |

### Signal model

```ts
type Signal = {
  id?: number         // assigned if omitted
  tone: number        // 1-based chord degree (N1 = root)
  octave?: number     // octave modifier, default 0
  start: number       // beats
  duration: number    // beats
  velocity?: number   // 1..127, default `default-velocity`
  probability?: number // 0..1, default 1
  enabled?: boolean   // default true
}
```

## 5. Events

| Event | `detail` | Description |
| --- | --- | --- |
| `change` | `{ signals }` | whenever the pattern mutates (draw, move, resize, delete, duplicate, modifier edit) |
| `select` | `{ ids }` | whenever the selection changes |

## 6. Imperative API

```js
roll.getSignals()          // → Signal[]
roll.setSignals(signals)   // replace, clears selection
roll.selectAll()
roll.clearSelection()
roll.deleteSelection()
roll.duplicateSelection()
roll.getSelection()        // → number[] of ids
```

---

## 7. Integrating with amore

> **Implemented.** `apps/amore/src/project/PatternEditor.tsx` is now a thin wrapper
> over `<z-pattern-roll>`. The id-bridge + diff state machine lives in
> `apps/amore/src/project/patternSync.ts` (pure, unit-tested); the element is
> authoritative while mounted and each `change` is diffed into granular
> `addSignal` / `updateSignal` / `removeSignal` Convex mutations.

amore already speaks this model — the mapping is 1:1 with `PatternSignalT`, with
two boundary conversions (ticks ↔ beats, and the element being presentation-only
while Convex stays the source of truth):

| amore `PatternSignalT` | `z-pattern-roll` `Signal` | Conversion |
| --- | --- | --- |
| `_id` | `id` | keep a string↔number map, or use numeric ids |
| `chordToneIndex` | `tone` | identical (1-based) |
| `octaveModifier` | `octave` | identical |
| `startTicks` | `start` | `ticksToBeats` / `beatsToTicks` |
| `durationTicks` | `duration` | `ticksToBeats` / `beatsToTicks` |
| `velocity` | `velocity` | identical |
| `probability` | `probability` | identical |
| `isEnabled` | `enabled` | identical |

`PatternEditor.tsx` would become a thin wrapper: feed `signals` (converted from
Convex), set `length` = `ticksToBeats(patternLengthTicks)`, `snap` =
`ticksToBeats(gridTicks)`, and on `change` diff the emitted signals against the
server state to drive `addSignal` / `updateSignal` / `removeSignal` mutations
(keeping the existing optimistic-update layer). `loopMode` and pattern-length
selection stay in amore's surrounding UI, or are passed through as-is. Playback is
unchanged: `resolveSignalToMidi` already consumes exactly this `{ tone, octave }`
shape.
