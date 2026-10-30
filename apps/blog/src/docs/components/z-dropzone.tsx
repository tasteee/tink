import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZDropzoneDoc = () => (
	<ComponentDoc
		tag="z-dropzone"
		category="Specialized"
		description={
			'A file drop well with click-to-browse and validation (accept / max-size / max-files / multiple). Uses native HTML5 drag events on purpose (the only way to receive files dragged in from the OS) and fires drop {files} or reject {files,reason}.'
		}
	>
		<DocExample demo="z-dropzone/overview" title="Overview" description="" />
	</ComponentDoc>
)
