import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZLabelDoc = () => (
	<ComponentDoc
		tag="z-label"
		category="Foundations"
		description="A UI label — same size/color/weight API as z-text, used above form fields."
	>
		<div className="block">
			<div className="block-title">
				<h3>&lt;z-label&gt;</h3>
				<span className="desc">size · color</span>
			</div>
			<div className="panel">
				<z-box isFlex isColumn gap="3">
					<z-label size="md">Email address</z-label>
					<z-label size="sm" color="muted">
						Optional field
					</z-label>
				</z-box>
			</div>
		</div>
	</ComponentDoc>
)
