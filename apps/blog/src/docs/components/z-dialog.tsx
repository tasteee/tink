import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZDialogDoc = () => (
	<ComponentDoc tag="z-dialog" category="Overlays" description='A native, focus-trapped modal — slot="trigger" opens it, slot="footer" for actions.'>
		<div className="block">
			<div className="panel">
				<div className='row' style={{ gap: '1.5rem' }}>
					<z-dialog heading='Edit profile' description="Make changes to your profile here. Click save when you're done.">
						<z-button slot='trigger' kind='solid'>Open dialog</z-button>
						<z-box isFlex isColumn gap='3' style={{ marginTop: '0.5rem' }}>
							<div className='field'>
								<label>Display name</label>
								<z-input value='Ada Lovelace' />
							</div>
						</z-box>
						<z-button slot='footer' kind='solid'>Save changes</z-button>
					</z-dialog>
					<z-dialog size='large' heading='Large dialog' description='The same modal at a wider size.'>
						<z-button slot='trigger' kind='outline'>Large</z-button>
						<z-text size='sm' color='muted'>Esc, the close button, and a backdrop click all dismiss this one.</z-text>
					</z-dialog>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
