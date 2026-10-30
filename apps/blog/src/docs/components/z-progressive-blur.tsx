import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZProgressiveBlurDoc = () => (
	<ComponentDoc
		tag="z-progressive-blur"
		category="Specialized"
		description="Wraps slotted content and fades a blur in from one edge, for legible text over a busy image."
	>
		<DocExample demo="z-progressive-blur/overview" title="Overview" description="" />
		<DocExample
			demo="z-progressive-blur/text-overlay"
			title="Text overlay"
			description="bottom blur gives an overlaid label room to breathe"
		/>
	</ComponentDoc>
)
