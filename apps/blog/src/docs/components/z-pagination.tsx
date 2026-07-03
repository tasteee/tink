import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZPaginationDoc = () => (
	<ComponentDoc
		tag="z-pagination"
		category="Data Display"
		description="Windowed page navigation — current `page`, `total`, and tone."
	>
		<div className="block">
			<div className="panel">
				<div className='col' style={{ gap: '1.5rem', alignItems: 'flex-start' }}>
					<z-pagination page={1} total={5} />
					<z-pagination page={6} total={12} tone='secondary' />
				</div>
			</div>
		</div>
	</ComponentDoc>
)
