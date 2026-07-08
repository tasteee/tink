import { ComponentDoc } from '@app/docs/ComponentDoc'
import { withProps } from '@app/docs/withProps'

const SOURCES = [
	{ title: 'Canberra — Wikipedia', url: 'https://en.wikipedia.org/wiki/Canberra', snippet: 'Canberra is the capital city of Australia, located in the Australian Capital Territory.' },
	{ title: 'Why Canberra is the capital', url: 'https://www.nationalcapital.gov.au/', snippet: 'Chosen as a compromise between Sydney and Melbourne in 1908.' },
	{ title: 'Australian Capital Territory', url: 'https://example.gov.au/act' }
]

export const ZSourcesDoc = () => (
	<ComponentDoc
		tag="z-sources"
		category="Chat"
		description="The grounding references under an AI answer — a labeled list of source cards (index, title, domain, optional snippet). Pairs with inline z-citation. Data-driven via the sources property; clicking emits select {index, url}."
	>
		<div className="block">
			<div className="panel" style={{ maxWidth: '460px' }}>
				<z-sources ref={withProps({ sources: SOURCES })} />
			</div>
		</div>

		<div className="block">
			<h3>Two columns</h3>
			<div className="panel">
				<z-sources columns={2} label="References" ref={withProps({ sources: SOURCES })} />
			</div>
		</div>
	</ComponentDoc>
)
