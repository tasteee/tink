import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZScrollDoc = () => (
	<ComponentDoc tag="z-scroll" category="Layout" description="A constrained overflow region with the system's themed scrollbars — vertical or horizontal `direction`.">
		<div className="block">
			<div className="block-title">
				<h3>direction · vertical · max-height="14rem"</h3>
			</div>
			<div className="panel">
				<z-scroll direction='vertical' maxHeight='14rem' inset='sm' style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
					<z-stack gap='sm'>
						<z-surface className='tile' tone='primary' variant='soft' radius='md'>row 01</z-surface>
						<z-surface className='tile' variant='soft' radius='md'>row 02</z-surface>
						<z-surface className='tile' variant='soft' radius='md'>row 03</z-surface>
						<z-surface className='tile' tone='secondary' variant='soft' radius='md'>row 04</z-surface>
					</z-stack>
				</z-scroll>
				<p className='cap'><span className='el'>&lt;z-scroll</span> <b>direction</b>="vertical" <b>max-height</b>="14rem"<span className='el'>&gt;</span></p>
			</div>
		</div>
	</ComponentDoc>
)
