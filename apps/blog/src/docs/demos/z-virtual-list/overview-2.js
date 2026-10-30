const DYNAMIC_ITEMS = Array.from({ length: 300 }, (_, i) => ({
  id: i,
  text:
    i % 5 === 0
      ? 'A longer row that wraps across a couple of lines, to demonstrate variable heights in the dynamic sizing mode.'
      : `Message ${i + 1}`
}))
const renderDynamicRow = (item) => {
  const el = document.createElement('div')
  el.textContent = item.text
  el.style.cssText =
    'padding:0.5rem 0.75rem;font-family:var(--font-mono);font-size:0.8125rem;line-height:1.5;border-bottom:1px solid var(--border);'
  return el
}

const virtualList = document.querySelector('#virtual-list')
virtualList.items = DYNAMIC_ITEMS
virtualList.renderItem = renderDynamicRow
