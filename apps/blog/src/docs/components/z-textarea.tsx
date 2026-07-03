import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZTextareaDoc = () => (
	<ComponentDoc tag="z-textarea" category="Forms" description="Multi-line text field, same focus-accent language as z-input.">
		<div className="block">
			<div className="panel">
				<div className='field'>
					<label>Message</label>
					<z-textarea placeholder='Say something bold…' rows={3} />
				</div>
			</div>
		</div>
	</ComponentDoc>
)
