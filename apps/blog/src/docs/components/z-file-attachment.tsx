import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZFileAttachmentDoc = () => (
	<ComponentDoc
		tag="z-file-attachment"
		category="Chat"
		description="A sent file inside a message bubble: a type icon, the file name and size, and a download affordance (an anchor when href is set)."
	>
		<div className="block">
			<div className="panel">
				<div className="col" style={{ gap: '0.75rem', alignItems: 'flex-start' }}>
					<z-file-attachment name="proposal.pdf" size="248000" type="application/pdf" href="#" />
					<z-file-attachment name="quarterly-report-final-v3.xlsx" size="1840000" href="#" />
				</div>
			</div>
		</div>

		<div className="block">
			<h3>Inside a bubble</h3>
			<div className="panel">
				<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
					<z-message-bubble side="end">
						<z-file-attachment name="brief.pdf" size="248000" href="#" />
					</z-message-bubble>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
