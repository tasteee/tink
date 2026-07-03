import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZProgressDoc = () => (
	<ComponentDoc
		tag="z-progress"
		category="Data Display"
		description="A determinate or indeterminate progress bar — tone and size variants."
	>
		<div className="block">
			<div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
				<z-progress value={72} />
				<z-progress value={45} tone='secondary' />
				<z-progress value={90} tone='neutral' size='small' />
				<z-progress isIndeterminate />
			</div>
		</div>
	</ComponentDoc>
)
