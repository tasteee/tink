import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZSpacerDoc = () => (
	<ComponentDoc tag="z-spacer" category="Layout" description="Empty space inside a flex layout — fixed `size`, or `grow` to soak up remaining space.">
		<div className="panel">
			<div className='micro'>grow · pushes the trailing action to the end</div>
			<div className="stage">
				<z-stack isRow gap='sm' alignsY='center'>
					<z-surface className='tile' tone='primary' variant='soft' radius='md'>Logo</z-surface>
					<z-surface className='tile' variant='soft' radius='md'>Home</z-surface>
					<z-surface className='tile' variant='soft' radius='md'>Docs</z-surface>
					<z-spacer grow />
					<z-button tone='primary' kind='solid' size='small'>Sign in</z-button>
				</z-stack>
			</div>
			<p className='cap'>… <span className='el'>&lt;z-spacer</span> <b>grow</b><span className='el'>&gt;&lt;/z-spacer&gt;</span> …</p>
		</div>
		<div className="block">
			<div className="block-title">
				<h3>size="2xl"</h3>
				<span className="desc">a fixed-size gap between two items</span>
			</div>
			<div className="panel">
				<div className="stage">
					<z-stack isRow gap='0' alignsY='center'>
						<z-surface className='tile' tone='primary' variant='soft' radius='md'>before</z-surface>
						<z-spacer size='2xl' />
						<z-surface className='tile' tone='secondary' variant='soft' radius='md'>after</z-surface>
					</z-stack>
				</div>
				<p className='cap'><span className='el'>&lt;z-spacer</span> <b>size</b>="2xl"<span className='el'>&gt;&lt;/z-spacer&gt;</span></p>
			</div>
		</div>
	</ComponentDoc>
)
