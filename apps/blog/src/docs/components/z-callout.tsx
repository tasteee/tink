import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZCalloutDoc = () => (
	<ComponentDoc
		tag="z-callout"
		category="Specialized"
		description="An in-flow documentation admonition. Five kinds — note, tip, important, warning, caution — each with its own hue, icon, and auto label. Distinct from z-alert, which is a dismissable status banner."
	>
		<div className="block">
			<div className="block-title">
				<h3>Kinds</h3>
				<span className="desc">left accent bar · auto icon + label · slotted body</span>
			</div>
			<div className="panel">
				<div className="col" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
					<z-callout kind="note">
						Web components register globally, so an element is defined exactly once per document.
					</z-callout>
					<z-callout kind="tip">
						Pass <z-kbd size="sm">--callout-color</z-kbd> to retint any callout to a brand hue.
					</z-callout>
					<z-callout kind="important">
						The <z-kbd size="sm">ink.css</z-kbd> tokens must be imported at the document level, not inside a shadow root.
					</z-callout>
					<z-callout kind="warning">
						Reflected boolean props default to <code>false</code> — model absence, not presence.
					</z-callout>
					<z-callout kind="caution">
						Overwriting a slot's assigned nodes during render can detach event listeners on live children.
					</z-callout>
				</div>
			</div>
		</div>

		<div className="block">
			<div className="block-title">
				<h3>Custom heading</h3>
				<span className="desc">heading overrides the kind's default label</span>
			</div>
			<div className="panel">
				<z-callout kind="tip" heading="Pro tip">
					You can override the auto label while keeping the kind's colour and icon.
				</z-callout>
			</div>
		</div>

		<div className="block">
			<div className="block-title">
				<h3>Title hidden</h3>
				<span className="desc">is-title-hidden drops the label for a compact, icon-only note</span>
			</div>
			<div className="panel">
				<z-callout kind="note" is-title-hidden>
					A single line of guidance with just the icon for emphasis.
				</z-callout>
			</div>
		</div>
	</ComponentDoc>
)
