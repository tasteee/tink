import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZSystemMessageDoc = () => (
	<ComponentDoc
		tag="z-system-message"
		category="Chat"
		description="A centered, muted status line for non-message events — 'Alice added Bob', 'You started a call', encryption notices. Pass label or slot content."
	>
		<div className="block">
			<div className="panel">
				<div className="col" style={{ gap: '0.5rem' }}>
					<z-system-message label="Messages are end-to-end encrypted" />
					<z-system-message label="Alice added Bob to the chat" />
					<z-system-message label="You started a call" />
				</div>
			</div>
		</div>
	</ComponentDoc>
)
