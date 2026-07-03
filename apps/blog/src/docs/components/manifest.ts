import type { ComponentType } from 'react'

// Foundations
import { ZBoxDoc } from '@app/docs/components/z-box'
import { ZTextDoc } from '@app/docs/components/z-text'
import { ZHeadingDoc } from '@app/docs/components/z-heading'
import { ZSubheadingDoc } from '@app/docs/components/z-subheading'
import { ZLabelDoc } from '@app/docs/components/z-label'
import { ZCardDoc } from '@app/docs/components/z-card'
import { ZLineDoc } from '@app/docs/components/z-line'
import { ZSeparatorDoc } from '@app/docs/components/z-separator'
import { ZStackDoc } from '@app/docs/components/z-stack'
import { ZGridDoc } from '@app/docs/components/z-grid'
import { ZClusterDoc } from '@app/docs/components/z-cluster'
import { ZCenterDoc } from '@app/docs/components/z-center'
import { ZContainerDoc } from '@app/docs/components/z-container'
import { ZSectionDoc } from '@app/docs/components/z-section'
import { ZSurfaceDoc } from '@app/docs/components/z-surface'
import { ZScrollDoc } from '@app/docs/components/z-scroll'
import { ZSpacerDoc } from '@app/docs/components/z-spacer'

// Actions
import { ZButtonDoc } from '@app/docs/components/z-button'
import { ZButtonGroupDoc } from '@app/docs/components/z-button-group'
import { ZToggleDoc } from '@app/docs/components/z-toggle'
import { ZToggleGroupDoc } from '@app/docs/components/z-toggle-group'
import { ZToggleGroupItemDoc } from '@app/docs/components/z-toggle-group-item'
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
import { ZColorPickerDoc } from '@app/docs/components/z-color-picker'
import { ZInputOtpDoc } from '@app/docs/components/z-input-otp'

// Data Display
import { ZBadgeDoc } from '@app/docs/components/z-badge'
import { ZAvatarDoc } from '@app/docs/components/z-avatar'
import { ZProgressDoc } from '@app/docs/components/z-progress'
import { ZSkeletonDoc } from '@app/docs/components/z-skeleton'
import { ZTableDoc } from '@app/docs/components/z-table'
import { ZPaginationDoc } from '@app/docs/components/z-pagination'
import { ZStatDoc } from '@app/docs/components/z-stat'

// Navigation
import { ZBreadcrumbsDoc } from '@app/docs/components/z-breadcrumbs'
import { ZTabsDoc } from '@app/docs/components/z-tabs'
import { ZCollapsibleDoc } from '@app/docs/components/z-collapsible'
import { ZAccordionDoc } from '@app/docs/components/z-accordion'
import { ZMenuDoc } from '@app/docs/components/z-menu'
import { ZNavMenuDoc } from '@app/docs/components/z-nav-menu'
import { ZSidebarDoc } from '@app/docs/components/z-sidebar'

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
import { ZEmptyStateDoc } from '@app/docs/components/z-empty-state'
import { ZScrollAreaDoc } from '@app/docs/components/z-scroll-area'
import { ZCodeBlockDoc } from '@app/docs/components/z-code-block'
import { ZTerminalDoc } from '@app/docs/components/z-terminal'
import { ZPostMetaDoc } from '@app/docs/components/z-post-meta'
import { ZCarouselDoc } from '@app/docs/components/z-carousel'
import { ZChartDoc } from '@app/docs/components/z-chart'

export type ComponentDocEntry = {
	slug: string
	category: 'Foundations' | 'Layout' | 'Actions' | 'Forms' | 'Data Display' | 'Navigation' | 'Overlays' | 'Specialized'
	Component: ComponentType
}

// The single source of truth for both /docs/components/* routing (Docs.tsx)
// and the sidebar's Components groups (DocsLayout.tsx) — one page per z-element.
export const COMPONENT_MANIFEST: ComponentDocEntry[] = [
	// Foundations
	{ slug: 'z-box', category: 'Foundations', Component: ZBoxDoc },
	{ slug: 'z-text', category: 'Foundations', Component: ZTextDoc },
	{ slug: 'z-heading', category: 'Foundations', Component: ZHeadingDoc },
	{ slug: 'z-subheading', category: 'Foundations', Component: ZSubheadingDoc },
	{ slug: 'z-label', category: 'Foundations', Component: ZLabelDoc },
	{ slug: 'z-card', category: 'Foundations', Component: ZCardDoc },
	{ slug: 'z-line', category: 'Foundations', Component: ZLineDoc },
	{ slug: 'z-separator', category: 'Foundations', Component: ZSeparatorDoc },

	// Layout
	{ slug: 'z-stack', category: 'Layout', Component: ZStackDoc },
	{ slug: 'z-grid', category: 'Layout', Component: ZGridDoc },
	{ slug: 'z-cluster', category: 'Layout', Component: ZClusterDoc },
	{ slug: 'z-center', category: 'Layout', Component: ZCenterDoc },
	{ slug: 'z-container', category: 'Layout', Component: ZContainerDoc },
	{ slug: 'z-section', category: 'Layout', Component: ZSectionDoc },
	{ slug: 'z-surface', category: 'Layout', Component: ZSurfaceDoc },
	{ slug: 'z-scroll', category: 'Layout', Component: ZScrollDoc },
	{ slug: 'z-spacer', category: 'Layout', Component: ZSpacerDoc },

	// Actions
	{ slug: 'z-button', category: 'Actions', Component: ZButtonDoc },
	{ slug: 'z-button-group', category: 'Actions', Component: ZButtonGroupDoc },
	{ slug: 'z-toggle', category: 'Actions', Component: ZToggleDoc },
	{ slug: 'z-toggle-group', category: 'Actions', Component: ZToggleGroupDoc },
	{ slug: 'z-toggle-group-item', category: 'Actions', Component: ZToggleGroupItemDoc },
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
	{ slug: 'z-color-picker', category: 'Forms', Component: ZColorPickerDoc },
	{ slug: 'z-input-otp', category: 'Forms', Component: ZInputOtpDoc },

	// Data Display
	{ slug: 'z-badge', category: 'Data Display', Component: ZBadgeDoc },
	{ slug: 'z-avatar', category: 'Data Display', Component: ZAvatarDoc },
	{ slug: 'z-progress', category: 'Data Display', Component: ZProgressDoc },
	{ slug: 'z-skeleton', category: 'Data Display', Component: ZSkeletonDoc },
	{ slug: 'z-table', category: 'Data Display', Component: ZTableDoc },
	{ slug: 'z-pagination', category: 'Data Display', Component: ZPaginationDoc },
	{ slug: 'z-stat', category: 'Data Display', Component: ZStatDoc },

	// Navigation
	{ slug: 'z-breadcrumbs', category: 'Navigation', Component: ZBreadcrumbsDoc },
	{ slug: 'z-tabs', category: 'Navigation', Component: ZTabsDoc },
	{ slug: 'z-collapsible', category: 'Navigation', Component: ZCollapsibleDoc },
	{ slug: 'z-accordion', category: 'Navigation', Component: ZAccordionDoc },
	{ slug: 'z-menu', category: 'Navigation', Component: ZMenuDoc },
	{ slug: 'z-nav-menu', category: 'Navigation', Component: ZNavMenuDoc },
	{ slug: 'z-sidebar', category: 'Navigation', Component: ZSidebarDoc },

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
	{ slug: 'z-empty-state', category: 'Specialized', Component: ZEmptyStateDoc },
	{ slug: 'z-scroll-area', category: 'Specialized', Component: ZScrollAreaDoc },
	{ slug: 'z-code-block', category: 'Specialized', Component: ZCodeBlockDoc },
	{ slug: 'z-terminal', category: 'Specialized', Component: ZTerminalDoc },
	{ slug: 'z-post-meta', category: 'Specialized', Component: ZPostMetaDoc },
	{ slug: 'z-carousel', category: 'Specialized', Component: ZCarouselDoc },
	{ slug: 'z-chart', category: 'Specialized', Component: ZChartDoc }
]
