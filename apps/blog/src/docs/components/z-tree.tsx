import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZTreeDoc = () => (
	<ComponentDoc
		tag="z-tree"
		category="Data Display"
		description="A data-driven hierarchical tree, feed it a recursive items array and it handles expand/collapse, single/multiple selection, and full keyboard nav (↑/↓ move, →/← expand or step in/out, Enter/Space select)."
	>
		<DocExample demo="z-tree/overview" title="Overview" description="" />
	</ComponentDoc>
)
