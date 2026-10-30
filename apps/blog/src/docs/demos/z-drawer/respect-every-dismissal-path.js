const drawer = document.querySelector('#drawer')
const log = document.querySelector('#log')
let closes = 0

document.querySelector('#open').addEventListener('click', () => (drawer.isOpen = true))

// every dismissal path (drag, Esc, backdrop) ends in the same close event
drawer.addEventListener('close', () => (log.textContent = `close events: ${++closes}`))
