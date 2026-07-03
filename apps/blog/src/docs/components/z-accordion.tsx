import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZAccordionDoc = () => (
	<ComponentDoc tag="z-accordion" category="Navigation" description="Coordinates a set of z-collapsible children so only one (or several) stay open at once.">
		<div className="block">
			<div className="panel">
				<div className='micro'>Accordion — single open</div>
				<z-accordion type='single'>
					<z-collapsible value='ship' label='Shipping' isOpen>
						Orders leave the warehouse within two business days.
					</z-collapsible>
					<z-collapsible value='returns' label='Returns'>Thirty-day window, no questions asked.</z-collapsible>
					<z-collapsible value='warranty' label='Warranty'>One year of coverage against manufacturing defects.</z-collapsible>
				</z-accordion>
			</div>
		</div>
	</ComponentDoc>
)
