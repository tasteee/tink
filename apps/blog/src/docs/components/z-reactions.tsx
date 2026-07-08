import { ComponentDoc } from '@app/docs/ComponentDoc'

const REACTIONS = [
	{ emoji: '👍', count: 4, isMine: true },
	{ emoji: '🎉', count: 2 },
	{ emoji: '❤️', count: 1 }
]

export const ZReactionsDoc = () => (
	<ComponentDoc
		tag="z-reactions"
		category="Chat"
		description="The row of emoji-count pills under a message. Data-driven via the reactions property ([{ emoji, count, isMine }]). Clicking a pill emits toggle {emoji}; the ＋ button emits add (open a z-emoji-picker). A pill you reacted with is highlighted."
	>
		<div className="block">
			<div className="panel">
				<z-reactions reactions={REACTIONS} />
			</div>
		</div>

		<div className="block">
			<h3>Without the add button</h3>
			<div className="panel">
				<z-reactions no-add reactions={REACTIONS} />
			</div>
		</div>
	</ComponentDoc>
)
