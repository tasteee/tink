import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZTypingIndicatorDoc = () => (
	<ComponentDoc
		tag="z-typing-indicator"
		category="Chat"
		description="The animated '…' bubble shown while someone is typing. Optional avatar (via name / avatar-src) to match a message group on the start side. Shared by general chat and AI chat (composing a reply before the first token)."
	>
		<div className="block">
			<div className="panel">
				<div className="col" style={{ gap: '0.75rem', alignItems: 'flex-start' }}>
					<z-typing-indicator name="Alice Rivera" />
					<z-typing-indicator />
				</div>
			</div>
		</div>
	</ComponentDoc>
)
