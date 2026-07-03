import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZToggleDoc = () => (
	<ComponentDoc
		tag="z-toggle"
		category="Actions"
		description="A standalone pressable toggle — tone, kind (ghost), and disabled variants."
	>
		<div className="block">
			<div className="panel">
				<div className='micro'>Standalone toggles</div>
				<div className='row'>
					<z-toggle>Default</z-toggle>
					<z-toggle tone='primary'>Primary</z-toggle>
					<z-toggle tone='secondary'>Secondary</z-toggle>
					<z-toggle kind='ghost'>Ghost</z-toggle>
					<z-toggle isDisabled>Disabled</z-toggle>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
