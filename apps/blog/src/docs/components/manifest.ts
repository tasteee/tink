import type { ComponentType } from 'react'

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

import { ZButtonDoc } from '@app/docs/components/z-button'
import { ZButtonGroupDoc } from '@app/docs/components/z-button-group'
import { ZToggleDoc } from '@app/docs/components/z-toggle'
import { ZToggleGroupDoc } from '@app/docs/components/z-toggle-group'
import { ZToggleGroupItemDoc } from '@app/docs/components/z-toggle-group-item'
import { ZToolbarDoc } from '@app/docs/components/z-toolbar'
import { ZToolbarGroupDoc } from '@app/docs/components/z-toolbar-group'
import { ZSwapDoc } from '@app/docs/components/z-swap'
import { ZLinkDoc } from '@app/docs/components/z-link'

import { ZFieldDoc } from '@app/docs/components/z-field'
import { ZInputDoc } from '@app/docs/components/z-input'
import { ZNumberInputDoc } from '@app/docs/components/z-number-input'
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

import { ZBreadcrumbsDoc } from '@app/docs/components/z-breadcrumbs'
import { ZTabsDoc } from '@app/docs/components/z-tabs'
import { ZCollapsibleDoc } from '@app/docs/components/z-collapsible'
import { ZAccordionDoc } from '@app/docs/components/z-accordion'
import { ZMenuDoc } from '@app/docs/components/z-menu'
import { ZNavMenuDoc } from '@app/docs/components/z-nav-menu'
import { ZSidebarDoc } from '@app/docs/components/z-sidebar'
import { ZDockDoc } from '@app/docs/components/z-dock'
import { ZDockItemDoc } from '@app/docs/components/z-dock-item'

import { ZTooltipDoc } from '@app/docs/components/z-tooltip'
import { ZPopoverDoc } from '@app/docs/components/z-popover'
import { ZHoverCardDoc } from '@app/docs/components/z-hover-card'
import { ZDialogDoc } from '@app/docs/components/z-dialog'
import { ZAlertDialogDoc } from '@app/docs/components/z-alert-dialog'
import { ZAlertDoc } from '@app/docs/components/z-alert'
import { ZSheetDoc } from '@app/docs/components/z-sheet'
import { ZDrawerDoc } from '@app/docs/components/z-drawer'
import { ZContextMenuDoc } from '@app/docs/components/z-context-menu'
import { ZToasterDoc } from '@app/docs/components/z-toaster'
import { ZCommandDoc } from '@app/docs/components/z-command'

import { ZCalloutDoc } from '@app/docs/components/z-callout'
import { ZEmptyStateDoc } from '@app/docs/components/z-empty-state'
import { ZScrollAreaDoc } from '@app/docs/components/z-scroll-area'
import { ZCodeBlockDoc } from '@app/docs/components/z-code-block'
import { ZMarkdownDoc } from '@app/docs/components/z-markdown'
import { ZTerminalDoc } from '@app/docs/components/z-terminal'
import { ZPostMetaDoc } from '@app/docs/components/z-post-meta'
import { ZCarouselDoc } from '@app/docs/components/z-carousel'
import { ZChartDoc } from '@app/docs/components/z-chart'
import { ZMarqueeDoc } from '@app/docs/components/z-marquee'
import { ZProgressiveBlurDoc } from '@app/docs/components/z-progressive-blur'
import { ZPointerFollowDoc } from '@app/docs/components/z-pointer-follow'
import { ZDraggableDoc } from '@app/docs/components/z-draggable'
import { ZDropTargetDoc } from '@app/docs/components/z-drop-target'
import { ZSortableDoc } from '@app/docs/components/z-sortable'
import { ZDropzoneDoc } from '@app/docs/components/z-dropzone'

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

// slug → page component for every element doc. Which of them are listed (and
// routed) is decided by the Elements navigation in docs/nav.ts; chat elements
// are kept here but currently de-listed.
export const ELEMENT_DOCS: Record<string, ComponentType> = {
	'z-box': ZBoxDoc,
	'z-display': ZDisplayDoc,
	'z-eyebrow': ZEyebrowDoc,
	'z-row': ZRowDoc,
	'z-column': ZColumnDoc,
	'z-text': ZTextDoc,
	'z-heading': ZHeadingDoc,
	'z-subheading': ZSubheadingDoc,
	'z-label': ZLabelDoc,
	'z-inline': ZInlineDoc,
	'z-card': ZCardDoc,
	'z-line': ZLineDoc,
	'z-separator': ZSeparatorDoc,
	'z-stack': ZStackDoc,
	'z-grid': ZGridDoc,
	'z-bento-grid': ZBentoGridDoc,
	'z-bento-item': ZBentoItemDoc,
	'z-cluster': ZClusterDoc,
	'z-center': ZCenterDoc,
	'z-container': ZContainerDoc,
	'z-section': ZSectionDoc,
	'z-surface': ZSurfaceDoc,
	'z-scroll': ZScrollDoc,
	'z-spacer': ZSpacerDoc,
	'z-chassis': ZChassisDoc,
	'z-resizable-panels': ZResizablePanelsDoc,
	'z-panel': ZPanelDoc,
	'z-panel-handle': ZPanelHandleDoc,
	'z-editor-canvas': ZEditorCanvasDoc,
	'z-canvas-item': ZCanvasItemDoc,
	'z-button': ZButtonDoc,
	'z-button-group': ZButtonGroupDoc,
	'z-toggle': ZToggleDoc,
	'z-toggle-group': ZToggleGroupDoc,
	'z-toggle-group-item': ZToggleGroupItemDoc,
	'z-toolbar': ZToolbarDoc,
	'z-toolbar-group': ZToolbarGroupDoc,
	'z-swap': ZSwapDoc,
	'z-link': ZLinkDoc,
	'z-field': ZFieldDoc,
	'z-input': ZInputDoc,
	'z-number-input': ZNumberInputDoc,
	'z-textarea': ZTextareaDoc,
	'z-checkbox': ZCheckboxDoc,
	'z-switch': ZSwitchDoc,
	'z-radio': ZRadioDoc,
	'z-radio-group': ZRadioGroupDoc,
	'z-slider': ZSliderDoc,
	'z-range': ZRangeDoc,
	'z-range-handle': ZRangeHandleDoc,
	'z-select': ZSelectDoc,
	'z-combobox': ZComboboxDoc,
	'z-filter': ZFilterDoc,
	'z-color-picker': ZColorPickerDoc,
	'z-input-otp': ZInputOtpDoc,
	'z-badge': ZBadgeDoc,
	'z-avatar': ZAvatarDoc,
	'z-avatar-stack': ZAvatarStackDoc,
	'z-progress': ZProgressDoc,
	'z-skeleton': ZSkeletonDoc,
	'z-table': ZTableDoc,
	'z-pagination': ZPaginationDoc,
	'z-stat': ZStatDoc,
	'z-relative-time': ZRelativeTimeDoc,
	'z-status-dot': ZStatusDotDoc,
	'z-kbd': ZKbdDoc,
	'z-list': ZListDoc,
	'z-list-row': ZListRowDoc,
	'z-tree': ZTreeDoc,
	'z-virtual-list': ZVirtualListDoc,
	'z-breadcrumbs': ZBreadcrumbsDoc,
	'z-tabs': ZTabsDoc,
	'z-collapsible': ZCollapsibleDoc,
	'z-accordion': ZAccordionDoc,
	'z-menu': ZMenuDoc,
	'z-nav-menu': ZNavMenuDoc,
	'z-sidebar': ZSidebarDoc,
	'z-dock': ZDockDoc,
	'z-dock-item': ZDockItemDoc,
	'z-tooltip': ZTooltipDoc,
	'z-popover': ZPopoverDoc,
	'z-hover-card': ZHoverCardDoc,
	'z-dialog': ZDialogDoc,
	'z-alert-dialog': ZAlertDialogDoc,
	'z-alert': ZAlertDoc,
	'z-sheet': ZSheetDoc,
	'z-drawer': ZDrawerDoc,
	'z-context-menu': ZContextMenuDoc,
	'z-toaster': ZToasterDoc,
	'z-command': ZCommandDoc,
	'z-callout': ZCalloutDoc,
	'z-empty-state': ZEmptyStateDoc,
	'z-scroll-area': ZScrollAreaDoc,
	'z-code-block': ZCodeBlockDoc,
	'z-markdown': ZMarkdownDoc,
	'z-terminal': ZTerminalDoc,
	'z-post-meta': ZPostMetaDoc,
	'z-carousel': ZCarouselDoc,
	'z-chart': ZChartDoc,
	'z-marquee': ZMarqueeDoc,
	'z-progressive-blur': ZProgressiveBlurDoc,
	'z-pointer-follow': ZPointerFollowDoc,
	'z-draggable': ZDraggableDoc,
	'z-drop-target': ZDropTargetDoc,
	'z-sortable': ZSortableDoc,
	'z-dropzone': ZDropzoneDoc,
	'z-chat-shell': ZChatShellDoc,
	'z-chat-header': ZChatHeaderDoc,
	'z-conversation-list': ZConversationListDoc,
	'z-conversation-item': ZConversationItemDoc,
	'z-message-list': ZMessageListDoc,
	'z-message-group': ZMessageGroupDoc,
	'z-message-bubble': ZMessageBubbleDoc,
	'z-message-actions': ZMessageActionsDoc,
	'z-reactions': ZReactionsDoc,
	'z-emoji-picker': ZEmojiPickerDoc,
	'z-date-divider': ZDateDividerDoc,
	'z-unread-divider': ZUnreadDividerDoc,
	'z-system-message': ZSystemMessageDoc,
	'z-delivery-status': ZDeliveryStatusDoc,
	'z-read-receipt': ZReadReceiptDoc,
	'z-quoted-message': ZQuotedMessageDoc,
	'z-file-attachment': ZFileAttachmentDoc,
	'z-image-message': ZImageMessageDoc,
	'z-attachment-chip': ZAttachmentChipDoc,
	'z-attachment-tray': ZAttachmentTrayDoc,
	'z-typing-indicator': ZTypingIndicatorDoc,
	'z-composer': ZComposerDoc,
	'z-send-button': ZSendButtonDoc,
	'z-streaming-text': ZStreamingTextDoc,
	'z-thinking': ZThinkingDoc,
	'z-tool-call': ZToolCallDoc,
	'z-citation': ZCitationDoc,
	'z-sources': ZSourcesDoc,
	'z-suggestion-chips': ZSuggestionChipsDoc,
	'z-model-picker': ZModelPickerDoc
}
