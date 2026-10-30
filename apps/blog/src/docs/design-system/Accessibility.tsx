import { Article } from '@app/docs/Prose'

export const Accessibility = () => (
	<Article
		eyebrow="System"
		title="Accessibility"
		lede="Zest leans on the platform first: native buttons, <dialog>, and the Popover API bring focus management, Esc, and top-layer stacking for free. The rest is a short list of commitments."
	>
		<h2>Keyboard</h2>
		<ul>
			<li>Every interactive element is reachable and operable by keyboard, with a visible focus ring.</li>
			<li>Lists (menus, tabs, command palette) use arrow keys, skip disabled rows, and commit with Enter.</li>
			<li>Overlays close on Esc and return focus to what opened them.</li>
		</ul>

		<h2>Names and roles</h2>
		<ul>
			<li>
				Icon-only controls still need an accessible name (<code>aria-label</code>); a tooltip is supplementary, never the
				label.
			</li>
			<li>
				Fields get their accessible name from <code>z-field</code>’s label, forwarded across the shadow boundary.
			</li>
			<li>Toasts announce politely; danger toasts announce assertively.</li>
		</ul>

		<h2>Time</h2>
		<ul>
			<li>Toast countdowns pause while the stack is hovered or focused, and while the tab is hidden.</li>
			<li>Nothing essential lives only in a transient surface. Decisions belong in dialogs, not toasts.</li>
		</ul>

		<h2>Motion</h2>
		<p>Reduced-motion preferences remove all travel and scale, keeping only fades. See Motion.</p>

		<h2>Contrast</h2>
		<p>
			Text tokens meet WCAG AA against their intended surfaces. Tooltips use the inverse surface so they stay legible over
			any UI.
		</p>
	</Article>
)
