import { ComponentDoc } from '@app/docs/ComponentDoc'
import { withProps } from '@app/docs/withProps'

const DEMO_CODE = `const resolveToneClass = (props: any): string => {
	if (props.tone === 'primary') return 'is-primary'
	if (props.tone === 'secondary') return 'is-secondary'
	return 'is-neutral'
}`

export const ZCodeBlockDoc = () => (
	<ComponentDoc
		tag="z-code-block"
		category="Specialized"
		description="A syntax-highlighted code block — filename header, copy button, optional line numbers."
	>
		<div className="block">
			<div className="panel">
				<z-code-block filename='overlay.tsx' language='tsx' isLineNumbers ref={withProps({ code: DEMO_CODE })} />
			</div>
		</div>
	</ComponentDoc>
)
