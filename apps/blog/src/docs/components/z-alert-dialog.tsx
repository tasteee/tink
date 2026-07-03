import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZAlertDialogDoc = () => (
	<ComponentDoc tag="z-alert-dialog" category="Overlays" description="An explicit confirm/cancel modal — for destructive or high-stakes actions.">
		<div className="block">
			<div className="panel">
				<div className='row' style={{ gap: '1.5rem' }}>
					<z-alert-dialog tone='danger' heading='Delete project?' description='This permanently removes the project and all of its data. This action cannot be undone.' confirmLabel='Delete'>
						<z-button slot='trigger' kind='outline' tone='danger'>Delete…</z-button>
					</z-alert-dialog>
					<z-alert-dialog heading='Publish now?' description='Your changes will go live immediately for everyone.' confirmLabel='Publish'>
						<z-button slot='trigger' kind='outline' tone='primary'>Publish…</z-button>
					</z-alert-dialog>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
