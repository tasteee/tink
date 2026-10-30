const details = document.querySelector('#details')
const log = document.querySelector('#log')

details.addEventListener('toggle', (event) => {
  const { value, open } = event.detail
  log.textContent = `toggle → { value: '${value}', open: ${open} }`
})
