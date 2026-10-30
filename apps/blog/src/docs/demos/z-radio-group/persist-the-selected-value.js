const plan = document.querySelector('#plan')
const log = document.querySelector('#log')

plan.addEventListener('change', (event) => (log.textContent = `change → ${event.detail.value}`))
