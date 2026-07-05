import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZChatHeaderDoc = () => (
	<ComponentDoc
		tag="z-chat-header"
		category="Chat"
		description="The thread's top bar: avatar, name, a presence/subtitle line, and a trailing actions slot (call / video / info). Composes z-avatar."
	>
		<div className="block">
			<div className="panel" style={{ padding: 0 }}>
				<z-chat-header name="Alice Rivera" subtitle="Active now" status="online">
					<z-button slot="actions" kind="ghost" size="small">Call</z-button>
					<z-button slot="actions" kind="ghost" size="small">Video</z-button>
					<z-button slot="actions" kind="ghost" size="small">Info</z-button>
				</z-chat-header>
			</div>
		</div>

		<div className="block">
			<h3>Group, last-seen</h3>
			<div className="panel" style={{ padding: 0 }}>
				<z-chat-header name="Design Team" subtitle="5 members · Priya typing…">
					<z-button slot="actions" kind="ghost" size="small">Info</z-button>
				</z-chat-header>
			</div>
		</div>
	</ComponentDoc>
)
