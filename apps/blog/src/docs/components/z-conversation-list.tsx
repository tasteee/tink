import { ComponentDoc } from '@app/docs/ComponentDoc'

const ago = (ms: number) => new Date(Date.now() - ms).toISOString()

export const ZConversationListDoc = () => (
	<ComponentDoc
		tag="z-conversation-list"
		category="Chat"
		description="The inbox rail: a scrolling column of z-conversation-item children with an optional sticky header slot (title, search, new-chat). A layout/scroll container; item select events bubble."
	>
		<div className="block">
			<div className="panel" style={{ maxWidth: '360px', padding: 0 }}>
				<z-conversation-list style={{ height: '260px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
					<div slot="header" style={{ padding: '0.75rem 0.875rem', fontWeight: 700 }}>Chats</div>
					<z-conversation-item value="alice" name="Alice Rivera" preview="They just landed 🎉" timestamp={ago(2 * 60 * 1000)} status="online" unread={2} is-active />
					<z-conversation-item value="bob" name="Bob Chen" preview="Sounds good, talk tomorrow" timestamp={ago(2 * 60 * 60 * 1000)} status="away" />
					<z-conversation-item value="team" name="Design Team" preview="Priya: pushed the tokens" timestamp={ago(17 * 60 * 60 * 1000)} is-muted unread={12} />
					<z-conversation-item value="sam" name="Sam Okafor" preview="👍" timestamp={ago(2 * 24 * 60 * 60 * 1000)} status="offline" />
				</z-conversation-list>
			</div>
		</div>
	</ComponentDoc>
)
