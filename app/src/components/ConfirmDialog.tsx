import { useEffect } from 'react'

type ConfirmDialogProps = {
	title: string
	body?: string
	confirmLabel?: string
	onConfirm: () => void
	onCancel: () => void
}

// Minimal modal for destructive confirmation, styled with zest tokens.
export const ConfirmDialog = ({ title, body, confirmLabel = 'Delete', onConfirm, onCancel }: ConfirmDialogProps) => {
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onCancel()
		}
		document.addEventListener('keydown', onKey)
		return () => document.removeEventListener('keydown', onKey)
	}, [onCancel])

	return (
		<div className="ConfirmOverlay" onPointerDown={onCancel}>
			<div className="ConfirmCard" role="dialog" aria-modal="true" onPointerDown={(e) => e.stopPropagation()}>
				<z-heading size="sm">{title}</z-heading>
				{body && <z-text color="muted" size="sm">{body}</z-text>}
				<div className="ConfirmActions">
					<z-button size="small" kind="ghost" onClick={onCancel}>Cancel</z-button>
					<z-button size="small" kind="solid" tone="danger" onClick={onConfirm}>{confirmLabel}</z-button>
				</div>
			</div>
		</div>
	)
}
