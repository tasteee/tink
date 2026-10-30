const details = document.querySelector('#details')
const log = document.querySelector('#log')
let opens = 0

// toggle reports the resulting state, e.g. for analytics or syncing nearby UI
details.addEventListener('toggle', (event) => {
  if (event.detail.open) opens++
  log.textContent = `${event.detail.open ? 'open' : 'closed'} · opened ${opens} time${opens === 1 ? '' : 's'}`
})
