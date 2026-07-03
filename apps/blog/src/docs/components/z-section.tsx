import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZSectionDoc = () => (
	<ComponentDoc tag="z-section" category="Layout" description="A vertical page band with top/bottom `space` padding — fold in `container`/`gutter` for a centered content column.">
		<div className="panel">
			<div className='micro'>space="xl" · built-in container="md"</div>
			<div className="stage" style={{ padding: 0 }}>
				<z-section space='xl' container='md' gutter='md' style={{ background: 'color-mix(in oklch, var(--purple) 7%, transparent)' }}>
					<z-surface className='tile lead' tone='secondary' variant='soft' radius='md'>vertical space above &amp; below · content centered to md</z-surface>
				</z-section>
			</div>
			<p className='cap'><span className='el'>&lt;z-section</span> <b>space</b>="xl" <b>container</b>="md" <b>gutter</b>="md"<span className='el'>&gt;</span></p>
		</div>
	</ComponentDoc>
)
