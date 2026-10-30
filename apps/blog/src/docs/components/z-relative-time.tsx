import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZRelativeTimeDoc = () => (
	<ComponentDoc
		tag="z-relative-time"
		category="Data Display"
		description="An auto-updating timestamp, 'just now', '2m', '3h', 'Yesterday', then an absolute date. All instances share one timer."
	>
		<DocExample demo="z-relative-time/overview" title="Overview" description="" />
	</ComponentDoc>
)
