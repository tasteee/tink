import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZStatusDotDoc = () => (
	<ComponentDoc
		tag="z-status-dot"
		category="Data Display"
		description="A presence indicator, a colored dot for online/away/dnd/offline, optionally pulsing, with an optional label."
	>
		<DocExample demo="z-status-dot/overview" title="Overview" description="" />
		<DocExample demo="z-status-dot/overview-2" title="Overview" description="" />
	</ComponentDoc>
)
