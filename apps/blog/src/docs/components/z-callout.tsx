import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZCalloutDoc = () => (
	<ComponentDoc
		tag="z-callout"
		category="Specialized"
		description="An in-flow documentation admonition. Five kinds (note, tip, important, warning, caution), each with its own hue and icon. A heading is optional; omit it for a compact, icon-only note. Distinct from z-alert, which is a dismissable status banner."
	>
		<DocExample
			demo="z-callout/kinds"
			title="Kinds"
			description="left accent bar · auto icon · optional heading · slotted body"
		/>
		<DocExample demo="z-callout/no-heading" title="No heading" description="omit heading for a compact, icon-only note" />
		<DocExample
			demo="z-callout/expandable"
			title="Expandable"
			description="is-expandable clamps to two lines with an inline Show more / Show less"
		/>
	</ComponentDoc>
)
