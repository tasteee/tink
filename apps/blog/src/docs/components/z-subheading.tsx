import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZSubheadingDoc = () => (
	<ComponentDoc
		tag="z-subheading"
		category="Foundations"
		description="A small, uppercase, letter-spaced label — used for section eyebrows and tags."
	>
		<div className="block">
			<div className="block-title">
				<h3>&lt;z-subheading&gt;</h3>
				<span className="desc">uppercase · tracked</span>
			</div>
			<div className="panel">
				<z-subheading size="sm" color="muted">
					Subheading · uppercase · tracked
				</z-subheading>
			</div>
		</div>
	</ComponentDoc>
)
