import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZSpacerDoc = () => (
	<ComponentDoc
		tag="z-spacer"
		category="Layout"
		description="Flexible or fixed empty space inside a flex layout. It makes a deliberate push or separation explicit when gap alone cannot express the relationship."
	>
		<DocExample
			demo="z-spacer/push-a-trailing-action"
			title="Push a trailing action"
			description="grow absorbs remaining room and keeps the final action at the far edge."
		/>
		<DocExample
			demo="z-spacer/create-a-deliberate-fixed-gap"
			title="Create a deliberate fixed gap"
			description="Use size when a gap must be larger than the parent’s general rhythm."
		/>
		<DocExample
			demo="z-spacer/prefer-gap-for-ordinary-siblings"
			title="Prefer gap for ordinary siblings"
			description="Most layouts need gap. Spacer is the exception for a push or singular separation."
		/>
	</ComponentDoc>
)
