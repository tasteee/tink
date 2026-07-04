import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZCalloutDoc = () => (
	<ComponentDoc
		tag="z-callout"
		category="Specialized"
		description="An in-flow documentation admonition. Five kinds — note, tip, important, warning, caution — each with its own hue and icon. A heading is optional; omit it for a compact, icon-only note. Distinct from z-alert, which is a dismissable status banner."
	>
		<div className="block">
			<div className="block-title">
				<h3>Kinds</h3>
				<span className="desc">left accent bar · auto icon · optional heading · slotted body</span>
			</div>
			<div className="panel">
				<div className="col" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
					<z-callout kind="note" heading="Note">
						Web components register globally, so an element is defined exactly once per document.
					</z-callout>
					<z-callout kind="tip" heading="Tip">
						Pass <z-kbd size="sm">--callout-color</z-kbd> to retint any callout to a brand hue.
					</z-callout>
					<z-callout kind="important" heading="Important">
						The <z-kbd size="sm">ink.css</z-kbd> tokens must be imported at the document level, not inside a shadow root.
					</z-callout>
					<z-callout kind="warning" heading="Warning">
						Reflected boolean props default to <code>false</code> — model absence, not presence.
					</z-callout>
					<z-callout kind="caution" heading="Caution">
						Overwriting a slot's assigned nodes during render can detach event listeners on live children.
					</z-callout>
				</div>
			</div>
		</div>

		<div className="block">
			<div className="block-title">
				<h3>No heading</h3>
				<span className="desc">omit heading for a compact, icon-only note</span>
			</div>
			<div className="panel">
				<z-callout kind="note">
					A single line of guidance with just the icon for emphasis.
				</z-callout>
			</div>
		</div>

		<div className="block">
			<div className="block-title">
				<h3>Expandable</h3>
				<span className="desc">is-expandable clamps to two lines with an inline Show more / Show less</span>
			</div>
			<div className="panel">
				<div className="col" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
					<z-callout kind="tip" heading="Shadow DOM styling" is-expandable>
						Styles authored inside a component's shadow root are fully encapsulated. Because ::selection and other
						pseudo-elements don't cross the shadow boundary, anything you want to match the page — selection colors,
						scrollbars, font smoothing — has to be restated inside the root against the same shared tokens. This is why
						z-code-block redeclares its selection colors even though ink.css already sets them globally.
					</z-callout>
					<z-callout kind="important" is-expandable>
						Even without a heading a callout can carry more than it first shows. The copy clamps to two lines and the
						Show more affordance only appears once the text actually overflows, so short notes stay compact while longer
						ones stay tidy until the reader asks for the rest.
					</z-callout>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
