const dialog = document.querySelector('#confirm')
const log = document.querySelector('#log')

// act only on confirm; cancel (button, Esc) changes nothing
dialog.addEventListener('confirm', () => (log.textContent = 'confirm → project deleted'))
dialog.addEventListener('cancel', () => (log.textContent = 'cancel → nothing changed'))
