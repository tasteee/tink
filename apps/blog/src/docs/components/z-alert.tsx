import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZAlertDoc = () => (
	<ComponentDoc
		tag="z-alert"
		category="Overlays"
		description="An inline status message that remains in context. Use it for conditions affecting the current page; use a toast for short-lived global feedback."
	>
		<DocExample
			demo="z-alert/match-tone-to-consequence"
			title="Match tone to consequence"
			description="Tone communicates urgency before a reader parses every word. Keep the heading useful and the body actionable."
		/>
		<DocExample
			demo="z-alert/compose-the-heading-and-actions"
			title="Compose the heading and actions"
			description="heading is shorthand for plain text. For rich content (an inline link, a badge) use slot=heading instead; slot=actions adds a row of buttons, and slot=icon replaces the status icon."
		/>
		<DocExample
			demo="z-alert/dismiss-only-nonessential-notices"
			title="Dismiss only nonessential notices"
			description="Dismissal hides the alert and emits dismiss. Do not make errors or blocking requirements dismissible unless they are also recoverable elsewhere."
		/>
	</ComponentDoc>
)
