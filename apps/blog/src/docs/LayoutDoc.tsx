import type { ReactNode } from 'react'
import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

type Example = { title: string; description: string; code: string; children: ReactNode }
type Reference = { term: string; detail: ReactNode }

/** Shared long-form format for layout primitives. */
export const LayoutDoc = ({ tag, description, examples, reference }: { tag: string; description: string; examples: Example[]; reference: Reference[] }) => (
	<ComponentDoc tag={tag} category="Layout" description={description}>
		{examples.map((example) => <DocExample key={example.title} {...example} />)}
		<section className="doc-reference">
			<z-heading size="xs" tag="h2">Props and guidance</z-heading>
			<dl>{reference.map((item) => <div key={item.term}><dt>{item.term}</dt><dd>{item.detail}</dd></div>)}</dl>
		</section>
	</ComponentDoc>
)
