const FIXED_ITEMS = Array.from({ length: 1000 }, (_, i) => ({ id: i, label: `Row ${i + 1}` }))
const renderFixedRow = (item) => {
  const el = document.createElement('div')
  el.textContent = item.label
  el.style.cssText =
    'display:flex;align-items:center;height:100%;padding:0 0.75rem;font-family:var(--font-mono);font-size:0.8125rem;border-bottom:1px solid var(--border);'
  return el
}

const virtualList = document.querySelector('#virtual-list')
virtualList.items = FIXED_ITEMS
virtualList.renderItem = renderFixedRow
