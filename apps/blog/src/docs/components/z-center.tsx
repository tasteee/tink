import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZCenterDoc = () => (
	<ComponentDoc tag="z-center" category="Layout" description="Centers content on both axes. `min-height` for hero centering, `max-width` to constrain the inner content.">
		<div className="panel">
			<div className='micro'>both axes · min-height · constrained content</div>
			<div className="stage" style={{ padding: 0 }}>
				<z-center minHeight='16rem' maxWidth='sm' text inset='lg'>
					<z-stack gap='sm' alignsX='center'>
						<z-heading size='xs' tag='h3'>Perfectly centered</z-heading>
						<z-text size='sm' color='muted'>Vertically and horizontally, with the content capped at the <code>sm</code> width token.</z-text>
					</z-stack>
				</z-center>
			</div>
			<p className='cap'><span className='el'>&lt;z-center</span> <b>min-height</b>="16rem" <b>max-width</b>="sm" <b>text</b> <b>inset</b>="lg"<span className='el'>&gt;</span></p>
		</div>
	</ComponentDoc>
)
