import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZDateDividerDoc = () => (
	<ComponentDoc
		tag="z-date-divider"
		category="Chat"
		description="A centered day separator between message groups — 'Today', 'Yesterday', or an absolute date. Pass label, or slot custom content."
	>
		<div className="block">
			<div className="panel">
				<div className="col" style={{ gap: '0.5rem' }}>
					<z-date-divider label="Today" />
					<z-date-divider label="Yesterday" />
					<z-date-divider label="March 3" />
				</div>
			</div>
		</div>
	</ComponentDoc>
)
