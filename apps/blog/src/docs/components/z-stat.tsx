import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZStatDoc = () => (
	<ComponentDoc
		tag="z-stat"
		category="Data Display"
		description="A labeled numeric statistic — value/label pair with independent sizing and color."
	>
		<div className="block">
			<div className="panel">
				<div className='row' style={{ gap: '2.5rem' }}>
					<z-stat value='2,481' label='Active users' size='lg' />
					<z-stat value='$48.2k' label='Revenue' size='lg' color='primary' />
					<z-stat value='99.98%' label='Uptime' size='lg' color='secondary' align='end' />
				</div>
			</div>
		</div>
	</ComponentDoc>
)
