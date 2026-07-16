import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZSheetDoc = () => (
	<ComponentDoc tag="z-sheet" category="Overlays" description="A modal panel entering from a page edge. Use it for supporting work such as filters or navigation that benefits from more room than a popover.">
		<DocExample title="Keep filter actions available" description="Use the default slot for controls and footer for the commit action. This preserves the action while a long filter list scrolls." code={`<z-sheet side="right" heading="Filters" description="Narrow the results below.">
  <z-button slot="trigger" kind="outline">Filters</z-button>
  <z-column gap="2"><z-checkbox>In stock</z-checkbox><z-checkbox>Free shipping</z-checkbox></z-column>
  <z-button slot="footer">Apply filters</z-button>
</z-sheet>`}><z-sheet side="right" heading="Filters" description="Narrow the results below."><z-button slot="trigger" kind="outline">Filters</z-button><z-column gap="2"><z-checkbox>In stock</z-checkbox><z-checkbox>Free shipping</z-checkbox></z-column><z-button slot="footer">Apply filters</z-button></z-sheet></DocExample>
		<DocExample title="Choose the edge to match the job" description="Right is a natural secondary workspace or inspector; left fits navigation. Like dialogs, sheets are modal and should not be stacked." code={`<z-sheet side="left" heading="Navigation"><z-button slot="trigger">Open navigation</z-button>...</z-sheet>`}><z-sheet side="left" heading="Navigation"><z-button slot="trigger" kind="outline">Navigation</z-button><z-text size="sm" color="muted">A left-edge sheet works well for temporary navigation.</z-text></z-sheet></DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">UX and API</z-heading><dl><dt>side</dt><dd>Use left or right. Pick a side consistently throughout an application.</dd><dt>Slots</dt><dd>Use trigger, default content, and optional footer slots. The footer remains separate from the scrolling body.</dd><dt>is-open, open, close</dt><dd>Reflected state plus bubbling lifecycle events for application-controlled state.</dd><dt>hide-close / is-static</dt><dd>Hide the close button only with another clear exit. Static blocks backdrop dismissal; reserve it for unfinished work that needs an explicit choice.</dd><dt>is-disabled</dt><dd>Stops the trigger from opening the sheet.</dd></dl></section>
	</ComponentDoc>
)
