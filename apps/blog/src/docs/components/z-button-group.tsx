import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZButtonGroupDoc = () => (
	<ComponentDoc
		tag="z-button-group"
		category="Actions"
		description="Seamless segmented actions — horizontal by default, `isVertical` for a column."
	>
		<div className="block">
			<div className="panel">
				<div className='row'>
					<z-button-group>
						<z-button kind='outline'>Left</z-button>
						<z-button kind='outline'>Mid</z-button>
						<z-button kind='outline'>Right</z-button>
					</z-button-group>
					<z-button-group isVertical style={{ marginLeft: '2rem' }}>
						<z-button kind='outline'>Top</z-button>
						<z-button kind='outline'>Mid</z-button>
						<z-button kind='outline'>Bottom</z-button>
					</z-button-group>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
