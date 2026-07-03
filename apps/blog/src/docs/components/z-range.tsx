import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZRangeDoc = () => (
	<ComponentDoc tag="z-range" category="Forms" description="A single track with one or more z-range-handle children — bounds clamp travel, handles never cross.">
		<div className="block">
			<div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '480px' }}>
				<div className='field'>
					<label>Unbounded — bounds inherit the domain, plain two-tone track</label>
					<z-range min={20} max={90}>
						<z-range-handle value={30} />
						<z-range-handle value={85} tone='secondary' />
					</z-range>
				</div>
				<div className='field'>
					<label>Bounded handles — off-limits ends are painted</label>
					<z-range min={25} max={75}>
						<z-range-handle min={30} max={60} value={50} />
						<z-range-handle min={40} max={70} value={60} tone='secondary' />
					</z-range>
				</div>
				<z-range min={0} max={1000} label='Price range' showValue valuePrefix='$'>
					<z-range-handle value={200} />
					<z-range-handle value={750} tone='secondary' />
				</z-range>
			</div>
		</div>
	</ComponentDoc>
)
