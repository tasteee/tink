import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZCollapsibleDoc = () => (
	<ComponentDoc tag="z-collapsible" category="Navigation" description="A single disclosure panel — standalone, or coordinated inside z-accordion.">
		<div className="block">
			<div className="panel">
				<div className='micro'>Standalone collapsible</div>
				<z-collapsible label='What is zest?' isOpen>
					A dark-only, border-first component language. No shadows, OKLCH color, DM Sans throughout.
				</z-collapsible>
				<z-collapsible label='Is it accessible?'>
					Focus rings, ARIA roles, and full keyboard support ship on every interactive component.
				</z-collapsible>
			</div>
		</div>
	</ComponentDoc>
)
