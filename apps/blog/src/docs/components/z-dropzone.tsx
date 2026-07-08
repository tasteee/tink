import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZDropzoneDoc = () => (
	<ComponentDoc
		tag="z-dropzone"
		category="Specialized"
		description="A file drop well with click-to-browse and validation (accept / max-size / max-files / multiple). Uses native HTML5 drag events on purpose — the only way to receive files dragged in from the OS — and fires drop {files} or reject {files,reason}."
	>
		<div className="block">
			<div className="panel">
				<z-dropzone accept="image/*,.pdf" multiple style={{ maxWidth: '24rem' }} />
			</div>
		</div>
	</ComponentDoc>
)
