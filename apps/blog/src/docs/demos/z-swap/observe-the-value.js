const theme = document.querySelector('#theme')
const log = document.querySelector('#log')

theme.addEventListener('change', (event) => (log.textContent = `active: ${event.detail.active}`))
