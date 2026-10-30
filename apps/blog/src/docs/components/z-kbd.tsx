import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZKbdDoc = () => (
	<ComponentDoc
		tag="z-kbd"
		category="Data Display"
		description="A keyboard key cap for documenting shortcuts, mono, bordered, with a subtle raised edge. Five sizes."
	>
		<DocExample demo="z-kbd/sizes" title="Sizes" description="" />
		<DocExample demo="z-kbd/chords" title="Chords" description={'combine with plain "+" between keys'} />
	</ComponentDoc>
)
