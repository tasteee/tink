import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZPopoverDoc = () => (
	<ComponentDoc tag="z-popover" category="Overlays" description="A click-triggered floating panel — flips near viewport edges.">
		<div className="block">
			<div className="panel">
				<div className='row' style={{ gap: '1.5rem' }}>
					<z-popover placement='bottom-start' tone='primary'>
						<z-button slot='trigger' kind='outline' tone='primary'>Open popover</z-button>
						<z-box isFlex isColumn gap='2'>
							<z-heading size='xs' tag='h3'>Dimensions</z-heading>
							<z-text size='sm' color='muted'>Click outside or press Esc to dismiss. The panel flips when it nears a viewport edge.</z-text>
						</z-box>
					</z-popover>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
