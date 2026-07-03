import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZTooltipDoc = () => (
	<ComponentDoc tag="z-tooltip" category="Overlays" description="A hover/focus label — placement on all four sides, tone accents.">
		<div className="block">
			<div className="panel">
				<div className='row' style={{ gap: '1.5rem' }}>
					<z-tooltip content='Saves your changes' placement='top'>
						<z-button kind='outline'>Top</z-button>
					</z-tooltip>
					<z-tooltip content='Shown to the right' placement='right'>
						<z-button kind='outline'>Right</z-button>
					</z-tooltip>
					<z-tooltip content='Drops below the trigger' placement='bottom' tone='primary'>
						<z-button kind='outline' tone='primary'>Bottom</z-button>
					</z-tooltip>
					<z-tooltip content='Anchored to the left' placement='left' tone='secondary'>
						<z-button kind='outline' tone='secondary'>Left</z-button>
					</z-tooltip>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
