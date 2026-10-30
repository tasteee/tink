import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZTextDoc = () => (
	<ComponentDoc tag="z-text" category="Foundations" description="The default component for interface copy. It makes body scale, color intent, semantic tag, and modest editorial emphasis explicit.">
		<DocExample title="Write the supporting sentence" description="Use normal text for explanation that follows a title or control." code={`<z-column gap="2"><z-heading size="sm" tag="h2">Share the project</z-heading><z-text color="muted">Invite people to view, comment on, or edit this work.</z-text></z-column>`}><z-column gap="2"><z-heading size="sm" tag="h2">Share the project</z-heading><z-text color="muted">Invite people to view, comment on, or edit this work.</z-text></z-column></DocExample>
		<DocExample title="Use color as intent" description="Muted is supporting context; accent colors communicate a deliberate, limited emphasis." code={`<z-column gap="2"><z-text>Default content remains easy to read.</z-text><z-text color="muted">Secondary information recedes.</z-text><z-text color="primary" weight="600">A meaningful status can stand out.</z-text></z-column>`}><z-column gap="2"><z-text>Default content remains easy to read.</z-text><z-text color="muted">Secondary information recedes.</z-text><z-text color="primary" weight="600">A meaningful status can stand out.</z-text></z-column></DocExample>
		<DocExample title="Use semantic tags when needed" description="Visual presentation and HTML semantics can be set independently." code={`<z-text tag="span" size="sm" color="muted">Inline metadata</z-text>
<z-text tag="p">A paragraph in a long-form document.</z-text>`}><z-column gap="2"><z-text tag="span" size="sm" color="muted">Inline metadata</z-text><z-text tag="p">A paragraph in a long-form document.</z-text></z-column></DocExample>
		<DocExample title="Apply editorial treatment locally" description="For a phrase inside a sentence, use z-inline instead of nesting another text component." code={`<z-text>Changes are <z-inline is-underlined>saved automatically</z-inline>.</z-text>`}><z-text>Changes are <z-inline isUnderlined>saved automatically</z-inline>.</z-text></DocExample>
	</ComponentDoc>
)
