import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZDockItemDoc = () => (
	<ComponentDoc tag="z-dock-item" category="Navigation" description="One labeled icon action inside z-dock. It never stands alone: the parent supplies magnification and the item supplies semantics.">
		<DocExample title="Use a label and active marker" description="The label becomes the accessible name and hover tooltip. is-active adds the small current-location marker." code={`<z-dock>
  <z-dock-item label="Home" is-active><HomeIcon /></z-dock-item>
  <z-dock-item label="Search"><SearchIcon /></z-dock-item>
</z-dock>`}><z-row alignsX="center" style={{ width: '100%', paddingBlock: '1.5rem' }}><z-dock><z-dock-item label="Home" isActive>âŒ‚</z-dock-item><z-dock-item label="Search">âŒ•</z-dock-item></z-dock></z-row></DocExample>
		<DocExample title="Choose link or command semantics" description="href renders a real link. Without it, the item is a button and emits select for application-controlled commands." code={`<z-dock-item label="Projects" href="/projects"><ProjectIcon /></z-dock-item>
<z-dock-item label="Open search"><SearchIcon /></z-dock-item>

searchItem.addEventListener('select', () => openSearch())`} language="ts"><z-row alignsX="center" style={{ width: '100%', paddingBlock: '1.5rem' }}><z-dock><z-dock-item label="Projects" href="#projects">â–£</z-dock-item><z-dock-item label="Open search">âŒ•</z-dock-item></z-dock></z-row></DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">Guidance</z-heading><dl><dt>Parent</dt><dd>Place directly inside <code>z-dock</code>; standalone use loses the intended interaction and layout.</dd><dt>label</dt><dd>Required in practice: it names the button or link and is shown in the tooltip.</dd><dt>href</dt><dd>Use for a destination. Omit it for an in-place command and listen for select.</dd><dt>is-active</dt><dd>Use for the one current destination, not for hover or a temporary pending state.</dd></dl></section>
	</ComponentDoc>
)
