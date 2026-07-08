import { ComponentDoc } from '@app/docs/ComponentDoc'
import { withProps } from '@app/docs/withProps'

const STARTERS = ['Summarize this thread', "Explain like I'm 5", 'Draft a reply', 'Find action items']

export const ZSuggestionChipsDoc = () => (
	<ComponentDoc
		tag="z-suggestion-chips"
		category="Chat"
		description="A wrapping row of tappable prompt suggestions — starters on an empty thread, or follow-ups after an answer. Emits select {value, label}. Data-driven via the suggestions property (strings or {label, value})."
	>
		<div className="block">
			<div className="panel">
				<z-suggestion-chips ref={withProps({ suggestions: STARTERS })} />
			</div>
		</div>

		<div className="block">
			<h3>Follow-ups (with arrow)</h3>
			<div className="panel">
				<z-suggestion-chips show-arrow ref={withProps({ suggestions: ['Go deeper on step 2', 'Show me the code', 'What are the trade-offs?'] })} />
			</div>
		</div>
	</ComponentDoc>
)
