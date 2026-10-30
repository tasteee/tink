import type { ReactNode } from 'react'
import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

type FormExampleT = { title: string; description: string; code: string; children: ReactNode }
type FormDocPropsT = { tag: string; description: string; examples: FormExampleT[] }

// Shared format for the form-control reference pages. The API section is
// rendered by ComponentDoc.
export const FormDoc = (props: FormDocPropsT) => {
	return (
		<ComponentDoc tag={props.tag} category="Forms" description={props.description}>
			{props.examples.map((example: FormExampleT) => (
				<DocExample key={example.title} {...example} />
			))}
		</ComponentDoc>
	)
}
