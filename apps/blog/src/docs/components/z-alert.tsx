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
	</ComponentDoc>
)
