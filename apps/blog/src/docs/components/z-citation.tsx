import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZCitationDoc = () => (
	<ComponentDoc
		tag="z-citation"
		category="Chat"
		description="An inline citation marker for grounded AI answers — a small superscript badge referencing a source. Renders an anchor when href is set, otherwise emits activate {index, href} to scroll to the matching z-sources entry."
	>
		<div className="block">
			<div className="panel">
				<z-text>
					The capital of Australia is Canberra<z-citation index={1}></z-citation>, not Sydney
					<z-citation index={2}></z-citation> as commonly assumed. The city was purpose-built as
					a compromise<z-citation index={3} href="https://example.com"></z-citation>.
				</z-text>
			</div>
		</div>
	</ComponentDoc>
)
