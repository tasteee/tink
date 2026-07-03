import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZBoxDoc = () => (
	<ComponentDoc
		tag="z-box"
		category="Foundations"
		description="The general-purpose layout primitive — flexbox or grid via boolean props, no CSS required."
	>
		<div className="block">
			<div className="block-title">
				<h3>&lt;z-box&gt;</h3>
				<span className="desc">flex · column</span>
			</div>
			<div className="panel">
				<z-box isFlex isColumn gap="4">
					<z-text>Column layout</z-text>
					<z-text color="muted">isFlex isColumn gap="4"</z-text>
				</z-box>
			</div>
		</div>

		<div className="block">
			<div className="block-title">
				<h3>&lt;z-box&gt;</h3>
				<span className="desc">flex · row · wrap</span>
			</div>
			<div className="panel">
				<z-box isFlex isRow gap="3" doesWrap>
					<z-badge kind="outline">Row</z-badge>
					<z-badge kind="outline">doesWrap</z-badge>
					<z-badge kind="outline">gap="3"</z-badge>
				</z-box>
			</div>
		</div>

		<div className="block">
			<div className="block-title">
				<h3>&lt;z-box&gt;</h3>
				<span className="desc">flex · row · space-between</span>
			</div>
			<div className="panel">
				<z-box isFlex isRow yCenter xBetween marginBottom="1rem">
					<z-text weight="700" size="sm">
						Left
					</z-text>
					<z-text color="muted" size="xs">
						Right
					</z-text>
				</z-box>
			</div>
		</div>

		<div className="block">
			<div className="block-title">
				<h3>&lt;z-box&gt;</h3>
				<span className="desc">grid · responsive columns</span>
			</div>
			<div className="panel">
				<z-box isGrid columns="1" mediumColumns="3" gap="4">
					<z-card isColumn gap="2">
						<z-text size="sm">One</z-text>
					</z-card>
					<z-card isColumn gap="2">
						<z-text size="sm">Two</z-text>
					</z-card>
					<z-card isColumn gap="2">
						<z-text size="sm">Three</z-text>
					</z-card>
				</z-box>
			</div>
		</div>
	</ComponentDoc>
)
