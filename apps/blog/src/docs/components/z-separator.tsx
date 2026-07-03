import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZSeparatorDoc = () => (
	<ComponentDoc
		tag="z-separator"
		category="Foundations"
		description="A horizontal hairline divider with an optional centered label."
	>
		<div className="block">
			<div className="block-title">
				<h3>&lt;z-separator&gt;</h3>
				<span className="desc">label</span>
			</div>
			<div className="panel">
				<div>
					<z-text size="sm">Section one</z-text>
					<z-separator label="Or continue with" style={{ margin: '1.5rem 0' }} />
					<z-text size="sm">Section two</z-text>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
