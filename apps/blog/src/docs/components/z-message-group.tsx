import { ComponentDoc } from '@app/docs/ComponentDoc'

const ago = (ms: number) => new Date(Date.now() - ms).toISOString()

export const ZMessageGroupDoc = () => (
	<ComponentDoc
		tag="z-message-group"
		category="Chat"
		description="A run of consecutive messages from one sender, sharing a single avatar, name, and timestamp. It positions its slotted z-message-bubble children automatically (side + grouped corners)."
	>
		<div className="block">
			<div className="panel">
				<div className="col" style={{ gap: '0.5rem' }}>
					<z-message-group side="start" name="Alice Rivera" avatar-name="Alice Rivera" timestamp={ago(6 * 60 * 1000)}>
						<z-message-bubble>Hey!</z-message-bubble>
						<z-message-bubble>Did you see the designs?</z-message-bubble>
					</z-message-group>

					<z-message-group side="end" timestamp={ago(4 * 60 * 1000)}>
						<z-message-bubble>Yeah — looks great!</z-message-bubble>
					</z-message-group>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
