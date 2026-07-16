import { useRef } from 'react'
import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

type Toaster = HTMLElement & { push?: (toast: unknown) => void; dismiss?: (id: number) => void }

export const ZToastDoc = () => {
	const toasterRef = useRef<Toaster>(null)
	const push = (toast: unknown) => toasterRef.current?.push?.(toast)

	return <ComponentDoc tag="z-toast" category="Overlays" description="A global, transient notification stack. Announce completed background work; do not put decisions or required recovery steps in a toast.">
		<DocExample title="Push feedback after a completed action" description="Mount one toaster near the application root and call its imperative push method. A title states the outcome; description is optional detail." code={`const toaster = document.querySelector('z-toast')
toaster.push({ tone: 'success', title: 'Changes saved', description: 'Project is up to date.' })`} language="ts"><z-row gap="2" wrap><z-button kind="outline" onClick={() => push({ tone: 'success', title: 'Changes saved', description: 'Project is up to date.' })}>Success</z-button><z-button kind="outline" onClick={() => push({ tone: 'info', title: 'New comment', description: 'Ada left feedback.' })}>Info</z-button></z-row></DocExample>
		<DocExample title="Set a duration only when feedback can expire" description="duration is milliseconds; 0 creates a sticky toast that requires dismissal. Sticky notices should be rare and include a clear recovery path elsewhere." code={`toaster.push({ tone: 'danger', title: 'Upload failed', description: 'Choose a smaller file.', duration: 6000 })
toaster.push({ tone: 'warning', title: 'Connection lost', duration: 0 })`} language="ts"><z-button kind="outline" tone="danger" onClick={() => push({ tone: 'danger', title: 'Upload failed', description: 'Choose a smaller file.', duration: 6000 })}>Failure example</z-button></DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">UX and API</z-heading><dl><dt>push(toast)</dt><dd>Imperative method accepting title, optional description, tone, and duration. It returns the new toast identifier.</dd><dt>dismiss(id) / dismiss event</dt><dd>Dismiss an individual toast programmatically; dismiss emits its identifier when a toast leaves.</dd><dt>position</dt><dd>Use a consistent corner such as bottom-end. Mount a single stack per application.</dd><dt>Duration</dt><dd>Use a short duration for confirmations. Use 0 only for persistent conditions that can be resolved from elsewhere.</dd><dt>Choice</dt><dd>Toast confirms background work. Use an alert for persistent in-context status and a dialog for an immediate decision.</dd></dl></section>
		<z-toast position="bottom-end" ref={toasterRef as never} />
	</ComponentDoc>
}
