import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZAlertDoc = () => (
	<ComponentDoc tag="z-alert" category="Overlays" description="An inline status message that remains in context. Use it for conditions affecting the current page; use a toast for short-lived global feedback.">
		<DocExample title="Match tone to consequence" description="Tone communicates urgency before a reader parses every word. Keep the heading useful and the body actionable." code={`<z-column gap="2">
  <z-alert tone="info" heading="New version available">Refresh when convenient.</z-alert>
  <z-alert tone="warning" heading="Approaching limit">You have used 90% of this month's quota.</z-alert>
  <z-alert tone="danger" heading="Payment failed">Update your billing details.</z-alert>
</z-column>`}><z-column gap="2"><z-alert tone="info" heading="New version available">Refresh when convenient.</z-alert><z-alert tone="warning" heading="Approaching limit">You have used 90% of this month's quota.</z-alert><z-alert tone="danger" heading="Payment failed">Update your billing details.</z-alert></z-column></DocExample>
		<DocExample title="Dismiss only nonessential notices" description="Dismissal hides the alert and emits dismiss. Do not make errors or blocking requirements dismissible unless they are also recoverable elsewhere." code={`alert.addEventListener('dismiss', () => {
  savePreference('release-note-dismissed', true)
})`} language="ts"><z-alert tone="success" heading="Saved" isDismissable>Your changes are published.</z-alert></DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">UX and API</z-heading><dl><dt>tone</dt><dd>Use info, success, warning, or danger to match the condition, not for decoration.</dd><dt>heading and default slot</dt><dd>The heading summarizes the state; the default slot gives next steps or necessary detail.</dd><dt>is-dismissable / dismiss</dt><dd>Add a close control and receive a bubbling dismiss event. Persist the choice only when it is appropriate.</dd><dt>is-hidden</dt><dd>Hides the entire element. Prefer removing resolved messages from application state.</dd><dt>Choice</dt><dd>Keep alerts near the affected content. Do not use them for an action that requires immediate confirmation.</dd></dl></section>
	</ComponentDoc>
)
