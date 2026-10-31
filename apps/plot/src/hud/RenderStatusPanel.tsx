import { RenderHealth, useRenderStatus } from '../game/store'
import './RenderStatusPanel.css'

const reloadPage = () => {
	window.location.reload()
}

// Shown only when the 3D view is not drawing. Includes the
// GPU name so a screenshot is enough to debug a device.
export const RenderStatusPanel = () => {
	const renderStatus = useRenderStatus()
	const isHealthy = renderStatus.health === RenderHealth.ok
	if (isHealthy) return null

	const isRecovering = renderStatus.health === RenderHealth.recovering
	const title = isRecovering ? 'Restoring 3D view…' : 'The 3D view stopped drawing'
	const gpuLabel = renderStatus.gpuLabel === '' ? 'GPU unknown' : renderStatus.gpuLabel

	return (
		<section className="renderStatusPanel" role="alert">
			<z-text size="sm" weight="600">
				{title}
			</z-text>
			<z-text size="xs" color="muted">
				{renderStatus.detail}
			</z-text>
			<z-text size="xs" color="muted">
				{gpuLabel}
			</z-text>
			<z-button size="small" kind="solid" tone="primary" onClick={reloadPage}>
				Reload
			</z-button>
		</section>
	)
}
