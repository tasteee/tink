import { ComponentDoc } from '@app/docs/ComponentDoc'

const ago = (ms: number) => new Date(Date.now() - ms).toISOString()

export const ZConversationItemDoc = () => (
	<ComponentDoc
		tag="z-conversation-item"
		category="Chat"
		description="One row in the inbox rail: avatar (with presence dot), name, last-message preview, timestamp, and an unread count. Composes z-avatar and z-relative-time. Clicking emits select {value}; is-active marks the open conversation."
	>
		<div className="block">
			<div className="panel" style={{ maxWidth: '360px' }}>
				<z-conversation-item value="alice" name="Alice Rivera" preview="They just landed 🎉" timestamp={ago(2 * 60 * 1000)} status="online" unread={2} is-active />
				<z-conversation-item value="bob" name="Bob Chen" preview="Sounds good, talk tomorrow" timestamp={ago(2 * 60 * 60 * 1000)} status="away" />
				<z-conversation-item value="team" name="Design Team" preview="Priya: pushed the tokens" timestamp={ago(17 * 60 * 60 * 1000)} is-muted unread={12} />
				<z-conversation-item value="sam" name="Sam Okafor" preview="👍" timestamp={ago(2 * 24 * 60 * 60 * 1000)} status="offline" />
			</div>
		</div>
	</ComponentDoc>
)
