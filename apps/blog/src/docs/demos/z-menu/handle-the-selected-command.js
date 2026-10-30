const menu = document.querySelector('#menu')
const log = document.querySelector('#log')

// the picked row flashes twice, then select fires as the menu closes
menu.addEventListener('select', (event) => {
  log.textContent = `select → ${event.detail.value}`
})
