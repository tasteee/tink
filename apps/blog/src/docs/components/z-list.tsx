import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZListDoc = () => (
	<ComponentDoc
		tag="z-list"
		category="Data Display"
		description="A vertical stack of hairline-divided rows on a card surface. Compose with z-list-row, whose second child grows to fill the row."
	>
		<div className="block">
			<div className="block-title">
				<h3>Rows</h3>
				<span className="desc">icon · growing title block · trailing action</span>
			</div>
			<div className="panel">
				<z-list label="Most active" style={{ maxWidth: '28rem' }}>
					<z-list-row>
						<z-avatar size="sm" label="DL"></z-avatar>
						<div>
							<z-text weight="600">Dio Lupa</z-text>
							<z-text size="sm" color="muted" style={{ display: 'block' }}>
								Remaining Reason
							</z-text>
						</div>
						<z-button kind="ghost" size="small">▶</z-button>
					</z-list-row>
					<z-list-row>
						<z-avatar size="sm" label="EN"></z-avatar>
						<div>
							<z-text weight="600">Ellie Beilish</z-text>
							<z-text size="sm" color="muted" style={{ display: 'block' }}>
								Bears of a fever
							</z-text>
						</div>
						<z-button kind="ghost" size="small">▶</z-button>
					</z-list-row>
					<z-list-row>
						<z-avatar size="sm" label="JR"></z-avatar>
						<div>
							<z-text weight="600">Sabrino Gardener</z-text>
							<z-text size="sm" color="muted" style={{ display: 'block' }}>
								Cappuccino
							</z-text>
						</div>
						<z-button kind="ghost" size="small">▶</z-button>
					</z-list-row>
				</z-list>
			</div>
		</div>
		<div className="block">
			<div className="block-title">
				<h3>Wrapping content</h3>
				<span className="desc">is-wrap drops a child onto its own full-width line</span>
			</div>
			<div className="panel">
				<z-list style={{ maxWidth: '28rem' }}>
					<z-list-row>
						<z-badge kind="solid" tone="primary">1</z-badge>
						<z-text weight="600">Prepare the mise en place</z-text>
						<z-kbd size="sm">↵</z-kbd>
						<z-text size="sm" color="muted" className="is-wrap">
							Chop, measure, and lay out every ingredient before turning on the heat.
						</z-text>
					</z-list-row>
				</z-list>
			</div>
		</div>
	</ComponentDoc>
)
