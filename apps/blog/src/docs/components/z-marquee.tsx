import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZMarqueeDoc = () => (
	<ComponentDoc
		tag="z-marquee"
		category="Specialized"
		description="Infinite auto-scrolling row over slotted content, pause on hover, reverse, vertical, edge fade."
	>
		<DocExample demo="z-marquee/default" title="Default" description="" />
		<DocExample demo="z-marquee/reverse-faster" title="Reverse, faster" description="" />
		<DocExample
			demo="z-marquee/vertical"
			title="Vertical"
			description="height-constrained container, scrolling on the Y axis"
		/>
	</ComponentDoc>
)
