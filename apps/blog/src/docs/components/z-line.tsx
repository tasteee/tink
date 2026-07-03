import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZLineDoc = () => (
	<ComponentDoc
		tag="z-line"
		category="Foundations"
		description="A hairline divider — vertical by default via `isVertical`, sized by its container."
	>
		<div className="block">
			<div className="block-title">
				<h3>&lt;z-line&gt;</h3>
				<span className="desc">isVertical</span>
			</div>
			<div className="panel">
				<z-box isFlex isRow gap="3" yCenter>
					<z-text size="sm">Section one</z-text>
					<z-line isVertical style={{ height: '1.25rem' }} />
					<z-text size="sm" color="muted">
						Section two
					</z-text>
				</z-box>
			</div>
		</div>
	</ComponentDoc>
)
