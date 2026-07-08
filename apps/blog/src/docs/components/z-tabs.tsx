import { ComponentDoc } from '@app/docs/ComponentDoc'

const TABS = [
	{ value: 'overview', label: 'Overview' },
	{ value: 'activity', label: 'Activity' },
	{ value: 'settings', label: 'Settings' },
	{ value: 'billing', label: 'Billing', isDisabled: true }
]

const TRIO = [
	{ value: 'overview', label: 'Overview' },
	{ value: 'activity', label: 'Activity' },
	{ value: 'settings', label: 'Settings' }
]

const USAGE = `// tabs is an array property — assign it once the element mounts
el.tabs = [
	{ value: 'overview', label: 'Overview' },
	{ value: 'activity', label: 'Activity' },
	{ value: 'billing', label: 'Billing', isDisabled: true }
]

// react to selection
el.addEventListener('change', (e) => {
	console.log(e.detail.value) // 'overview' | 'activity' | 'billing'
})`

const MARKUP = `<!-- Panels are named slots; slot name === tab value.
     Only the active panel is rendered (no layout shift). -->
<z-tabs value="overview" tone="primary" is-fitted>
	<div slot="overview">Overview panel…</div>
	<div slot="activity">Activity panel…</div>
	<div slot="settings">Settings panel…</div>
</z-tabs>`

export const ZTabsDoc = () => (
	<ComponentDoc
		tag="z-tabs"
		category="Navigation"
		description="A tab list driven by a tabs array — panels swap via named slots with no layout shift. Full keyboard support and an accent underline on the active tab."
	>
		<div className="block">
			<div className="panel">
				<div className='micro'>Default — neutral accent, with a disabled tab</div>
				<z-tabs value='overview' tabs={TABS}>
					<div slot='overview'>
						<z-text size='sm' color='muted'>Overview — the calm landing surface. Tabs swap the active panel without a layout shift.</z-text>
					</div>
					<div slot='activity'>
						<z-text size='sm' color='muted'>Activity — recent events would stream in here.</z-text>
					</div>
					<div slot='settings'>
						<z-text size='sm' color='muted'>Settings — configuration lives behind this tab.</z-text>
					</div>
				</z-tabs>
			</div>
		</div>

		<div className="block">
			<div className="block-title">
				<h3>tone</h3>
				<span className="desc">Accent color of the active underline — primary (purple) or secondary (pink).</span>
			</div>
			<div className="panel">
				<div className='micro'>Primary tone</div>
				<z-tabs value='overview' tone='primary' tabs={TRIO}>
					<div slot='overview'>
						<z-text size='sm' color='muted'>Overview — active tab underlined in the purple accent.</z-text>
					</div>
					<div slot='activity'>
						<z-text size='sm' color='muted'>Activity — recent events would stream in here.</z-text>
					</div>
					<div slot='settings'>
						<z-text size='sm' color='muted'>Settings — configuration lives behind this tab.</z-text>
					</div>
				</z-tabs>
				<div className='micro' style={{ marginTop: '2rem' }}>Secondary tone</div>
				<z-tabs value='overview' tone='secondary' tabs={TRIO}>
					<div slot='overview'>
						<z-text size='sm' color='muted'>Overview — active tab underlined in the pink accent.</z-text>
					</div>
					<div slot='activity'>
						<z-text size='sm' color='muted'>Activity — recent events would stream in here.</z-text>
					</div>
					<div slot='settings'>
						<z-text size='sm' color='muted'>Settings — configuration lives behind this tab.</z-text>
					</div>
				</z-tabs>
			</div>
		</div>

		<div className="block">
			<div className="block-title">
				<h3>is-fitted</h3>
				<span className="desc">Spreads the tabs across the full width — each takes an equal fraction.</span>
			</div>
			<div className="panel">
				<div className='micro'>Fitted</div>
				<z-tabs value='overview' isFitted tabs={TRIO}>
					<div slot='overview'>
						<z-text size='sm' color='muted'>Overview — tabs stretch to fill the row, splitting the width evenly.</z-text>
					</div>
					<div slot='activity'>
						<z-text size='sm' color='muted'>Activity — recent events would stream in here.</z-text>
					</div>
					<div slot='settings'>
						<z-text size='sm' color='muted'>Settings — configuration lives behind this tab.</z-text>
					</div>
				</z-tabs>
			</div>
		</div>

		<div className="block">
			<div className="block-title">
				<h3>Usage</h3>
				<span className="desc">Assign the tabs array in JS, provide a named slot per tab, and listen for change.</span>
			</div>
			<div className="panel">
				<div className='micro'>Markup — panels as named slots</div>
				<z-code-block filename='tabs.html' language='html' code={MARKUP} />
				<div className='micro' style={{ marginTop: '2rem' }}>Script — tabs property &amp; change event</div>
				<z-code-block filename='tabs.ts' language='ts' code={USAGE} />
			</div>
		</div>

		<div className="block">
			<div className="block-title">
				<h3>Props &amp; keyboard</h3>
			</div>
			<div className="panel">
				<z-text size='sm' color='muted' style={{ display: 'block' }}>
					<b>tabs</b> — array of <code>{'{ value, label, isDisabled? }'}</code>. Set as a property, not an attribute.<br />
					<b>value</b> — the active tab's <code>value</code>; reflected to an attribute. Defaults to the first tab.<br />
					<b>tone</b> — <code>primary</code> (purple) or <code>secondary</code> (pink); omit for the neutral accent.<br />
					<b>is-fitted</b> — tabs span the full width in equal fractions.<br />
					<b>is-hidden</b> — hides the whole component (<code>display: none</code>).<br />
					<b>change</b> — bubbling event fired on selection with <code>{'{ value }'}</code> in <code>detail</code>.
				</z-text>
				<z-text size='sm' color='muted' style={{ display: 'block', marginTop: '1.25rem' }}>
					<b>Keyboard</b> — <code>←</code>/<code>→</code> move between tabs (skipping disabled), <code>Home</code>/<code>End</code> jump to the first/last tab.
				</z-text>
			</div>
		</div>
	</ComponentDoc>
)
