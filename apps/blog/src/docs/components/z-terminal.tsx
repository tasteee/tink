import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZTerminalDoc = () => (
	<ComponentDoc
		tag="z-terminal"
		description="A clean terminal surface for command walkthroughs: mock shell + cwd, window dots, and per-line copy on hover. Add animate to type commands out live and fade output in; lines gives per-line timing control."
	>
		<DocExample
			demo="z-terminal/commands"
			title="Show commands and output"
			description="Prompt lines ($) are copyable on hover; tone tints the prompt."
		/>
		<DocExample
			demo="z-terminal/animated"
			title="Type it out"
			description="animate types commands and fades output in; start-on-view waits until it scrolls into view, loop repeats it."
		/>
		<DocExample
			demo="z-terminal/per-line-timing"
			title="Control per-line timing"
			description="lines takes { text, delay?, typeSpeed? } entries, so slow steps can hold before the next line starts."
		/>
	</ComponentDoc>
)
