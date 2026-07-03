import { ComponentDoc } from '@app/docs/ComponentDoc'
import { withProps } from '@app/docs/withProps'

const COMBOBOX_OPTIONS = [
	{ value: 'react', label: 'React' },
	{ value: 'vue', label: 'Vue' },
	{ value: 'svelte', label: 'Svelte' },
	{ value: 'solid', label: 'Solid' },
	{ value: 'atomico', label: 'Atomico' },
	{ value: 'lit', label: 'Lit' }
]

export const ZComboboxDoc = () => (
	<ComponentDoc tag="z-combobox" category="Forms" description="A type-ahead select with an `options` array.">
		<div className="block">
			<div className="panel">
				<div className='field'>
					<label>Combobox</label>
					<z-combobox placeholder='Search frameworks…' ref={withProps({ options: COMBOBOX_OPTIONS })} />
				</div>
			</div>
		</div>
	</ComponentDoc>
)
