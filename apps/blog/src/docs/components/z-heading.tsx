import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZHeadingDoc = () => (
	<ComponentDoc
		tag="z-heading"
		category="Foundations"
		description="Six visual sizes that map to h1–h6 by default. Use tag when visual scale and document-outline level intentionally diverge."
	>
		<DocExample
			demo="z-heading/choose-hierarchy-before-scale"
			title="Choose hierarchy before scale"
			description="The size gives a useful default heading level when visual and semantic hierarchy agree."
		/>
		<DocExample
			demo="z-heading/decouple-visual-size-from-document"
			title="Decouple visual size from document outline"
			description="Use tag when the page outline requires a different heading level."
		/>
		<DocExample
			demo="z-heading/pair-titles-with-body-copy"
			title="Pair titles with body copy"
			description="Keep a heading short, then put explanation in adjacent z-text."
		/>
	</ComponentDoc>
)
