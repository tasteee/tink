import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZInputDoc = () => (
	<ComponentDoc tag="z-input" category="Forms" description="Text field with a focus accent — tone, invalid, and disabled states.">
		<div className="block">
			<div className="panel-grid">
				<div className='panel' style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
					<div className='field'>
						<label>Email</label>
						<z-input type='email' placeholder='you@example.com' />
					</div>
					<div className='field'>
						<label>Invalid state</label>
						<z-input isInvalid value='not-an-email' />
					</div>
				</div>
				<div className='panel'>
					<div className='micro'>Input states</div>
					<ul className='state-list'>
						<li><span className='sd' style={{ background: 'var(--muted-foreground)' }} /> Default</li>
						<li><span className='sd' style={{ background: 'var(--primary)' }} /> Focused / Active (neutral)</li>
						<li><span className='sd' style={{ background: 'var(--purple)' }} /> Purple tone</li>
						<li><span className='sd' style={{ background: 'var(--pink)' }} /> Pink tone</li>
						<li><span className='sd' style={{ background: 'var(--destructive)' }} /> Error</li>
					</ul>
					<div className='field' style={{ marginTop: '1.5rem' }}>
						<z-input tone='primary' placeholder='Purple focus tone' />
					</div>
					<div className='field' style={{ marginTop: '1rem' }}>
						<z-input tone='secondary' placeholder='Pink focus tone' />
					</div>
					<div className='field' style={{ marginTop: '1rem' }}>
						<z-input isDisabled value='Disabled field' />
					</div>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
