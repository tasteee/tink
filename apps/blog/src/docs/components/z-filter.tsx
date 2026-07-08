import { ComponentDoc } from '@app/docs/ComponentDoc'

const FLAT_OPTIONS = [
	{ value: 'all', label: 'All' },
	{ value: 'sci-fi', label: 'Sci-Fi' },
	{ value: 'drama', label: 'Drama' },
	{ value: 'action', label: 'Action' },
	{ value: 'comedy', label: 'Comedy' }
]

const TREE_OPTIONS = [
	{
		value: 'frontend',
		label: 'Frontend',
		children: [
			{ value: 'react', label: 'React' },
			{ value: 'vue', label: 'Vue' },
			{ value: 'svelte', label: 'Svelte' }
		]
	},
	{
		value: 'backend',
		label: 'Backend',
		children: [
			{ value: 'node', label: 'Node' },
			{ value: 'go', label: 'Go' },
			{ value: 'rust', label: 'Rust' }
		]
	},
	{
		value: 'design',
		label: 'Design',
		children: [
			{ value: 'figma', label: 'Figma' },
			{ value: 'sketch', label: 'Sketch', isDisabled: true }
		]
	}
]

export const ZFilterDoc = () => (
	<ComponentDoc
		tag="z-filter"
		category="Forms"
		description="A pill-based faceting control (the daisyUI filter UX). Picking a pill collapses the rest and reveals a reset ✕. With is-drilldown, options can nest: drilling a branch collapses its siblings into a breadcrumb and reveals its children as muted candidates."
	>
		<div className="block">
			<div className="block-title">
				<h3>Flat</h3>
				<span className="desc">single-select — pick collapses the rest, ✕ clears</span>
			</div>
			<div className="panel">
				<z-filter options={FLAT_OPTIONS} />
			</div>
		</div>

		<div className="block">
			<div className="block-title">
				<h3>Drill-down</h3>
				<span className="desc">
					is-drilldown — pick a branch to reveal its children; siblings at the current level stay put
				</span>
			</div>
			<div className="panel">
				<z-filter is-drilldown tone="primary" options={TREE_OPTIONS} />
			</div>
		</div>

		<div className="block">
			<div className="block-title">
				<h3>Tone &amp; size</h3>
			</div>
			<div className="panel">
				<div className="col" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
					<z-filter size="small" tone="secondary" options={FLAT_OPTIONS} />
					<z-filter tone="primary" options={FLAT_OPTIONS} />
				</div>
			</div>
		</div>
	</ComponentDoc>
)
