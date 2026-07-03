import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZStackDoc = () => (
	<ComponentDoc tag="z-stack" category="Layout" description="Lay children out along a single axis — column by default, `is-row` for horizontal.">
		<div className="block">
			<div className="block-title">
				<h3>column (default)</h3>
			</div>
			<div className="panel">
				<div className="stage">
					<z-stack gap='sm'>
						<z-surface className='tile' tone='primary' variant='soft' radius='md'>one</z-surface>
						<z-surface className='tile' variant='soft' radius='md'>two</z-surface>
						<z-surface className='tile' variant='soft' radius='md'>three</z-surface>
					</z-stack>
				</div>
				<p className='cap'><span className='el'>&lt;z-stack</span> <b>gap</b>="sm"<span className='el'>&gt;</span></p>
			</div>
		</div>
		<div className="block">
			<div className="block-title">
				<h3>is-row · the axis model</h3>
				<span className="desc">aligns-x distributes across the row · aligns-y centers it vertically</span>
			</div>
			<div className="panel">
				<div className="stage" style={{ height: '8rem' }}>
					<z-stack isRow alignsX='between' alignsY='center' fullHeight>
						<z-surface className='tile' tone='primary' variant='soft' radius='md'>start</z-surface>
						<z-surface className='tile' variant='soft' radius='md'>middle</z-surface>
						<z-surface className='tile' tone='secondary' variant='soft' radius='md'>end</z-surface>
					</z-stack>
				</div>
				<p className='cap'><span className='el'>&lt;z-stack</span> <b>is-row</b> <b>aligns-x</b>="between" <b>aligns-y</b>="center" <b>full-height</b><span className='el'>&gt;</span></p>
			</div>
		</div>
	</ComponentDoc>
)
