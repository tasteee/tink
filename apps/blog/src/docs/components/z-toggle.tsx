import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZToggleDoc = () => (
	<ComponentDoc tag="z-toggle" category="Actions" description="A standalone pressed/unpressed button. Use it for a persistent local setting or formatting state—not for a one-time command.">
		<DocExample title="Make state visible" description="The element owns its pressed state by default and exposes it through aria-pressed." code={`<z-toggle>Show grid</z-toggle>`}><z-toggle>Show grid</z-toggle></DocExample>
		<DocExample title="Set an initial or controlled state" description="is-pressed is reflected, so your application can read or set the state declaratively." code={`<z-toggle is-pressed tone="primary">Notifications</z-toggle>
<script>toggle.addEventListener('press', (event) => save(event.detail.pressed))</script>`}><z-row gap="2"><z-toggle isPressed tone="primary">Notifications</z-toggle><z-toggle isDisabled>Unavailable</z-toggle></z-row></DocExample>
		<DocExample title="Use a ghost toggle in dense UI" description="Ghost styling works well in a toolbar, where the selected state supplies the emphasis." code={`<z-toolbar><z-toggle kind="ghost" size="small">Bold</z-toggle><z-toggle kind="ghost" size="small">Italic</z-toggle></z-toolbar>`}><z-toolbar><z-toggle kind="ghost" size="small">Bold</z-toggle><z-toggle kind="ghost" size="small">Italic</z-toggle></z-toolbar></DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">Props and event</z-heading><dl><dt>is-pressed</dt><dd>Two-way reflected pressed state.</dd><dt>press</dt><dd>Bubbling, composed event with <code>{'{ pressed }'}</code>.</dd><dt>kind / tone / size</dt><dd>kind is outline or ghost; tones are neutral, primary, and secondary.</dd><dt>is-icon</dt><dd>Use for an icon-only control with an accessible label.</dd></dl></section>
	</ComponentDoc>
)
