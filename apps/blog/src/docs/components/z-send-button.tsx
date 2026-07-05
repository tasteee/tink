import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZSendButtonDoc = () => (
	<ComponentDoc
		tag="z-send-button"
		category="Chat"
		description="The circular send control for a composer. Two states: idle (send arrow, emits send) and streaming (stop square, emits stop). The composer wires its default trailing button to this; AI chat flips is-streaming while a response generates."
	>
		<div className="block">
			<div className="panel">
				<div className="row" style={{ gap: '1.5rem', alignItems: 'center' }}>
					<div className="col" style={{ gap: '0.5rem', alignItems: 'center' }}>
						<z-send-button />
						<z-text size="sm" color="muted">Idle</z-text>
					</div>
					<div className="col" style={{ gap: '0.5rem', alignItems: 'center' }}>
						<z-send-button is-disabled />
						<z-text size="sm" color="muted">Disabled</z-text>
					</div>
					<div className="col" style={{ gap: '0.5rem', alignItems: 'center' }}>
						<z-send-button is-streaming />
						<z-text size="sm" color="muted">Streaming</z-text>
					</div>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
