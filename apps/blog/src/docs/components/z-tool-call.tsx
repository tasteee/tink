import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZToolCallDoc = () => (
	<ComponentDoc
		tag="z-tool-call"
		category="Chat"
		description="An expandable card for an agent tool invocation — name, run status (running / success / error), call arguments, and result. Composes z-collapsible and z-code-block. Pass args (JSON) and result strings, or slot [slot=result] for richer output."
	>
		<div className="block">
			<h3>Success (expanded)</h3>
			<div className="panel">
				<z-tool-call
					name="search_web"
					status="success"
					is-expanded
					args={'{\n  "query": "zest web components",\n  "limit": 3\n}'}
					result={'Found 3 results:\n1. zest — component library\n2. ink.css tokens\n3. atomico elements'}
				/>
			</div>
		</div>

		<div className="block">
			<h3>Running & error</h3>
			<div className="panel">
				<div className="col" style={{ gap: '0.75rem' }}>
					<z-tool-call name="fetch_page" status="running" args={'{ "url": "https://example.com" }'} />
					<z-tool-call name="run_query" status="error" args={'{ "sql": "SELECT * FROM missing" }'} result="Error: relation 'missing' does not exist" />
				</div>
			</div>
		</div>
	</ComponentDoc>
)
