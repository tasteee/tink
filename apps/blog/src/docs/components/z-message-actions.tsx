import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZMessageActionsDoc = () => (
	<ComponentDoc
		tag="z-message-actions"
		category="Chat"
		description="The floating action bar revealed on message hover — quick-reaction emojis, then reply / forward / more. Emits react {emoji}, addreaction, reply, forward, more. Position it over a bubble; customize the quick set via quick-reactions."
	>
		<div className="block">
			<div className="panel">
				<z-message-actions />
			</div>
		</div>

		<div className="block">
			<h3>Trimmed (no forward)</h3>
			<div className="panel">
				<z-message-actions no-forward />
			</div>
		</div>
	</ComponentDoc>
)
