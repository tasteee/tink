const breadcrumbs = document.querySelector('#breadcrumbs')
const log = document.querySelector('#log')

breadcrumbs.items = [{ label: 'Library' }, { label: 'Albums' }, { label: 'Lisbon', isCurrent: true }]

breadcrumbs.addEventListener('navigate', (event) => {
  const { index } = event.detail
  log.textContent = `navigate → index ${index} (${breadcrumbs.items[index].label})`
})
