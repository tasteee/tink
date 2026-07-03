import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZSurfaceDoc = () => (
	<ComponentDoc tag="z-surface" category="Layout" description="A themed panel — `level` for neutral elevation, or `tone` + `variant` for accent surfaces.">
		<div className="panel">
			<div className='micro'>level · neutral elevation (page → overlay)</div>
			<z-grid minColumnWidth='11rem' gap='sm'>
				<z-surface level='0' radius='md' inset='lg'>level="0"</z-surface>
				<z-surface level='1' radius='md' inset='lg'>level="1"</z-surface>
				<z-surface level='2' radius='md' inset='lg'>level="2"</z-surface>
				<z-surface level='3' radius='md' inset='lg'>level="3"</z-surface>
			</z-grid>
			<p className='cap'><span className='el'>&lt;z-surface</span> <b>level</b>="0 | 1 | 2 | 3"<span className='el'>&gt;</span> — neutral-0 … neutral-3 + hairline</p>
		</div>
		<div className="block">
			<div className="block-title">
				<h3>tone × variant</h3>
				<span className="desc">accent surfaces, composed from one tone variable</span>
			</div>
			<div className="panel">
				<z-grid minColumnWidth='9rem' gap='sm'>
					<z-surface tone='primary' variant='soft' radius='md' inset='md'>primary · soft</z-surface>
					<z-surface tone='secondary' variant='soft' radius='md' inset='md'>secondary · soft</z-surface>
					<z-surface tone='primary' variant='filled' radius='md' inset='md'>primary · filled</z-surface>
					<z-surface tone='secondary' variant='filled' radius='md' inset='md'>secondary · filled</z-surface>
					<z-surface tone='primary' variant='outlined' radius='md' inset='md'>primary · outlined</z-surface>
					<z-surface tone='secondary' variant='outlined' radius='md' inset='md'>secondary · outlined</z-surface>
				</z-grid>
				<p className='cap'><span className='el'>&lt;z-surface</span> <b>tone</b>="primary" <b>variant</b>="soft|filled|outlined" <b>radius</b>="md" <b>inset</b>="md"<span className='el'>&gt;</span></p>
			</div>
		</div>
	</ComponentDoc>
)
