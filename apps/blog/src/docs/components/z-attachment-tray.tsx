import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZAttachmentTrayDoc = () => (
	<ComponentDoc
		tag="z-attachment-tray"
		category="Chat"
		description="The strip of staged z-attachment-chip children above the composer, doubling as a file drop/browse target (composes z-dropzone). Drop or pick files → emits files {files}; rejects surface as reject {files, reason}."
	>
		<div className="block">
			<div className="panel">
				<z-attachment-tray accept="image/*,.pdf" multiple>
					<z-attachment-chip name="proposal.pdf" size="248000" type="application/pdf" />
					<z-attachment-chip name="notes.txt" size="1200" />
				</z-attachment-tray>
			</div>
		</div>

		<div className="block">
			<h3>Empty (drop target)</h3>
			<div className="panel">
				<z-attachment-tray accept="image/*" multiple />
			</div>
		</div>
	</ComponentDoc>
)
