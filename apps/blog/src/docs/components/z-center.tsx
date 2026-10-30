import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZCenterDoc = () => (
	<ComponentDoc
		tag="z-center"
		category="Layout"
		description="Centers focused content horizontally and vertically. It is ideal for empty, loading, confirmation, and hero states where the lack of surrounding content is intentional."
	>
		<DocExample
			demo="z-center/center-an-empty-state"
			title="Center an empty state"
			description="Give the state a meaningful minimum height so the centering communicates its scope."
		/>
		<DocExample
			demo="z-center/constrain-the-inner-measure"
			title="Constrain the inner measure"
			description="max-width prevents centered prose from growing into a wide, hard-to-read block."
		/>
		<DocExample
			demo="z-center/do-not-center-routine-page"
			title="Do not center routine page content"
			description="Centering is a state and emphasis tool; normal reading flow should use z-column."
		/>
	</ComponentDoc>
)
