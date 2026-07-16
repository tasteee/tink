import type { ComponentType } from 'react'

// Foundations
import { ZBoxDoc } from '@app/docs/components/z-box'
import { ZDisplayDoc } from '@app/docs/components/z-display'
import { ZEyebrowDoc } from '@app/docs/components/z-eyebrow'
import { ZRowDoc } from '@app/docs/components/z-row'
import { ZColumnDoc } from '@app/docs/components/z-column'
import { ZTextDoc } from '@app/docs/components/z-text'
import { ZHeadingDoc } from '@app/docs/components/z-heading'
import { ZSubheadingDoc } from '@app/docs/components/z-subheading'
import { ZLabelDoc } from '@app/docs/components/z-label'
import { ZInlineDoc } from '@app/docs/components/z-inline'
import { ZCardDoc } from '@app/docs/components/z-card'
import { ZLineDoc } from '@app/docs/components/z-line'
import { ZSeparatorDoc } from '@app/docs/components/z-separator'
import { ZStackDoc } from '@app/docs/components/z-stack'
import { ZGridDoc } from '@app/docs/components/z-grid'
import { ZBentoGridDoc } from '@app/docs/components/z-bento-grid'
import { ZBentoItemDoc } from '@app/docs/components/z-bento-item'
import { ZClusterDoc } from '@app/docs/components/z-cluster'
import { ZCenterDoc } from '@app/docs/components/z-center'
import { ZContainerDoc } from '@app/docs/components/z-container'
import { ZSectionDoc } from '@app/docs/components/z-section'
import { ZSurfaceDoc } from '@app/docs/components/z-surface'
import { ZScrollDoc } from '@app/docs/components/z-scroll'
import { ZSpacerDoc } from '@app/docs/components/z-spacer'
import { ZChassisDoc } from '@app/docs/components/z-chassis'
import { ZResizablePanelsDoc } from '@app/docs/components/z-resizable-panels'
import { ZPanelDoc } from '@app/docs/components/z-panel'
import { ZPanelHandleDoc } from '@app/docs/components/z-panel-handle'
import { ZEditorCanvasDoc } from '@app/docs/components/z-editor-canvas'
import { ZCanvasItemDoc } from '@app/docs/components/z-canvas-item'

// Actions
import { ZButtonDoc } from '@app/docs/components/z-button'
import { ZButtonGroupDoc } from '@app/docs/components/z-button-group'
import { ZToggleDoc } from '@app/docs/components/z-toggle'
import { ZToggleGroupDoc } from '@app/docs/components/z-toggle-group'
import { ZToggleGroupItemDoc } from '@app/docs/components/z-toggle-group-item'
import { ZToolbarDoc } from '@app/docs/components/z-toolbar'
import { ZToolbarGroupDoc } from '@app/docs/components/z-toolbar-group'
import { ZSwapDoc } from '@app/docs/components/z-swap'
import { ZLinkDoc } from '@app/docs/components/z-link'

// Forms
import { ZInputDoc } from '@app/docs/components/z-input'
import { ZTextareaDoc } from '@app/docs/components/z-textarea'
import { ZCheckboxDoc } from '@app/docs/components/z-checkbox'
import { ZSwitchDoc } from '@app/docs/components/z-switch'
import { ZRadioDoc } from '@app/docs/components/z-radio'
import { ZRadioGroupDoc } from '@app/docs/components/z-radio-group'
import { ZSliderDoc } from '@app/docs/components/z-slider'
import { ZRangeDoc } from '@app/docs/components/z-range'
import { ZRangeHandleDoc } from '@app/docs/components/z-range-handle'
import { ZSelectDoc } from '@app/docs/components/z-select'
import { ZComboboxDoc } from '@app/docs/components/z-combobox'
import { ZFilterDoc } from '@app/docs/components/z-filter'
import { ZColorPickerDoc } from '@app/docs/components/z-color-picker'
import { ZInputOtpDoc } from '@app/docs/components/z-input-otp'

// Data Display
import { ZBadgeDoc } from '@app/docs/components/z-badge'
import { ZAvatarDoc } from '@app/docs/components/z-avatar'
import { ZAvatarStackDoc } from '@app/docs/components/z-avatar-stack'
import { ZProgressDoc } from '@app/docs/components/z-progress'
import { ZSkeletonDoc } from '@app/docs/components/z-skeleton'
import { ZTableDoc } from '@app/docs/components/z-table'
import { ZPaginationDoc } from '@app/docs/components/z-pagination'
import { ZStatDoc } from '@app/docs/components/z-stat'
import { ZRelativeTimeDoc } from '@app/docs/components/z-relative-time'
import { ZStatusDotDoc } from '@app/docs/components/z-status-dot'
import { ZKbdDoc } from '@app/docs/components/z-kbd'
import { ZListDoc } from '@app/docs/components/z-list'
import { ZListRowDoc } from '@app/docs/components/z-list-row'
import { ZTreeDoc } from '@app/docs/components/z-tree'
import { ZVirtualListDoc } from '@app/docs/components/z-virtual-list'

// Navigation
import { ZBreadcrumbsDoc } from '@app/docs/components/z-breadcrumbs'
import { ZTabsDoc } from '@app/docs/components/z-tabs'
import { ZCollapsibleDoc } from '@app/docs/components/z-collapsible'
import { ZAccordionDoc } from '@app/docs/components/z-accordion'
import { ZMenuDoc } from '@app/docs/components/z-menu'
import { ZNavMenuDoc } from '@app/docs/components/z-nav-menu'
import { ZSidebarDoc } from '@app/docs/components/z-sidebar'
import { ZDockDoc } from '@app/docs/components/z-dock'
import { ZDockItemDoc } from '@app/docs/components/z-dock-item'

// Overlays
import { ZTooltipDoc } from '@app/docs/components/z-tooltip'
import { ZPopoverDoc } from '@app/docs/components/z-popover'
import { ZHoverCardDoc } from '@app/docs/components/z-hover-card'
import { ZDialogDoc } from '@app/docs/components/z-dialog'
import { ZAlertDialogDoc } from '@app/docs/components/z-alert-dialog'
import { ZAlertDoc } from '@app/docs/components/z-alert'
import { ZSheetDoc } from '@app/docs/components/z-sheet'
import { ZDrawerDoc } from '@app/docs/components/z-drawer'
import { ZContextMenuDoc } from '@app/docs/components/z-context-menu'
import { ZToastDoc } from '@app/docs/components/z-toast'
import { ZCommandDoc } from '@app/docs/components/z-command'

// Specialized
import { ZCalloutDoc } from '@app/docs/components/z-callout'
import { ZEmptyStateDoc } from '@app/docs/components/z-empty-state'
import { ZScrollAreaDoc } from '@app/docs/components/z-scroll-area'
import { ZCodeBlockDoc } from '@app/docs/components/z-code-block'
import { ZMarkdownDoc } from '@app/docs/components/z-markdown'
import { ZTerminalDoc } from '@app/docs/components/z-terminal'
import { ZPostMetaDoc } from '@app/docs/components/z-post-meta'
import { ZCarouselDoc } from '@app/docs/components/z-carousel'
import { ZChartDoc } from '@app/docs/components/z-chart'
import { ZAuraDoc } from '@app/docs/components/z-aura'
import { ZMarqueeDoc } from '@app/docs/components/z-marquee'
import { ZProgressiveBlurDoc } from '@app/docs/components/z-progressive-blur'
import { ZPointerFollowDoc } from '@app/docs/components/z-pointer-follow'
import { ZDraggableDoc } from '@app/docs/components/z-draggable'
import { ZDropTargetDoc } from '@app/docs/components/z-drop-target'
import { ZSortableDoc } from '@app/docs/components/z-sortable'
import { ZDropzoneDoc } from '@app/docs/components/z-dropzone'
import { ZPianoRollDoc } from '@app/docs/components/z-piano-roll'
import { ZPatternRollDoc } from '@app/docs/components/z-pattern-roll'

// Chat
import { ZChatShellDoc } from '@app/docs/components/z-chat-shell'
import { ZChatHeaderDoc } from '@app/docs/components/z-chat-header'
import { ZConversationListDoc } from '@app/docs/components/z-conversation-list'
import { ZConversationItemDoc } from '@app/docs/components/z-conversation-item'
import { ZMessageListDoc } from '@app/docs/components/z-message-list'
import { ZMessageGroupDoc } from '@app/docs/components/z-message-group'
import { ZMessageBubbleDoc } from '@app/docs/components/z-message-bubble'
import { ZMessageActionsDoc } from '@app/docs/components/z-message-actions'
import { ZReactionsDoc } from '@app/docs/components/z-reactions'
import { ZEmojiPickerDoc } from '@app/docs/components/z-emoji-picker'
import { ZDateDividerDoc } from '@app/docs/components/z-date-divider'
import { ZUnreadDividerDoc } from '@app/docs/components/z-unread-divider'
import { ZSystemMessageDoc } from '@app/docs/components/z-system-message'
import { ZDeliveryStatusDoc } from '@app/docs/components/z-delivery-status'
import { ZReadReceiptDoc } from '@app/docs/components/z-read-receipt'
import { ZQuotedMessageDoc } from '@app/docs/components/z-quoted-message'
import { ZFileAttachmentDoc } from '@app/docs/components/z-file-attachment'
import { ZImageMessageDoc } from '@app/docs/components/z-image-message'
import { ZAttachmentChipDoc } from '@app/docs/components/z-attachment-chip'
import { ZAttachmentTrayDoc } from '@app/docs/components/z-attachment-tray'
import { ZTypingIndicatorDoc } from '@app/docs/components/z-typing-indicator'
import { ZComposerDoc } from '@app/docs/components/z-composer'
import { ZSendButtonDoc } from '@app/docs/components/z-send-button'
import { ZStreamingTextDoc } from '@app/docs/components/z-streaming-text'
import { ZThinkingDoc } from '@app/docs/components/z-thinking'
import { ZToolCallDoc } from '@app/docs/components/z-tool-call'
import { ZCitationDoc } from '@app/docs/components/z-citation'
import { ZSourcesDoc } from '@app/docs/components/z-sources'
import { ZSuggestionChipsDoc } from '@app/docs/components/z-suggestion-chips'
import { ZModelPickerDoc } from '@app/docs/components/z-model-picker'

export type ComponentDocEntry = {
	slug: string
	category: 'Foundations' | 'Layout' | 'Actions' | 'Forms' | 'Data Display' | 'Navigation' | 'Overlays' | 'Specialized' | 'Chat'
	Component: ComponentType
}

// The single source of truth for both /docs/components/* routing (Docs.tsx)
// and the sidebar's Components groups (DocsLayout.tsx) — one page per z-element.
export const COMPONENT_MANIFEST: ComponentDocEntry[] = [
	// Foundations
	{ slug: 'z-box', category: 'Foundations', Component: ZBoxDoc },
	{ slug: 'z-display', category: 'Foundations', Component: ZDisplayDoc },
	{ slug: 'z-eyebrow', category: 'Foundations', Component: ZEyebrowDoc },
	{ slug: 'z-row', category: 'Layout', Component: ZRowDoc },
	{ slug: 'z-column', category: 'Layout', Component: ZColumnDoc },
	{ slug: 'z-text', category: 'Foundations', Component: ZTextDoc },
	{ slug: 'z-heading', category: 'Foundations', Component: ZHeadingDoc },
	{ slug: 'z-subheading', category: 'Foundations', Component: ZSubheadingDoc },
	{ slug: 'z-label', category: 'Foundations', Component: ZLabelDoc },
	{ slug: 'z-inline', category: 'Foundations', Component: ZInlineDoc },
	{ slug: 'z-card', category: 'Foundations', Component: ZCardDoc },
	{ slug: 'z-line', category: 'Foundations', Component: ZLineDoc },
	{ slug: 'z-separator', category: 'Foundations', Component: ZSeparatorDoc },

	// Layout
	{ slug: 'z-stack', category: 'Layout', Component: ZStackDoc },
	{ slug: 'z-grid', category: 'Layout', Component: ZGridDoc },
	{ slug: 'z-bento-grid', category: 'Layout', Component: ZBentoGridDoc },
	{ slug: 'z-bento-item', category: 'Layout', Component: ZBentoItemDoc },
	{ slug: 'z-cluster', category: 'Layout', Component: ZClusterDoc },
	{ slug: 'z-center', category: 'Layout', Component: ZCenterDoc },
	{ slug: 'z-container', category: 'Layout', Component: ZContainerDoc },
	{ slug: 'z-section', category: 'Layout', Component: ZSectionDoc },
	{ slug: 'z-surface', category: 'Layout', Component: ZSurfaceDoc },
	{ slug: 'z-scroll', category: 'Layout', Component: ZScrollDoc },
	{ slug: 'z-spacer', category: 'Layout', Component: ZSpacerDoc },
	{ slug: 'z-chassis', category: 'Layout', Component: ZChassisDoc },
	{ slug: 'z-resizable-panels', category: 'Layout', Component: ZResizablePanelsDoc },
	{ slug: 'z-panel', category: 'Layout', Component: ZPanelDoc },
	{ slug: 'z-panel-handle', category: 'Layout', Component: ZPanelHandleDoc },
	{ slug: 'z-editor-canvas', category: 'Layout', Component: ZEditorCanvasDoc },
	{ slug: 'z-canvas-item', category: 'Layout', Component: ZCanvasItemDoc },

	// Actions
	{ slug: 'z-button', category: 'Actions', Component: ZButtonDoc },
	{ slug: 'z-button-group', category: 'Actions', Component: ZButtonGroupDoc },
	{ slug: 'z-toggle', category: 'Actions', Component: ZToggleDoc },
	{ slug: 'z-toggle-group', category: 'Actions', Component: ZToggleGroupDoc },
	{ slug: 'z-toggle-group-item', category: 'Actions', Component: ZToggleGroupItemDoc },
	{ slug: 'z-toolbar', category: 'Actions', Component: ZToolbarDoc },
	{ slug: 'z-toolbar-group', category: 'Actions', Component: ZToolbarGroupDoc },
	{ slug: 'z-swap', category: 'Actions', Component: ZSwapDoc },
	{ slug: 'z-link', category: 'Actions', Component: ZLinkDoc },

	// Forms
	{ slug: 'z-input', category: 'Forms', Component: ZInputDoc },
	{ slug: 'z-textarea', category: 'Forms', Component: ZTextareaDoc },
	{ slug: 'z-checkbox', category: 'Forms', Component: ZCheckboxDoc },
	{ slug: 'z-switch', category: 'Forms', Component: ZSwitchDoc },
	{ slug: 'z-radio', category: 'Forms', Component: ZRadioDoc },
	{ slug: 'z-radio-group', category: 'Forms', Component: ZRadioGroupDoc },
	{ slug: 'z-slider', category: 'Forms', Component: ZSliderDoc },
	{ slug: 'z-range', category: 'Forms', Component: ZRangeDoc },
	{ slug: 'z-range-handle', category: 'Forms', Component: ZRangeHandleDoc },
	{ slug: 'z-select', category: 'Forms', Component: ZSelectDoc },
	{ slug: 'z-combobox', category: 'Forms', Component: ZComboboxDoc },
	{ slug: 'z-filter', category: 'Forms', Component: ZFilterDoc },
	{ slug: 'z-color-picker', category: 'Forms', Component: ZColorPickerDoc },
	{ slug: 'z-input-otp', category: 'Forms', Component: ZInputOtpDoc },

	// Data Display
	{ slug: 'z-badge', category: 'Data Display', Component: ZBadgeDoc },
	{ slug: 'z-avatar', category: 'Data Display', Component: ZAvatarDoc },
	{ slug: 'z-avatar-stack', category: 'Data Display', Component: ZAvatarStackDoc },
	{ slug: 'z-progress', category: 'Data Display', Component: ZProgressDoc },
	{ slug: 'z-skeleton', category: 'Data Display', Component: ZSkeletonDoc },
	{ slug: 'z-table', category: 'Data Display', Component: ZTableDoc },
	{ slug: 'z-pagination', category: 'Data Display', Component: ZPaginationDoc },
	{ slug: 'z-stat', category: 'Data Display', Component: ZStatDoc },
	{ slug: 'z-relative-time', category: 'Data Display', Component: ZRelativeTimeDoc },
	{ slug: 'z-status-dot', category: 'Data Display', Component: ZStatusDotDoc },
	{ slug: 'z-kbd', category: 'Data Display', Component: ZKbdDoc },
	{ slug: 'z-list', category: 'Data Display', Component: ZListDoc },
	{ slug: 'z-list-row', category: 'Data Display', Component: ZListRowDoc },
	{ slug: 'z-tree', category: 'Data Display', Component: ZTreeDoc },
	{ slug: 'z-virtual-list', category: 'Data Display', Component: ZVirtualListDoc },

	// Navigation
	{ slug: 'z-breadcrumbs', category: 'Navigation', Component: ZBreadcrumbsDoc },
	{ slug: 'z-tabs', category: 'Navigation', Component: ZTabsDoc },
	{ slug: 'z-collapsible', category: 'Navigation', Component: ZCollapsibleDoc },
	{ slug: 'z-accordion', category: 'Navigation', Component: ZAccordionDoc },
	{ slug: 'z-menu', category: 'Navigation', Component: ZMenuDoc },
	{ slug: 'z-nav-menu', category: 'Navigation', Component: ZNavMenuDoc },
	{ slug: 'z-sidebar', category: 'Navigation', Component: ZSidebarDoc },
	{ slug: 'z-dock', category: 'Navigation', Component: ZDockDoc },
	{ slug: 'z-dock-item', category: 'Navigation', Component: ZDockItemDoc },

	// Overlays
	{ slug: 'z-tooltip', category: 'Overlays', Component: ZTooltipDoc },
	{ slug: 'z-popover', category: 'Overlays', Component: ZPopoverDoc },
	{ slug: 'z-hover-card', category: 'Overlays', Component: ZHoverCardDoc },
	{ slug: 'z-dialog', category: 'Overlays', Component: ZDialogDoc },
	{ slug: 'z-alert-dialog', category: 'Overlays', Component: ZAlertDialogDoc },
	{ slug: 'z-alert', category: 'Overlays', Component: ZAlertDoc },
	{ slug: 'z-sheet', category: 'Overlays', Component: ZSheetDoc },
	{ slug: 'z-drawer', category: 'Overlays', Component: ZDrawerDoc },
	{ slug: 'z-context-menu', category: 'Overlays', Component: ZContextMenuDoc },
	{ slug: 'z-toast', category: 'Overlays', Component: ZToastDoc },
	{ slug: 'z-command', category: 'Overlays', Component: ZCommandDoc },

	// Specialized
	{ slug: 'z-callout', category: 'Specialized', Component: ZCalloutDoc },
	{ slug: 'z-empty-state', category: 'Specialized', Component: ZEmptyStateDoc },
	{ slug: 'z-scroll-area', category: 'Specialized', Component: ZScrollAreaDoc },
	{ slug: 'z-code-block', category: 'Specialized', Component: ZCodeBlockDoc },
	{ slug: 'z-markdown', category: 'Specialized', Component: ZMarkdownDoc },
	{ slug: 'z-terminal', category: 'Specialized', Component: ZTerminalDoc },
	{ slug: 'z-post-meta', category: 'Specialized', Component: ZPostMetaDoc },
	{ slug: 'z-carousel', category: 'Specialized', Component: ZCarouselDoc },
	{ slug: 'z-chart', category: 'Specialized', Component: ZChartDoc },
	{ slug: 'z-aura', category: 'Specialized', Component: ZAuraDoc },
	{ slug: 'z-marquee', category: 'Specialized', Component: ZMarqueeDoc },
	{ slug: 'z-progressive-blur', category: 'Specialized', Component: ZProgressiveBlurDoc },
	{ slug: 'z-pointer-follow', category: 'Specialized', Component: ZPointerFollowDoc },
	{ slug: 'z-draggable', category: 'Specialized', Component: ZDraggableDoc },
	{ slug: 'z-drop-target', category: 'Specialized', Component: ZDropTargetDoc },
	{ slug: 'z-sortable', category: 'Specialized', Component: ZSortableDoc },
	{ slug: 'z-dropzone', category: 'Specialized', Component: ZDropzoneDoc },
	{ slug: 'z-piano-roll', category: 'Specialized', Component: ZPianoRollDoc },
	{ slug: 'z-pattern-roll', category: 'Specialized', Component: ZPatternRollDoc },

	// Chat
	{ slug: 'z-chat-shell', category: 'Chat', Component: ZChatShellDoc },
	{ slug: 'z-chat-header', category: 'Chat', Component: ZChatHeaderDoc },
	{ slug: 'z-conversation-list', category: 'Chat', Component: ZConversationListDoc },
	{ slug: 'z-conversation-item', category: 'Chat', Component: ZConversationItemDoc },
	{ slug: 'z-message-list', category: 'Chat', Component: ZMessageListDoc },
	{ slug: 'z-message-group', category: 'Chat', Component: ZMessageGroupDoc },
	{ slug: 'z-message-bubble', category: 'Chat', Component: ZMessageBubbleDoc },
	{ slug: 'z-message-actions', category: 'Chat', Component: ZMessageActionsDoc },
	{ slug: 'z-reactions', category: 'Chat', Component: ZReactionsDoc },
	{ slug: 'z-emoji-picker', category: 'Chat', Component: ZEmojiPickerDoc },
	{ slug: 'z-date-divider', category: 'Chat', Component: ZDateDividerDoc },
	{ slug: 'z-unread-divider', category: 'Chat', Component: ZUnreadDividerDoc },
	{ slug: 'z-system-message', category: 'Chat', Component: ZSystemMessageDoc },
	{ slug: 'z-delivery-status', category: 'Chat', Component: ZDeliveryStatusDoc },
	{ slug: 'z-read-receipt', category: 'Chat', Component: ZReadReceiptDoc },
	{ slug: 'z-quoted-message', category: 'Chat', Component: ZQuotedMessageDoc },
	{ slug: 'z-file-attachment', category: 'Chat', Component: ZFileAttachmentDoc },
	{ slug: 'z-image-message', category: 'Chat', Component: ZImageMessageDoc },
	{ slug: 'z-attachment-chip', category: 'Chat', Component: ZAttachmentChipDoc },
	{ slug: 'z-attachment-tray', category: 'Chat', Component: ZAttachmentTrayDoc },
	{ slug: 'z-typing-indicator', category: 'Chat', Component: ZTypingIndicatorDoc },
	{ slug: 'z-composer', category: 'Chat', Component: ZComposerDoc },
	{ slug: 'z-send-button', category: 'Chat', Component: ZSendButtonDoc },
	{ slug: 'z-streaming-text', category: 'Chat', Component: ZStreamingTextDoc },
	{ slug: 'z-thinking', category: 'Chat', Component: ZThinkingDoc },
	{ slug: 'z-tool-call', category: 'Chat', Component: ZToolCallDoc },
	{ slug: 'z-citation', category: 'Chat', Component: ZCitationDoc },
	{ slug: 'z-sources', category: 'Chat', Component: ZSourcesDoc },
	{ slug: 'z-suggestion-chips', category: 'Chat', Component: ZSuggestionChipsDoc },
	{ slug: 'z-model-picker', category: 'Chat', Component: ZModelPickerDoc }
]
