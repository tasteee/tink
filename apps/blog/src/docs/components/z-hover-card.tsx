import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZHoverCardDoc = () => (
	<ComponentDoc tag="z-hover-card" category="Overlays" description="A hover-triggered preview card — for user/link previews.">
		<div className="block">
			<div className="panel">
				<div className='row' style={{ gap: '1.5rem' }}>
					<z-hover-card placement='bottom'>
						<z-link slot='trigger'>@ada</z-link>
						<z-box isFlex isRow gap='3' yCenter>
							<z-avatar name='Ada Lovelace' size='large' />
							<z-box isFlex isColumn gap='1'>
								<z-text weight='lg'>Ada Lovelace</z-text>
								<z-text size='sm' color='muted'>First programmer. Hovers welcome.</z-text>
							</z-box>
						</z-box>
					</z-hover-card>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
