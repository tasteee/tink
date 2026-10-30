import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZToasterDoc = () => (
	<ComponentDoc
		tag="z-toaster"
		description="Transient notifications for completed background work. Call toaster.show() from anywhere; decisions and required recovery steps belong in a dialog, not a toast."
	>
		<DocExample
			demo="z-toaster/show-a-toast"
			title="Show a toast"
			description="A string is enough. A <z-toaster> region is added to <body> on first use; place your own to choose its position (bottom-end, top-center, …). An object adds a description, a tone, and a duration in ms (default 4000). Timed toasts draw their remaining time as a ring around ×, and pause while hovered or focused."
		/>
		<DocExample
			demo="z-toaster/hide-and-clear"
			title="Hide one, or clear them all"
			description="show() returns a hide function for that toast. toaster.hide(id) hides by id, toaster.clear() hides everything. Infinity (or 0) keeps a toast until it's hidden."
		/>
		<DocExample
			demo="z-toaster/update-in-place"
			title="Update in place"
			description="One toast per id. Showing an id that's already up updates it and restarts its countdown, so a job reads as one toast from start to finish."
		/>
	</ComponentDoc>
)
