import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZSwapDoc = () => (
	<ComponentDoc
		tag="z-swap"
		category="Actions"
		description="A small, checkable two-face control. Use it when the control’s visible content itself should transform between off and on states."
	>
		<DocExample
			demo="z-swap/provide-two-explicit-faces"
			title="Provide two explicit faces"
			description="Put the inactive face in off and the active face in on."
		/>
		<DocExample
			demo="z-swap/choose-a-motion-that-communicates"
			title="Choose a motion that communicates change"
			description="Fade is calm, rotate suggests a mode change, and flip is more expressive."
		/>
		<DocExample
			demo="z-swap/observe-the-value"
			title="Observe the value"
			description="The reflected is-active state lets external application state stay in sync."
		/>
	</ComponentDoc>
)
