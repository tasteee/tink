import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZQuotedMessageDoc = () => (
	<ComponentDoc
		tag="z-quoted-message"
		category="Chat"
		description="The 'replying to…' snippet: an accent bar, the original sender, and a truncated preview. Use inside a z-message-bubble (a reply) or in the composer's context bar. Clicking emits jump {value} to scroll to the original."
	>
		<div className="block">
			<div className="panel" style={{ maxWidth: '380px' }}>
				<div className="col" style={{ gap: '0.75rem' }}>
					<z-quoted-message name="Alice Rivera" text="Did you see the new designs? They just landed and I think they're a big improvement." />
					<z-quoted-message tone="secondary" name="Bob Chen" text="Sounds good — talk tomorrow." />
				</div>
			</div>
		</div>

		<div className="block">
			<h3>Inside a reply bubble</h3>
			<div className="panel">
				<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
					<z-message-bubble side="end">
						<z-quoted-message name="Alice Rivera" text="They just landed 🎉" no-jump />
						<div style={{ marginTop: '0.35rem' }}>Yeah — looks great!</div>
					</z-message-bubble>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
