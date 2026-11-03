import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZToggleButtonDoc = () => (
	<ComponentDoc
		tag="z-toggle-button"
		category="Actions"
		description="A standalone pressed/unpressed button. Use it for a persistent local setting or formatting state, not for a one-time command."
	>
		<DocExample
			demo="z-toggle-button/make-state-visible"
			title="Make state visible"
			description="The element owns its pressed state by default and exposes it through aria-pressed."
		/>
		<DocExample
			demo="z-toggle-button/set-an-initial-or-controlled"
			title="Set an initial or controlled state"
			description="is-pressed is reflected, so your application can read or set the state declaratively."
		/>
		<DocExample
			demo="z-toggle-button/use-a-ghost-toggle-in"
			title="Use a ghost toggle in dense UI"
			description="Ghost styling works well in a toolbar, where the selected state supplies the emphasis."
		/>
	</ComponentDoc>
)
