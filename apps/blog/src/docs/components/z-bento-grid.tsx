import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZBentoGridDoc = () => (
	<ComponentDoc
		tag="z-bento-grid"
		category="Layout"
		description="Fixed-row-height grid of z-bento-item cells — spanning tiles, icon/background slots, hover-reveal CTA."
	>
		<div className="block">
			<div className="panel">
				<z-bento-grid columns={3} gap="3" rowHeight="10rem">
					<z-bento-item colSpan={2} href="#">
						<z-heading size="xs" tag="h3">
							Realtime sync
						</z-heading>
						<z-text size="sm" color="muted">
							Every client sees the same state within milliseconds.
						</z-text>
					</z-bento-item>

					<z-bento-item rowSpan={2}>
						<z-heading size="xs" tag="h3">
							Type-safe
						</z-heading>
						<z-text size="sm" color="muted">
							End-to-end types, no codegen step.
						</z-text>
					</z-bento-item>

					<z-bento-item>
						<z-heading size="xs" tag="h3">
							Edge-deployed
						</z-heading>
						<z-text size="sm" color="muted">
							Low latency, everywhere.
						</z-text>
					</z-bento-item>

					<z-bento-item>
						<z-heading size="xs" tag="h3">
							Open source
						</z-heading>
						<z-text size="sm" color="muted">
							MIT licensed.
						</z-text>
					</z-bento-item>

					<z-bento-item colSpan={2} href="#" ctaLabel="Read the docs">
						<z-heading size="xs" tag="h3">
							Batteries included
						</z-heading>
						<z-text size="sm" color="muted">
							Auth, storage, and search ship with every project.
						</z-text>
					</z-bento-item>
				</z-bento-grid>
			</div>
		</div>
	</ComponentDoc>
)
