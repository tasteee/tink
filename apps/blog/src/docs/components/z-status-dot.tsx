import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZStatusDotDoc = () => (
	<ComponentDoc
		tag="z-status-dot"
		category="Data Display"
		description="A presence indicator — a colored dot for online/away/dnd/offline, optionally pulsing, with an optional label."
	>
		<div className="block">
			<div className="panel">
				<div className="col" style={{ gap: '0.75rem' }}>
					<z-status-dot status="online" label="Active now" />
					<z-status-dot status="away" label="Away" />
					<z-status-dot status="dnd" label="Do not disturb" />
					<z-status-dot status="offline" label="Offline" />
				</div>
			</div>
		</div>

		<div className="block">
			<h3>Pulse & sizes</h3>
			<div className="panel">
				<div className="row" style={{ gap: '1.5rem', alignItems: 'center' }}>
					<z-status-dot status="online" pulse label="Live" />
					<z-status-dot status="online" size="md" />
					<z-status-dot status="dnd" size="lg" />
				</div>
			</div>
		</div>
	</ComponentDoc>
)
