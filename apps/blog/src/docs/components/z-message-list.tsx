import { ComponentDoc } from '@app/docs/ComponentDoc'

const ago = (ms: number) => new Date(Date.now() - ms).toISOString()

export const ZMessageListDoc = () => (
	<ComponentDoc
		tag="z-message-list"
		category="Chat"
		description="The scroll surface for a conversation. Slotted and declarative; its job is pin-to-bottom — new messages stick to the bottom only when you're already there, so scrolling up to read history isn't interrupted."
	>
		<div className="block">
			<div className="panel">
				<z-message-list style={{ height: '360px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
					<z-system-message label="Messages are end-to-end encrypted" />
					<z-date-divider label="Today" />

					<z-message-group side="start" name="Alice Rivera" avatar-name="Alice Rivera" timestamp={ago(8 * 60 * 1000)}>
						<z-message-bubble>Hey! Did you see the new designs?</z-message-bubble>
						<z-message-bubble>They just landed 🎉</z-message-bubble>
					</z-message-group>

					<z-message-group side="end" timestamp={ago(6 * 60 * 1000)}>
						<z-message-bubble>Yeah — looks great!</z-message-bubble>
					</z-message-group>

					<z-typing-indicator name="Alice Rivera" />
				</z-message-list>
			</div>
		</div>
	</ComponentDoc>
)
