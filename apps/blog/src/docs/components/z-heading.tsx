import { DocsLink } from '@app/docs/DocsLink'
import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZHeadingDoc = () => (
	<ComponentDoc
		tag="z-heading"
		category="Foundations"
		description="Six sizes (xxl…xs) that map one-to-one onto h1–h6; `tag` decouples visual size from document outline."
	>
		<div className="block">
			<div className="block-title">
				<h3>&lt;z-heading&gt;</h3>
				<span className="desc">size vs. tag</span>
			</div>
			<div className="panel">
				<z-box isFlex isColumn gap="4">
					<z-heading size="xxl">The quick brown fox</z-heading>
					<z-heading size="lg" tag="h2">
						Jumps over the lazy dog
					</z-heading>
				</z-box>
			</div>
			<z-text size="sm" color="muted">
				The full six-step scale lives on the <DocsLink href="/typography">Typography</DocsLink> page.
			</z-text>
		</div>
	</ComponentDoc>
)
