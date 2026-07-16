import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

const Icon = ({ children }: { children: string }) => <span style={{ fontSize: '1.125rem' }}>{children}</span>

export const ZDockDoc = () => (
	<ComponentDoc tag="z-dock" category="Navigation" description="A pointer-responsive icon dock for a very small set of high-frequency destinations. It is decorative app chrome, not a substitute for a full navigation model.">
		<DocExample title="Compose with dock items" description="The dock owns restrained magnification; each child owns its label, action, and active indicator. Provide a label for every icon." code={`<z-dock magnification={1.08} distance={96}>
  <z-dock-item label="Home" href="/"><HomeIcon /></z-dock-item>
  <z-dock-item label="Messages" is-active><MessageIcon /></z-dock-item>
</z-dock>`}><z-row alignsX="center" style={{ width: '100%', paddingBlock: '2rem' }}><z-dock magnification={1.08} distance={96}><z-dock-item label="Home"><Icon>H</Icon></z-dock-item><z-dock-item label="Search"><Icon>S</Icon></z-dock-item><z-dock-item label="Messages" isActive><Icon>M</Icon></z-dock-item></z-dock></z-row></DocExample>
		<DocExample title="Tune the physical footprint" description="The effect is capped at a subtle 12% scale, then reduces further whenever items are close together. item-size and gap accept CSS sizes." code={`<z-dock item-size="2.5rem" gap="0.5rem" magnification={1.1} distance={96}>
  <z-dock-item label="Files"><FileIcon /></z-dock-item>
  <z-dock-item label="Settings"><SettingsIcon /></z-dock-item>
</z-dock>`}><z-row alignsX="center" style={{ width: '100%', paddingBlock: '1.5rem' }}><z-dock itemSize="2.5rem" gap="0.5rem" magnification={1.1} distance={96}><z-dock-item label="Files"><Icon>F</Icon></z-dock-item><z-dock-item label="Settings"><Icon>S</Icon></z-dock-item></z-dock></z-row></DocExample>
		<DocExample title="Float intentionally" description="floating fixes the dock to the viewport's bottom center. Use it only when the dock is persistent and cannot cover essential page controls." code={`<z-dock floating>...</z-dock>`}><z-text size="sm" color="muted">Set <code>floating</code> in application chrome; it is not enabled in this documentation preview.</z-text></DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">Guidance</z-heading><dl><dt>Children</dt><dd>Use direct <code>z-dock-item</code> children. The dock calculates and applies their scale from pointer distance.</dd><dt>magnification / distance</dt><dd>Control the maximum scale and pointer reach. Magnification is capped at 1.12, then constrained by the space between items.</dd><dt>item-size / gap</dt><dd>CSS-size properties for adapting the dock to the surrounding interface. With no gap, items remain at their base size.</dd><dt>floating</dt><dd>Fixes the dock at the viewport bottom center. Check small screens and safe areas before using it.</dd></dl></section>
	</ComponentDoc>
)
