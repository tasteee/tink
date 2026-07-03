import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZDrawerDoc = () => (
	<ComponentDoc tag="z-drawer" category="Overlays" description="A bottom drawer with a grab handle — drag down to dismiss.">
		<div className="block">
			<div className="panel">
				<div className='row' style={{ gap: '1.5rem' }}>
					<z-drawer heading='Quick actions' description='Drag the handle down to dismiss.'>
						<z-button slot='trigger' kind='outline'>Open drawer</z-button>
						<z-box isFlex isColumn gap='2' style={{ marginTop: '0.5rem' }}>
							<z-text size='sm' color='muted'>A bottom drawer with a grab handle and drag-to-close.</z-text>
						</z-box>
						<z-button slot='footer' kind='solid'>Confirm</z-button>
					</z-drawer>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
