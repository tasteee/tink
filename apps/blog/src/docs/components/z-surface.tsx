import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZSurfaceDoc = () => (
	<ComponentDoc
		tag="z-surface"
		category="Layout"
		description="A restrained visual surface for content that needs separation or emphasis. Use neutral elevation for normal structure; use tone and variant only when color carries meaning."
	>
		<DocExample
			demo="z-surface/choose-quiet-elevation"
			title="Choose quiet elevation"
			description="Neutral levels separate layers without turning each group into a bordered card."
		/>
		<DocExample
			demo="z-surface/use-tone-for-a-meaningful"
			title="Use tone for a meaningful state"
			description="Soft tone is appropriate for supporting emphasis, not ordinary grouping."
		/>
		<DocExample
			demo="z-surface/keep-the-content-layout-independent"
			title="Keep the content layout independent"
			description="Surface provides treatment; use a layout primitive inside for structure."
		/>
	</ComponentDoc>
)
