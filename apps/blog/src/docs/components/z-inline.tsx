import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZInlineDoc = () => (
	<ComponentDoc
		tag="z-inline"
		category="Foundations"
		description="An inline style patch for text nested inside z-text/z-heading — inherits font-size, line-height, and font-family from its context, and only overrides color, weight, or style."
	>
		<div className="block">
			<div className="block-title">
				<h3>&lt;z-inline&gt;</h3>
				<span className="desc">color · weight · style</span>
			</div>
			<div className="panel">
				<z-box isFlex isColumn gap="4">
					<z-text size="xl">
						A lede sized <code className="inline">xl</code>, with{' '}
						<z-inline color="muted" weight="400">
							a muted aside
						</z-inline>{' '}
						that stays <code className="inline">xl</code> instead of collapsing to the{' '}
						<code className="inline">md</code> default the way an unsized{' '}
						<code className="inline">z-text tag="span"</code> would.
					</z-text>
					<z-heading size="sm" tag="h3">
						Works inside headings too — <z-inline color="primary">highlighted</z-inline>
					</z-heading>
				</z-box>
			</div>
		</div>
	</ComponentDoc>
)
