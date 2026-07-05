import { ComponentDoc } from '@app/docs/ComponentDoc'

const ago = (ms: number) => new Date(Date.now() - ms).toISOString()

export const ZRelativeTimeDoc = () => (
	<ComponentDoc
		tag="z-relative-time"
		category="Data Display"
		description="An auto-updating timestamp — 'just now', '2m', '3h', 'Yesterday', then an absolute date. All instances share one timer."
	>
		<div className="block">
			<div className="panel">
				<div className="col" style={{ gap: '0.5rem' }}>
					<div className="row" style={{ gap: '0.5rem' }}>
						<z-text color="muted">Sent</z-text>
						<z-relative-time datetime={ago(20 * 1000)} />
					</div>
					<div className="row" style={{ gap: '0.5rem' }}>
						<z-text color="muted">Edited</z-text>
						<z-relative-time datetime={ago(4 * 60 * 1000)} />
					</div>
					<div className="row" style={{ gap: '0.5rem' }}>
						<z-text color="muted">Last seen</z-text>
						<z-relative-time datetime={ago(3 * 60 * 60 * 1000)} />
					</div>
					<div className="row" style={{ gap: '0.5rem' }}>
						<z-text color="muted">Joined</z-text>
						<z-relative-time datetime={ago(40 * 24 * 60 * 60 * 1000)} />
					</div>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
