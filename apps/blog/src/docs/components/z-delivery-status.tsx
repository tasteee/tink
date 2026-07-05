import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZDeliveryStatusDoc = () => (
	<ComponentDoc
		tag="z-delivery-status"
		category="Chat"
		description="The tiny send-state indicator next to a sent message: sending (clock) → sent (✓) → delivered (✓✓) → read (blue ✓✓), plus an error state. Sits in a message's meta row. Read color is the overridable --read-color."
	>
		<div className="block">
			<div className="panel">
				<div className="row" style={{ gap: '1.5rem', alignItems: 'center' }}>
					{['sending', 'sent', 'delivered', 'read', 'error'].map((s) => (
						<div key={s} className="col" style={{ gap: '0.35rem', alignItems: 'center' }}>
							<z-delivery-status status={s} />
							<z-text size="sm" color="muted">{s}</z-text>
						</div>
					))}
				</div>
			</div>
		</div>
	</ComponentDoc>
)
