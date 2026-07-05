import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZThinkingDoc = () => (
	<ComponentDoc
		tag="z-thinking"
		category="Chat"
		description="A collapsible reasoning / chain-of-thought block. While is-active the label shimmers; when done, pass a duration like 'Thought for 4s'. Composes z-collapsible. Reasoning in the default slot, or pass content to render via z-markdown."
	>
		<div className="block">
			<h3>Active (still reasoning)</h3>
			<div className="panel">
				<z-thinking is-active is-expanded label="Thinking">
					Breaking the request into steps: first parse the constraints, then check which
					elements already exist before proposing new ones.
				</z-thinking>
			</div>
		</div>

		<div className="block">
			<h3>Done (collapsed, with duration)</h3>
			<div className="panel">
				<z-thinking label="Thought" duration="for 4s">
					I considered three layouts and picked the two-pane shell because it composes the
					existing z-resizable-panels.
				</z-thinking>
			</div>
		</div>
	</ComponentDoc>
)
