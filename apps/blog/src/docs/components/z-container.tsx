import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZContainerDoc = () => (
	<ComponentDoc
		tag="z-container"
		category="Layout"
		description="The centered content boundary for a page or a wide content band. It gives prose and application surfaces a readable maximum width while preserving responsive gutters."
	>
		<DocExample
			demo="z-container/set-a-readable-measure"
			title="Set a readable measure"
			description="Use a container when content needs a shared horizontal edge."
		/>
		<DocExample
			demo="z-container/use-a-smaller-measure-for"
			title="Use a smaller measure for prose"
			description="A narrow container makes long-form text easier to read."
		/>
		<DocExample
			demo="z-container/keep-bands-and-content-separate"
			title="Keep bands and content separate"
			description="Let a parent own the background; let the container own the content width."
		/>
	</ComponentDoc>
)
