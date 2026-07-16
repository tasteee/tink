import type { ReactNode } from 'react'
import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

type FormExample = { title: string; description: string; code: string; children: ReactNode }
type Reference = { term: string; detail: ReactNode }

/** Shared, intentionally open format for the form-control reference pages. */
export const FormDoc = ({ tag, description, examples, reference }: { tag: string; description: string; examples: FormExample[]; reference: Reference[] }) => (
	<ComponentDoc tag={tag} category="Forms" description={description}>
		{examples.map((example) => <DocExample key={example.title} {...example} />)}
		<section className="doc-reference"><z-heading size="xs" tag="h2">Props, events, and guidance</z-heading><dl>{reference.map((item) => <><dt key={`${item.term}-term`}>{item.term}</dt><dd key={`${item.term}-detail`}>{item.detail}</dd></>)}</dl></section>
	</ComponentDoc>
)
