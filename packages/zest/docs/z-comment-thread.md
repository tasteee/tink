# z-comment-thread

Three small elements for inline comments/annotations: `z-comment-mark` (the
inline highlight), `z-comment-gutter-icon` (a teleporting gutter marker), and
`z-comment-thread-panel` (a docked right-side panel). Positions must come from
your own decoration mapping (ProseMirror decorations, a CodeMirror mark, etc.)
rather than raw character offsets — offsets shift under concurrent edits,
decorations don't.

```html
<z-comment-mark thread-id="t1">commented text</z-comment-mark>
<z-comment-gutter-icon></z-comment-gutter-icon>
<z-comment-thread-panel></z-comment-thread-panel>
```

```js
document.querySelectorAll('z-comment-mark').forEach((mark) => {
  mark.addEventListener('activate', (e) => openThread(e.detail.threadId))
})

const gutterIcon = document.querySelector('z-comment-gutter-icon')
gutterIcon.threadId = 't1'
gutterIcon.count = thread.messages.length
gutterIcon.anchorRect = decorationRectForLine(currentLine) // from your mapping
gutterIcon.isOpen = true
gutterIcon.addEventListener('open', (e) => openThread(e.detail.threadId))

const panel = document.querySelector('z-comment-thread-panel')
panel.threads = threads // [{ id, messages: [{ author, text, time }], isResolved }]
panel.activeThreadId = 't1'
panel.addEventListener('select', (e) => (panel.activeThreadId = e.detail.threadId))
panel.addEventListener('reply', (e) => addReply(e.detail.threadId, e.detail.text))
panel.addEventListener('resolve', (e) => resolveThread(e.detail.threadId))
panel.addEventListener('close', () => hidePanel())
```

## z-comment-mark

Wrap commented text inline with it.

### Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `thread-id` | string | — | which thread this range belongs to |
| `is-active` | boolean | — | highlight as the currently open thread |
| `is-resolved` | boolean | — | dim, resolved styling |

### Events

| Event | `detail` | Description |
| --- | --- | --- |
| `activate` | `{ threadId }` | the marked text was clicked |

## z-comment-gutter-icon

A teleporting singleton, same shape as `z-gutter-handle`.

### Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `thread-id` | string | — | thread this icon currently represents |
| `is-active` | boolean | — | its thread is the open one |
| `is-open` | boolean | — | show/hide |

### Properties

- `anchorRect` — the line/decoration's rect
- `count` — comment count shown as a badge

### Events

| Event | `detail` | Description |
| --- | --- | --- |
| `open` | `{ threadId }` | icon clicked |

## z-comment-thread-panel

A docked panel, not a floating overlay — size it via layout (`width`, flex
context), not `anchorRect`.

### Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `active-thread-id` | string | — | which thread shows its reply box |
| `is-hidden` | boolean | — | hide the whole panel |

### Properties

- `threads` — `{ id, messages?: { author?, text?, time? }[], isResolved? }[]`

### Events

| Event | `detail` | Description |
| --- | --- | --- |
| `select` | `{ threadId }` | a thread card was clicked |
| `reply` | `{ threadId, text }` | reply submitted |
| `resolve` | `{ threadId }` | resolve button pressed |
| `close` | — | close button pressed |
