const editor = document.querySelector('#editor')
const log = document.querySelector('#log')

// is-open is two-way: set it to open or close, read it any time
document.querySelector('#open').addEventListener('click', () => (editor.isOpen = true))
document.querySelector('#cancel').addEventListener('click', () => (editor.isOpen = false))
document.querySelector('#save').addEventListener('click', () => (editor.isOpen = false))

editor.addEventListener('open', () => (log.textContent = 'open → is-open: true'))
editor.addEventListener('close', () => (log.textContent = 'close → is-open: false'))
