const menu = document.querySelector('#menu')
const log = document.querySelector('#log')

// select fires after the picked row's confirmation flash
menu.addEventListener('select', (event) => {
  log.textContent = `select → ${event.detail.value}`
})
