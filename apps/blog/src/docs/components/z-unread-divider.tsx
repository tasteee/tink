import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZUnreadDividerDoc = () => (
	<ComponentDoc
		tag="z-unread-divider"
		category="Chat"
		description="The accented 'New messages' line marking where unread messages begin in a thread. Like z-date-divider, but toned to draw the eye."
	>
		<div className="block">
			<div className="panel">
				<div className="col" style={{ gap: '0.75rem' }}>
					<z-unread-divider />
					<z-unread-divider label="12 new messages" />
					<z-unread-divider tone="secondary" label="New" />
				</div>
			</div>
		</div>
	</ComponentDoc>
)
