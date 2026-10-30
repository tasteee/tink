import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZClusterDoc = () => (
	<ComponentDoc
		tag="z-cluster"
		category="Layout"
		description="A wrapping inline group for equal peers: tags, compact filters, small actions, and metadata. Unlike a normal row, it wraps by default so the group remains useful on small screens."
	>
		<DocExample
			demo="z-cluster/group-peer-tags"
			title="Group peer tags"
			description="Use a cluster when each item can naturally move to another line."
		/>
		<DocExample
			demo="z-cluster/align-a-compact-action-group"
			title="Align a compact action group"
			description="full-width lets the group align to a trailing edge without a second layout wrapper."
		/>
		<DocExample
			demo="z-cluster/keep-controls-compact"
			title="Keep controls compact"
			description="Clusters work best when every child has a similar visual weight."
		/>
	</ComponentDoc>
)
