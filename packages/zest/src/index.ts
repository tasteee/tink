import './ink.css'

// A few implementation modules contain closely related elements. Register
// those through their individual entries so the root import still installs the
// complete public surface without coupling the package subpath imports.
import './elements/z-heading'
import './elements/z-menu'
import './elements/z-menu-item'
import './elements/z-menu-separator'
import './elements/z-tabs'
import './elements/z-tab'
import './elements/z-command'
import './elements/z-command-item'
import './elements/z-subheading'
import './elements/z-text'
import './elements/z-label'
import './elements/z-inline'
import './elements/z-draggable'
import './elements/z-drop-target'
import './elements/z-drag-handle'
import './elements/z-drop-indicator'
import './elements/z-table-toolbar'
import './elements/z-table-axis-handle'
import './elements/z-comment-mark'
import './elements/z-comment-gutter-icon'
import './elements/z-comment-thread-panel'

// Foundation
export * from './components/z-box'
export * from './components/z-text'
export * from './components/z-display'
export * from './components/z-eyebrow'
export * from './components/z-card'
export * from './components/z-separator'
export * from './components/z-line'

// Layout primitives
export * from './components/z-row'
export * from './components/z-column'
export * from './components/z-grid'
export * from './components/z-bento-grid'
export * from './components/z-bento-item'
export * from './components/z-center'
export * from './components/z-container'
export * from './components/z-section'
export * from './components/z-surface'
export * from './components/z-scroll'
export * from './components/z-spacer'
export * from './components/z-chassis'
export * from './components/z-drag-drop'
export * from './components/z-sortable'
export * from './components/z-dropzone'
export * from './components/z-tree'

// Buttons & actions
export * from './components/z-button'
export * from './components/z-button-group'
export * from './components/z-toggle-button'
export * from './components/z-toggle-button-group'
export * from './components/z-toggle-button-group-item'
export * from './components/z-toolbar'
export * from './components/z-toolbar-group'
export * from './components/z-swap'
export * from './components/z-link'
export * from './components/z-theme-switcher'

// The theme state behind z-theme-switcher, exported so an app can read or set
// the theme from its own chrome without rendering a switcher.
export * from './shared/theme'

// The clipboard primitive behind z-code-block, exported so an app can copy
// from its own affordances.
export * from './shared/clipboard'

// The strings zest says on its own, replaceable once per app: setLocale({ close: 'Fermer' }).
export { setLocale, getLocale, englishStrings } from './shared/locale'
export type { LocaleStringsT, LocaleKeyT } from './shared/locale'

// Form controls
export * from './components/z-field'
export * from './components/z-input'
export * from './components/z-number-input'
export * from './components/z-textarea'
export * from './components/z-checkbox'
export * from './components/z-switch'
export * from './components/z-radio'
export * from './components/z-radio-group'
export * from './components/z-slider'
export * from './components/z-range'
export * from './components/z-select'
export * from './components/z-combobox'
export * from './components/z-filter'
export * from './components/z-color-picker'
export * from './components/z-input-otp'

// Data display
export * from './components/z-badge'
export * from './components/z-avatar'
export * from './components/z-avatar-stack'
export * from './components/z-progress'
export * from './components/z-skeleton'
export * from './components/z-table'
export * from './components/z-pagination'
export * from './components/z-stat'
export * from './components/z-relative-time'
export * from './components/z-status-dot'
export * from './components/z-kbd'
export * from './components/z-list'
export * from './components/z-list-row'

// Navigation & disclosure
export * from './components/z-breadcrumbs'
export * from './components/z-tabs'
export * from './components/z-collapsible'
export * from './components/z-accordion'
export * from './components/z-menu'
export * from './components/z-nav-menu'
export * from './components/z-sidebar'
export * from './components/z-dock'
export * from './components/z-dock-item'

// Overlays
export * from './components/z-tooltip'
export * from './components/z-popover'
export * from './components/z-hover-card'
export * from './components/z-dialog'
export * from './components/z-alert-dialog'
export * from './components/z-alert'
export * from './components/z-sheet'
export * from './components/z-drawer'
export * from './components/z-context-menu'
export * from './components/z-toaster'
export * from './components/z-command'


// Specialized
export * from './components/z-callout'
export * from './components/z-empty-state'
export * from './components/z-scroll-area'
export * from './components/z-code-block'
export * from './components/z-carousel'
export * from './components/z-marquee'
export * from './components/z-pointer-follow'

// Music / MIDI

// Text editor
export * from './components/z-selection-toolbar'
export * from './components/z-gutter-handle'
export * from './components/z-slash-menu'
export * from './components/z-mention-popover'
export * from './components/z-format-toolbar'
export * from './components/z-bubble-menu'
export * from './components/z-drag-handle'
export * from './components/z-table-toolbar'
export * from './components/z-comment-thread'
export * from './components/z-status-bar'
