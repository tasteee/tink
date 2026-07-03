import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZSkeletonDoc = () => (
	<ComponentDoc
		tag="z-skeleton"
		category="Data Display"
		description="A loading placeholder — circle, rect, or multi-line text shapes."
	>
		<div className="block">
			<div className="panel">
				<div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
					<z-skeleton shape='circle' width='3rem' isInline />
					<div style={{ flex: 1 }}>
						<z-skeleton lines={3} />
					</div>
				</div>
				<z-skeleton shape='rect' height='5rem' style={{ marginTop: '1.25rem' }} />
			</div>
		</div>
	</ComponentDoc>
)
