import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZLinkDoc = () => (
	<ComponentDoc tag="z-link" category="Actions" description="A semantic anchor with deliberate tone and underline behavior. Use it for navigation; use z-button when the action changes application state.">
		<DocExample title="Link to another place" description="Links navigate. Keep the label specific enough to predict the destination." code={`<z-text color="muted">Need help? <z-link href="/docs/getting-started">Read the getting started guide</z-link>.</z-text>`}><z-text color="muted">Need help? <z-link href="#">Read the getting started guide</z-link>.</z-text></DocExample>
		<DocExample title="Use underline intentionally" description="Hover underline is the default; always is useful in prose, none is reserved for obvious navigation UI." code={`<z-row gap="3" wrap><z-link href="#" underline="hover">Hover underline</z-link><z-link href="#" underline="always">Always underlined</z-link><z-link href="#" underline="none">No underline</z-link></z-row>`}><z-row gap="3" wrap><z-link href="#" underline="hover">Hover underline</z-link><z-link href="#" underline="always">Always underlined</z-link><z-link href="#" underline="none">No underline</z-link></z-row></DocExample>
		<DocExample title="Mark external destinations" description="is-external sets target and safe rel values automatically, then appends an external-link icon." code={`<z-link href="https://example.com" is-external>Open the API reference</z-link>`}><z-link href="https://example.com" isExternal>Open the API reference</z-link></DocExample>
	</ComponentDoc>
)
