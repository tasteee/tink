import { ComponentDoc } from '@app/docs/ComponentDoc'

const ago = (ms: number) => new Date(Date.now() - ms).toISOString()

export const ZChatShellDoc = () => (
	<ComponentDoc
		tag="z-chat-shell"
		category="Chat"
		description="The app frame for a chat: a resizable inbox rail (list slot), the thread (default slot), and an optional details pane (has-details + details slot). Composes z-resizable-panels — the dividers drag and can persist via auto-save-id."
	>
		<div className="block">
			<div className="panel" style={{ padding: 0 }}>
				<z-chat-shell list-size="240px" style={{ height: '440px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'block' }}>
					<z-conversation-list slot="list">
						<div slot="header" style={{ padding: '0.75rem 0.875rem', fontWeight: 700 }}>Chats</div>
						<z-conversation-item value="alice" name="Alice Rivera" preview="They just landed 🎉" timestamp={ago(2 * 60 * 1000)} status="online" unread={2} is-active />
						<z-conversation-item value="bob" name="Bob Chen" preview="Talk tomorrow" timestamp={ago(2 * 60 * 60 * 1000)} status="away" />
					</z-conversation-list>

					<div style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
						<z-chat-header name="Alice Rivera" subtitle="Active now" status="online" />
						<z-message-list style={{ flex: 1 }}>
							<z-date-divider label="Today" />
							<z-message-group side="start" name="Alice Rivera" avatar-name="Alice Rivera" timestamp={ago(4 * 60 * 1000)}>
								<z-message-bubble>Hey! Did you see the designs?</z-message-bubble>
							</z-message-group>
							<z-message-group side="end" timestamp={ago(2 * 60 * 1000)}>
								<z-message-bubble>Yeah — looks great!</z-message-bubble>
							</z-message-group>
						</z-message-list>
						<div style={{ padding: '0.75rem' }}>
							<z-composer placeholder="Message Alice…" />
						</div>
					</div>
				</z-chat-shell>
			</div>
		</div>
	</ComponentDoc>
)
