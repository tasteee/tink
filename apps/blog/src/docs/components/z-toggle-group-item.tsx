import { DocsLink } from '@app/docs/DocsLink'
import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZToggleGroupItemDoc = () => (
	<ComponentDoc tag="z-toggle-group-item" category="Actions" description="One value inside z-toggle-group. It is never standalone: the parent provides the selection model and emits the group change event.">
		<DocExample title="Give every item a stable value" description="Use values your application can store; labels can change without breaking persisted state." code={`<z-toggle-group type="single"><z-toggle-group-item value="comfortable">Comfortable</z-toggle-group-item><z-toggle-group-item value="compact">Compact</z-toggle-group-item></z-toggle-group>`}><z-toggle-group type="single"><z-toggle-group-item value="comfortable" isPressed>Comfortable</z-toggle-group-item><z-toggle-group-item value="compact">Compact</z-toggle-group-item></z-toggle-group></DocExample>
		<DocExample title="Set initial state declaratively" description="The group reconciles is-pressed as the user changes selection." code={`<z-toggle-group type="multiple"><z-toggle-group-item value="email" is-pressed>Email</z-toggle-group-item><z-toggle-group-item value="push">Push</z-toggle-group-item></z-toggle-group>`}><z-toggle-group type="multiple"><z-toggle-group-item value="email" isPressed>Email</z-toggle-group-item><z-toggle-group-item value="push">Push</z-toggle-group-item></z-toggle-group></DocExample>
	</ComponentDoc>
)
