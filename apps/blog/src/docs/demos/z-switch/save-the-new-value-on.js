const compact = document.querySelector('#compact')
const log = document.querySelector('#log')

// switches apply immediately, so save on every change
compact.addEventListener('change', (event) => (log.textContent = `checked: ${event.detail.checked} · saved`))
