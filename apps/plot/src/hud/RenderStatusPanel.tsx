import { RenderHealth, useRenderStatus } from '../game/store'
import { isHighQuality, Quality, switchQuality } from '../game/quality'
import './RenderStatusPanel.css'

// Reloading always retries in low quality: if the 3D view
// failed, the lighter path is the one most likely to work.
const reloadInLowQuality = () => {
	switchQuality(Quality.low)
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
	const qualityNote = isHighQuality ? 'Quality: high' : 'Quality: low'
	const diagnostics = `${gpuLabel} · ${qualityNote}`

	return (
		<section className="renderStatusPanel" role="alert">
			<z-text size="sm" weight="600">
				{title}
			</z-text>
			<z-text size="xs" color="muted">
				{renderStatus.detail}
			</z-text>
			<z-text size="xs" color="muted">
				{diagnostics}
			</z-text>
			<z-button size="small" kind="solid" tone="primary" onClick={reloadInLowQuality}>
				Reload
			</z-button>
		</section>
	)
}
