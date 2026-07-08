import { ComponentDoc } from '@app/docs/ComponentDoc'

const FIXED_ITEMS = Array.from({ length: 1000 }, (_, i) => ({ id: i, label: `Row ${i + 1}` }))

const renderFixedRow = (item: unknown) => {
	const el = document.createElement('div')
	el.textContent = (item as { label: string }).label
	el.style.cssText =
		'display:flex;align-items:center;height:100%;padding:0 0.75rem;font-family:var(--font-mono);font-size:0.8125rem;border-bottom:1px solid var(--border);'
	return el
}

const DYNAMIC_ITEMS = Array.from({ length: 300 }, (_, i) => ({
	id: i,
	text:
		i % 5 === 0
			? 'A longer row that wraps across a couple of lines, to demonstrate variable heights in the dynamic sizing mode.'
			: `Message ${i + 1}`
}))

const renderDynamicRow = (item: unknown) => {
	const el = document.createElement('div')
	el.textContent = (item as { text: string }).text
	el.style.cssText =
		'padding:0.5rem 0.75rem;font-family:var(--font-mono);font-size:0.8125rem;line-height:1.5;border-bottom:1px solid var(--border);'
	return el
}

export const ZVirtualListDoc = () => (
	<ComponentDoc
		tag="z-virtual-list"
		category="Data Display"
		description="Windowed rendering — only the rows in view (plus overscan) are ever in the DOM, so a list of thousands scrolls cheaply. Headless: set items + a renderItem function that returns a Node or an HTML string."
	>
		<div className="block">
			<h3>Fixed item-height (fast path)</h3>
			<div className="panel" style={{ padding: 0 }}>
				<z-virtual-list
					items={FIXED_ITEMS}
					itemHeight={32}
					renderItem={renderFixedRow}
					style={{ height: '220px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}
				/>
			</div>
		</div>

		<div className="block">
			<h3>Dynamic estimate-size</h3>
			<div className="panel" style={{ padding: 0 }}>
				<z-virtual-list
					items={DYNAMIC_ITEMS}
					estimateSize={40}
					renderItem={renderDynamicRow}
					style={{ height: '220px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}
				/>
			</div>
		</div>
	</ComponentDoc>
)
