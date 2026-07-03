import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZCardDoc = () => (
	<ComponentDoc tag="z-card" category="Foundations" description="borders only — no shadows, ever.">
		<div className="block">
			<div className="block-title">
				<h3>&lt;z-card&gt;</h3>
				<span className="desc">doesLightUpOnHover</span>
			</div>
			<div className="panel-grid">
				<z-card doesLightUpOnHover isFlex isColumn gap="3">
					<z-box isFlex isRow yCenter marginBottom="1rem" xBetween>
						<z-text color="primary" weight="700" size="sm">
							Active
						</z-text>
						<z-text color="muted" size="xs">
							2 min ago
						</z-text>
					</z-box>
					<z-heading size="xs" tag="h3">
						Project Alpha
					</z-heading>
					<z-text size="sm" color="muted">
						Breaking conventions since day one. No rules, just results.
					</z-text>
				</z-card>
				<z-card doesLightUpOnHover isFlex isColumn gap="3">
					<z-box isFlex isRow yCenter xBetween marginBottom="1rem">
						<z-text color="secondary" weight="lg" size="sm">
							Draft
						</z-text>
						<z-text color="muted" size="xs">
							Yesterday
						</z-text>
					</z-box>
					<z-heading size="xs" tag="h3">
						Campaign Beta
					</z-heading>
					<z-text size="sm" color="muted">
						Still cooking. The best things take time to burn bright.
					</z-text>
				</z-card>
			</div>
		</div>
	</ComponentDoc>
)
