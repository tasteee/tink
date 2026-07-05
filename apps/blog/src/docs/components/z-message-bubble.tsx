import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZMessageBubbleDoc = () => (
	<ComponentDoc
		tag="z-message-bubble"
		category="Chat"
		description="A single chat bubble. Purely visual — the surrounding z-message-group sets its side (start = them, end = you) and group corner position. Content is slotted, so it can hold text, a z-markdown, or an image."
	>
		<div className="block">
			<div className="panel">
				<div className="col" style={{ gap: '0.375rem', alignItems: 'flex-start' }}>
					<z-message-bubble side="start">Hey! How's it going?</z-message-bubble>
					<z-message-bubble side="start">Did you see the designs?</z-message-bubble>
				</div>
			</div>
		</div>

		<div className="block">
			<h3>Grouped corners</h3>
			<div className="panel">
				<div className="col" style={{ gap: '2px', alignItems: 'flex-end' }}>
					<z-message-bubble side="end" group="first">First in a run</z-message-bubble>
					<z-message-bubble side="end" group="middle">Middle — tight corners</z-message-bubble>
					<z-message-bubble side="end" group="last">Last in the run</z-message-bubble>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
