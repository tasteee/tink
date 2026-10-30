const tabs = document.querySelector('#tabs')
const log = document.querySelector('#log')

// e.g. keep the selected panel in the URL
tabs.addEventListener('change', (event) => {
  log.textContent = `?panel=${event.detail.value}`
})
