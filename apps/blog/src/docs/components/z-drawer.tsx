import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZDrawerDoc = () => (
	<ComponentDoc tag="z-drawer" category="Overlays" description="A bottom-sheet modal with a grab handle. Use it for focused mobile-friendly choices or quick actions that should stay close to the current screen.">
		<DocExample title="Offer a compact action set" description="The drawer supplies its handle and dismissal gesture. Keep its content short enough that people can complete the task without losing context." code={`<z-drawer heading="Quick actions" description="Choose what to do next.">
  <z-button slot="trigger" kind="outline">More</z-button>
  <z-column gap="2"><z-button kind="plain">Duplicate project</z-button><z-button kind="plain">Archive project</z-button></z-column>
  <z-button slot="footer">Done</z-button>
</z-drawer>`}><z-drawer heading="Quick actions" description="Choose what to do next."><z-button slot="trigger" kind="outline">More</z-button><z-column gap="2"><z-button kind="plain">Duplicate project</z-button><z-button kind="plain">Archive project</z-button></z-column><z-button slot="footer">Done</z-button></z-drawer></DocExample>
		<DocExample title="Respect every dismissal path" description="Users can drag the handle down, press Escape, click the backdrop, or close programmatically. Listen for close to synchronize host state." code={`drawer.addEventListener('close', () => setQuickActionsOpen(false))
drawer.isOpen = true`} language="ts"><z-text size="sm" color="muted">Use a drawer when the vertical origin and drag-to-dismiss gesture make the interaction feel natural; otherwise choose a dialog or sheet.</z-text></DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">UX and API</z-heading><dl><dt>Slots</dt><dd>Use trigger, default content, and optional footer. Keep the footer for a clear completion action.</dd><dt>heading / description</dt><dd>Set enough context that the drawer is understandable without the triggering page remaining visible.</dd><dt>is-open, open, close</dt><dd>Reflected state with bubbling lifecycle events.</dd><dt>is-static</dt><dd>Prevents backdrop dismissal. Avoid it for ordinary quick actions because drag and Escape remain expected exits.</dd><dt>Choice</dt><dd>Use for a short, mobile-forward task. For dense desktop forms, a sheet or dialog is usually clearer.</dd></dl></section>
	</ComponentDoc>
)
