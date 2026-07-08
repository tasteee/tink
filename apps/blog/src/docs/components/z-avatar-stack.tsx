import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZAvatarStackDoc = () => (
	<ComponentDoc
		tag="z-avatar-stack"
		category="Data Display"
		description="Overlapping z-avatar cluster with a max cap and a '+N' overflow badge."
	>
		<div className="block">
			<div className="panel">
				<div className='row' style={{ gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
					<z-avatar-stack>
						<z-avatar name="Ada Lovelace" />
						<z-avatar name="Grace Hopper" tone="secondary" />
						<z-avatar name="Alan Turing" />
					</z-avatar-stack>

					<z-avatar-stack max={3} total={12}>
						<z-avatar name="Ada Lovelace" />
						<z-avatar name="Grace Hopper" tone="secondary" />
						<z-avatar name="Alan Turing" />
						<z-avatar name="Katherine Johnson" tone="secondary" />
						<z-avatar name="Linus" />
					</z-avatar-stack>

					<z-avatar-stack size="small" max={4}>
						<z-avatar name="Ada Lovelace" size="small" />
						<z-avatar name="Grace Hopper" size="small" tone="secondary" />
						<z-avatar name="Alan Turing" size="small" />
						<z-avatar name="Katherine Johnson" size="small" tone="secondary" />
						<z-avatar name="Linus" size="small" />
						<z-avatar name="Margaret Hamilton" size="small" />
					</z-avatar-stack>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
