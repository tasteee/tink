import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZAvatarDoc = () => (
	<ComponentDoc
		tag="z-avatar"
		category="Data Display"
		description="Image avatar with initials fallback — sizes, tone, square shape, and status dot."
	>
		<div className="block">
			<div className="panel">
				<div className='row' style={{ gap: '1.25rem' }}>
					<z-avatar name='Ada Lovelace' size='xs' />
					<z-avatar name='Grace Hopper' size='small' />
					<z-avatar name='Alan Turing' status='online' />
					<z-avatar name='Katherine Johnson' tone='secondary' size='large' status='busy' />
					<z-avatar name='Linus' size='xl' isSquare status='away' />
				</div>
			</div>
		</div>
	</ComponentDoc>
)
