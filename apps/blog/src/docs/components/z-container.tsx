import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZContainerDoc = () => (
	<ComponentDoc tag="z-container" category="Layout" description="The centered, max-width page wrapper with horizontal gutters.">
		<div className="panel">
			<div className='micro'>size="md" · centered within a wider stage</div>
			<div className="stage">
				<z-container size='md' gutter='md'>
					<z-surface className='tile lead' tone='primary' variant='soft' radius='md'>max-width: md · centered · gutter padding</z-surface>
				</z-container>
			</div>
			<p className='cap'><span className='el'>&lt;z-container</span> <b>size</b>="md" <b>gutter</b>="md"<span className='el'>&gt;</span></p>
		</div>
	</ComponentDoc>
)
