import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZSheetDoc = () => (
	<ComponentDoc tag="z-sheet" category="Overlays" description='An edge panel — side="left" or "right", with header/footer slots.'>
		<div className="block">
			<div className="panel">
				<div className='row' style={{ gap: '1.5rem' }}>
					<z-sheet side='right' heading='Filters' description='Narrow the results below.'>
						<z-button slot='trigger' kind='outline'>Right sheet</z-button>
						<z-box isFlex isColumn gap='3' style={{ marginTop: '0.5rem' }}>
							<z-checkbox isChecked>In stock</z-checkbox>
							<z-checkbox>On sale</z-checkbox>
							<z-checkbox>Free shipping</z-checkbox>
						</z-box>
						<z-button slot='footer' kind='solid' tone='primary'>Apply</z-button>
					</z-sheet>
					<z-sheet side='left' heading='Navigation'>
						<z-button slot='trigger' kind='outline'>Left sheet</z-button>
						<z-text size='sm' color='muted'>A left-anchored panel — good for navigation.</z-text>
					</z-sheet>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
