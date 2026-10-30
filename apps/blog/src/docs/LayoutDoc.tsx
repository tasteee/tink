import type { ReactNode } from 'react'
import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

type LayoutExampleT = { title: string; description: string; code: string; children: ReactNode }
type LayoutDocPropsT = { tag: string; description: string; examples: LayoutExampleT[] }

// Shared long-form format for layout primitives. The API section is rendered
// by ComponentDoc.
export const LayoutDoc = (props: LayoutDocPropsT) => {
	return (
		<ComponentDoc tag={props.tag} category="Layout" description={props.description}>
			{props.examples.map((example: LayoutExampleT) => (
				<DocExample key={example.title} {...example} />
			))}
		</ComponentDoc>
	)
}
