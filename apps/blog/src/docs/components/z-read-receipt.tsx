import { ComponentDoc } from '@app/docs/ComponentDoc'
import { withProps } from '@app/docs/withProps'

const SEEN = [{ name: 'Bob Chen' }, { name: 'Priya N' }, { name: 'Sam Okafor' }, { name: 'Dana Lee' }, { name: 'Kai' }]

export const ZReadReceiptDoc = () => (
	<ComponentDoc
		tag="z-read-receipt"
		category="Chat"
		description="A row of small overlapping avatars showing who has seen a message, with an optional +N overflow and a leading label. Data-driven via the avatars property. Composes z-avatar."
	>
		<div className="block">
			<div className="panel">
				<div className="col" style={{ gap: '1rem', alignItems: 'flex-start' }}>
					<z-read-receipt ref={withProps({ avatars: SEEN.slice(0, 2) })} />
					<z-read-receipt label="Seen by" ref={withProps({ avatars: SEEN })} />
					<z-read-receipt label="Seen" max={4} ref={withProps({ avatars: SEEN })} />
				</div>
			</div>
		</div>
	</ComponentDoc>
)
