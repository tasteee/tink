# Zest element roadmap

A domain-driven plan for growing `@tasteee/zest` from a general UI kit into a
library that can build whole application classes — dashboards, blogs, AI chat,
editors, and documentation sites — end to end.

## Principles

- **Additive, not duplicative.** The 74 shipped elements are the base. Everything
  here builds on them; a new element earns its place only when the pattern can't
  already be expressed by composing existing `z-*` primitives.
- **Prefer new elements over overloading old ones.** (Per project convention.)
- **Compose upward.** Domain elements are assembled from foundational primitives
  and existing `z-*`, so a fix to `z-markdown` or `z-resizable-panels` improves
  every domain that leans on it.
- **Real custom elements = real APIs.** Because every element is a DOM node, the
  richer ones expose imperative methods + events (not just attributes), e.g.
  `canvas.fit()`, `panelGroup.getLayout()`.

Legend: `[x]` shipped · `[ ]` planned · ⭐ explicitly requested

---

## 0. Foundational primitives — build first

These repay themselves across 3–5 domains each. The reuse map:

| Primitive | Dashboards | Blog | Chat | Editors | Docs |
|---|:-:|:-:|:-:|:-:|:-:|
| `z-editor-canvas` ⭐ | ● graphs | | ● artifacts | ● | ● diagrams |
| `z-resizable-panels` ⭐ | ● | | ● | ● | ● |
| `z-tree` | ● | | ● history | ● layers | ● nav |
| `z-markdown` | | ● | ● | | ● |
| `z-virtual-list` | ● tables | ● lists | ● history | ● assets | ● search |
| `z-drag-drop` | ● widgets | | ● attach | ● | |
| `z-sortable` | ● | | | ● layers | |
| `z-dropzone` | ● import | ● | ● attach | ● assets | |
| `z-toolbar` | ● | | ● | ● | |

- [ ] **`z-editor-canvas`** ⭐ — infinite pan/zoom/pinch canvas; DOM-controllable
  (`zoomTo`/`panTo`/`fit`, `viewportchange` event). See `docs/foundational-primitives.md`.
- [x] **`z-resizable-panels`** ⭐ + `z-panel` + `z-panel-handle` — react-resizable-panels-style
  group: %/px + fixed sizes, custom separators, persistence *(collapse snapping polish TODO)*.
- [x] **`z-tree`** — nested expand/collapse, selection, keyboard nav *(drag-reorder TODO)*
- [x] **`z-virtual-list`** — windowed rendering for huge lists; fixed *and* dynamic (`estimate-size`) item heights *(scroll-up anchoring polish TODO)*
- [x] **`z-markdown`** — GFM markdown renderer (marked) that composes `z-code-block`; sanitizes + hardens links *(block-cache streaming optimization + z-table/z-link upgrades TODO)*
- [x] **`z-drag-drop`** (`z-draggable` + `z-drop-target`) — general pointer-based DnD engine
- [x] **`z-sortable`** — drag-to-reorder within a list/grid *(cross-list + FLIP easing TODO)*
- [x] **`z-dropzone`** — file drag-drop + click-to-browse
- [x] **`z-toolbar`** (+ `z-toolbar-group`) — action strip, roving tabindex, scroll/wrap overflow *(overflow-to-menu TODO)*
- [ ] `z-minimap` — overview + viewport rect, binds to a canvas
- [ ] `z-zoom-controls` — fit / 100% / +/- bound to a canvas
- [ ] `z-clipboard` / `z-copy` — copy-to-clipboard wrapper w/ feedback
- [ ] `z-hotkeys` — declarative keyboard-shortcut registry
- [ ] `z-resize-observer` / `z-measure` — expose element size to consumers
- [ ] `z-lazy` — render/load children on intersection

---

## 1. Dashboards (data-heavy)

**Shell & layout**
- [ ] `z-dashboard-shell` — topbar + sidebar + content frame
- [ ] `z-panel` — titled widget container (header / actions / body)
- [ ] `z-widget-grid` — draggable/resizable tile layout
- [ ] `z-tile` / `z-widget`
- [ ] `z-page-header` — title + breadcrumbs + actions + tabs
- [ ] `z-toolbar` *(foundational)*
- [ ] `z-filter-bar`
- [x] `z-toggle-group` (segmented control)

**Metrics / KPIs**
- [x] `z-stat`
- [ ] `z-metric` / `z-kpi` — big number + delta + sparkline
- [ ] `z-delta` / `z-trend` — ▲ +12% colored change
- [ ] `z-sparkline`
- [ ] `z-gauge` — radial gauge
- [ ] `z-progress-ring`
- [ ] `z-scorecard`
- [ ] `z-comparison` — vs previous period

**Charts**
- [x] `z-chart`
- [ ] `z-line-chart` · `z-bar-chart` · `z-area-chart` · `z-pie` / `z-donut`
- [ ] `z-scatter` / `z-bubble` · `z-heatmap` · `z-calendar-heatmap`
- [ ] `z-histogram` · `z-funnel` · `z-radar` · `z-treemap` · `z-sankey`
- [ ] `z-candlestick` (finance) · `z-gantt` · `z-waterfall`
- [ ] `z-geo-map` / `z-choropleth` · `z-network-graph` (on `z-editor-canvas`)
- [ ] composables: `z-chart-legend` · `z-axis` · `z-crosshair` · `z-brush` · `z-annotation`

**Data tables**
- [x] `z-table`
- [ ] `z-data-grid` — sort/filter/resize/pin columns, row-select, expand, group, aggregate, virtualized, editable
- [ ] `z-pivot-table` · `z-tree-table`
- [ ] `z-table-toolbar` · `z-column-picker` · `z-density-toggle`
- [ ] `z-bulk-actions-bar` · `z-row-actions`
- [ ] cell renderers: `z-cell-badge` · `z-cell-progress` · `z-cell-sparkline` · `z-cell-trend` · `z-cell-avatar`

**Filtering & controls**
- [x] `z-filter`
- [ ] `z-date-picker` · `z-calendar` · `z-date-range-picker` · `z-time-picker`
- [ ] `z-facet-list` · `z-query-builder` · `z-filter-chips`
- [ ] `z-saved-views` / `z-view-switcher` · `z-search-input`

**Status & feedback**
- [ ] `z-status-dot` / `z-status-indicator` · `z-live-indicator`
- [ ] `z-relative-time` (auto-updating) · `z-activity-feed` · `z-timeline`
- [ ] `z-leaderboard` · `z-progress-tracker`

---

## 2. Blog

**Article structure**
- [ ] `z-article` / `z-prose` — typographic wrapper for markdown children
- [ ] `z-article-header` — title / subtitle / meta / cover
- [x] `z-post-meta`
- [ ] `z-byline` / `z-author` · `z-author-card`
- [ ] `z-reading-time` · `z-reading-progress`
- [ ] `z-toc` — auto from headings, scroll-spy
- [ ] `z-lede` / `z-dek` · `z-drop-cap` · `z-pull-quote` · `z-blockquote`
- [ ] `z-figure` (+caption) · `z-cover` / `z-hero-image`
- [ ] `z-footnote` · `z-aside` / `z-margin-note`
- [x] `z-callout` · `z-code-block`

**Discovery / listing**
- [ ] `z-post-card` · `z-post-grid` / `z-post-list` · `z-featured-post`
- [ ] `z-tag-list` (composes `z-badge`) · `z-related-posts` · `z-series-nav`
- [ ] `z-load-more`
- [x] `z-pagination`

**Engagement / social**
- [ ] `z-share-bar` · `z-reactions` (clap/emoji)
- [ ] `z-comment` / `z-comment-thread` · `z-comment-form`
- [ ] `z-newsletter` / `z-subscribe` · `z-bookmark` · `z-follow-button`

**Rich embeds**
- [ ] `z-embed` (responsive iframe) · `z-video-embed` · `z-social-embed` / `z-tweet`
- [ ] `z-lightbox` / `z-image-zoom` · `z-gallery`
- [ ] `z-before-after` (image compare) · `z-audio-player` / `z-podcast-player`

---

## 3. Chat

Split into two tiers. **3a** is a Messenger-complete general chat foundation;
**3b** is purely additive on top of it — the AI app instantiates the *same*
`z-message-list` / `z-composer` / `z-conversation-list` and only swaps in
streaming, tool-calls, thinking, and a model picker. Build 3a first.

### Prerequisites (unblock before either tier)

Chat can't ship without these; pull them forward. See
`docs/foundational-primitives.md` for specs/skeletons.

- [x] `z-virtual-list` — now has a **dynamic (variable) item-height** path
  (`estimate-size`, measured + prefix-summed) alongside the fixed fast path, so
  message rows window correctly. *(scroll-up anchoring polish still TODO.)*
- [x] `z-markdown` *(foundational)* — message text + streaming *(streaming re-parses whole content for now; block-cache TODO)*.
- [x] `z-toolbar` *(foundational)* — composer strip + message hover-actions.
- [x] `z-relative-time` — auto-updating "2m ago" (moved fwd from Dashboards).
- [x] `z-status-dot` / `z-presence-dot` — online/away/dnd/offline (from Dashboards).
- [x] `z-dropzone` — attachments.

---

### 3a. Chat (general) — Messenger / WhatsApp / Slack / iMessage

**Shell & layout**
- [x] `z-chat-shell` — resizable 2/3-pane frame: list | thread | details (composes `z-resizable-panels`)
- [x] `z-resizable-panels` · `z-sidebar` · `z-scroll-area`

**Conversation list (inbox rail)**
- [x] `z-conversation-list` — scrolling rail w/ sticky header slot *(z-virtual-list handoff for huge inboxes TODO)*
- [x] `z-conversation-item` — avatar + name + last-message preview + `z-relative-time` + unread + muted/pinned
- [ ] `z-conversation-search` (composes `z-input`/`z-command`) · `z-new-chat-button`
- [x] `z-tabs` / `z-toggle-group` — folder filters (All / Unread / Groups)

**Thread surface**
- [x] `z-message-list` / `z-thread` — declarative scroll surface w/ pin-to-bottom *(virtual-list handoff for huge histories TODO)*
- [x] `z-message-group` — consecutive messages from one sender under one avatar + name + timestamp
- [ ] `z-message` — side/role aware standalone row *(covered by group + bubble for now)*
- [x] `z-message-bubble` / `z-bubble` — side + grouped-corner radii
- [ ] `z-message-meta` — sender + timestamp + "edited" *(group renders name/timestamp inline for now)*
- [x] `z-date-divider` ("Today"/"Yesterday") · [x] `z-unread-divider` ("New messages")
- [x] `z-system-message` — centered pill ("Alice added Bob")
- [x] `z-typing-indicator` — animated dots *(shared with 3b)*
- [x] `z-delivery-status` — sending/sent/delivered/read/error ticks · [x] `z-read-receipt` — seen-by avatars
- [ ] `z-scroll-to-latest` — jump-to-bottom FAB w/ unread count
- [x] `z-avatar`

**Message content types (payloads in a bubble)**
- [ ] `z-message-text` — composes `z-markdown` (+ linkify, emoji)
- [ ] `z-image-message` / `z-message-gallery` — single + album grid
- [ ] `z-video-message` · `z-voice-message` (waveform + scrub + duration)
- [ ] `z-file-attachment` — icon + name + size + download
- [ ] `z-link-preview` / `z-unfurl` — OG image/title/desc
- [ ] `z-location-message` · `z-contact-card` · `z-sticker` / `z-gif`
- [x] `z-quoted-message` / `z-reply-snippet` — "replying to X" quote (in-bubble or composer)
- [ ] `z-mention-pill` — rendered @mention
- [x] `z-code-block` (Slack/Discord)

**Message interactions**
- [x] `z-message-actions` — hover bar: quick-react/reply/forward/more (role=toolbar)
- [x] `z-reactions` — emoji pills + counts + add · [x] `z-emoji-picker` (categorized + search)
- [ ] `z-pinned-banner` — pinned message at top of thread
- [x] `z-context-menu` — message menu (copy/edit/delete/pin/forward)

**Composer** *(3b extends this)*
- [x] `z-composer` / `z-message-input` — auto-grow textarea + leading/trailing slots + Enter-to-send
- [x] `z-send-button` — idle/send + `is-streaming` stop state *(3b reuses stop)*
- [ ] `z-attachment-tray` + `z-attachment-chip` — staged files (composes `z-dropzone`)
- [ ] `z-emoji-button` · `z-mic-button` (voice notes) · `z-gif-picker`
- [ ] `z-mention` (@) · `z-slash-command` (/) *(shared with 3b)*
- [ ] `z-composer-context-bar` — "Replying to…" / "Editing…" strip
- [ ] `z-formatting-toolbar` — bold/italic (composes `z-toolbar`)

**Header & details**
- [x] `z-chat-header` — avatar + name + presence + trailing actions slot
- [ ] `z-presence-text` — "Active now" / "Last seen 2h ago"
- [ ] `z-conversation-details` — members, shared media, files, mute/settings
- [ ] `z-member-list` / `z-participant-item` (composes `z-virtual-list`)
- [ ] `z-shared-media-grid`

**Presence micro-bits** *(foundational, pulled fwd)*
- [x] `z-status-dot` / `z-presence-dot` · `z-relative-time`
- [x] `z-badge` — unread count

**Channels / groups (Slack/Discord tier — optional)**
- [ ] `z-channel-list` / `z-channel-item` (# name, unread)
- [ ] `z-thread-reply-count` — "3 replies" → side thread

---

### 3b. AI chat (Claude / ChatGPT) — extends 3a

Same list/thread/composer as 3a; adds only the AI differentiators.

- [x] `z-streaming-text` / `z-typewriter` — token reveal + cursor, time-based (throttle-safe); optional markdown mode
- [x] `z-thinking` / `z-reasoning` — collapsible chain-of-thought (shimmer while active; composes `z-collapsible`)
- [x] `z-tool-call` / `z-tool-result` — expandable args + result (status states; composes `z-collapsible` + `z-code-block`)
- [ ] `z-citation` · `z-sources` / `z-references`
- [ ] `z-artifact` — side-panel output (composes `z-resizable-panels` + `z-editor-canvas`)
- [ ] `z-diff` — code diff
- [ ] `z-message-actions` gains retry / 👍👎 / edit-and-resend *(extends 3a)*
- [ ] `z-send-button` gains stop-streaming state *(extends 3a)*
- [ ] composer add-ons: `z-model-picker` · `z-suggestion-chips` · `z-token-counter`
- [ ] session rail: `z-new-chat-button` *(shared)* · `z-prompt-library` · `z-feedback` · `z-agent-step` · `z-task-list` / `z-plan`

---

## 4. Editors (Photoshop / Figma)

**Shell / chrome**
- [ ] `z-editor-shell` — menubar + toolbars + panels + canvas + statusbar
- [ ] `z-menubar` — File / Edit / View app menu
- [ ] `z-toolbar` *(foundational)* + `z-tool-button` / `z-tool-group`
- [ ] `z-panel` (dockable: titlebar / collapse / close) · `z-dock` / `z-panel-group`
- [ ] `z-resizable-panels` *(foundational)*
- [ ] `z-document-tabs` (closeable, dirty dot) · `z-statusbar` · `z-inspector`
- [x] `z-sidebar`

**The canvas**
- [ ] `z-editor-canvas` *(foundational)*
- [ ] `z-ruler` · `z-guides` · `z-grid-overlay`
- [ ] `z-minimap` / `z-navigator` · `z-zoom-controls`
- [ ] `z-marquee` / `z-selection-box` · `z-transform-handles` / `z-bounding-box`
- [ ] `z-smart-guides` / `z-snap-lines` · `z-crop`
- [ ] node editors: `z-node` · `z-edge` / `z-wire` · `z-port` / `z-socket`

**Property controls**
- [x] `z-color-picker`
- [ ] `z-color-swatch` / `z-swatches` · `z-eyedropper` · `z-gradient-editor`
- [ ] `z-number-scrubber` (drag-to-change) · `z-dimension-input` (linked X/Y/W/H)
- [ ] `z-angle-dial` · `z-alignment-control` · `z-box-model` · `z-corner-radius`
- [ ] `z-opacity-slider` · `z-blend-mode-picker` · `z-font-picker` · `z-icon-picker`
- [ ] `z-property-row` (label + control)

**Layers / history / assets**
- [ ] `z-layers` / `z-layer-list` + `z-layer-item` (eye / lock / thumb / drag)
- [ ] `z-tree` *(foundational)* (scene graph) · `z-history-panel`
- [ ] `z-asset-grid` / `z-asset-browser`
- [ ] `z-keyframe-timeline` + `z-track` / `z-keyframe`

---

## 5. Documentation sites

**Shell / nav**
- [ ] `z-docs-shell` — 3-col: nav | content | toc
- [ ] `z-nav-tree` (composes `z-tree`) · `z-toc` (scroll-spy)
- [ ] `z-prev-next` (page footer nav)
- [x] `z-breadcrumbs`
- [ ] `z-version-picker` · `z-language-switcher` · `z-announcement-bar`

**Content**
- [x] `z-callout` (note/warn/tip/danger) · `z-code-block` · `z-terminal` · `z-kbd` · `z-tabs`
- [ ] `z-code-group` / `z-code-tabs` (npm/yarn/pnpm)
- [ ] `z-steps` (numbered instructions)
- [ ] `z-api-table` / `z-property-table` · `z-api-signature` · `z-type-badge`
- [ ] `z-heading-anchor` (# on hover) · `z-file-tree` · `z-diff` · `z-code-annotation`
- [x] `z-accordion` / `z-collapsible` (FAQ)
- [ ] `z-mermaid` / `z-diagram` · `z-playground` / `z-live-code` · `z-sandbox`

**Discovery aids**
- [x] `z-command` (⌘K palette)
- [ ] `z-search-dialog` · `z-copy-button` · `z-external-link` (↗)
- [ ] `z-was-this-helpful` (👍👎) · `z-edit-on-github` · `z-last-updated` · `z-reading-progress`

---

## Suggested sequencing

**Wave 1 — foundational leverage:** `z-resizable-panels`, `z-editor-canvas`,
`z-drag-drop`, `z-tree`, `z-markdown`, `z-toolbar`, `z-virtual-list`. Advances all
five domains at once.

**Wave 2 — pick the domain with the nearest product need**, then fill its shell +
signature elements (e.g. chat → `z-message-list` + `z-message` + `z-composer`; docs →
`z-docs-shell` + `z-toc` + `z-code-group`). For chat, land the §3 prerequisites
(dynamic-height `z-virtual-list`, `z-markdown`, `z-toolbar`, `z-relative-time`,
`z-status-dot`) first, then the 3a thread MVP, then 3b on top.

**Wave 3 — data density:** `z-data-grid`, the chart family, `z-date-*` — the
heaviest builds, worth doing once the primitives they lean on are stable.
