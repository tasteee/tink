import { ComponentDoc } from '@app/docs/ComponentDoc'
import { withProps } from '@app/docs/withProps'

const CHART_BAR = [
	{ label: 'Mon', value: 42 },
	{ label: 'Tue', value: 58 },
	{ label: 'Wed', value: 35 },
	{ label: 'Thu', value: 71 },
	{ label: 'Fri', value: 64 },
	{ label: 'Sat', value: 28 },
	{ label: 'Sun', value: 49 }
]
const CHART_AREA = [
	{ label: 'W1', value: 12 },
	{ label: 'W2', value: 28 },
	{ label: 'W3', value: 22 },
	{ label: 'W4', value: 45 },
	{ label: 'W5', value: 38 },
	{ label: 'W6', value: 60 }
]

export const ZChartDoc = () => (
	<ComponentDoc tag="z-chart" category="Specialized" description="A single-series bar/line/area chart — no dependencies.">
		<div className="block">
			<div className="panel-grid">
				<div className='panel'>
					<div className='micro'>Bar — with grid</div>
					<z-chart type='bar' showGrid ref={withProps({ data: CHART_BAR })} />
				</div>
				<div className='panel'>
					<div className='micro'>Area — pink tone</div>
					<z-chart type='area' tone='secondary' ref={withProps({ data: CHART_AREA })} />
				</div>
			</div>
		</div>
	</ComponentDoc>
)
