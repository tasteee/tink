const style = document.querySelector('#style')
const log = document.querySelector('#log')

style.options = [
  { value: 'calm', label: 'Calm' },
  { value: 'electric', label: 'Electric' },
  { value: 'minimal', label: 'Minimal', isDisabled: true }
]

style.addEventListener('change', (event) => (log.textContent = `change → ${event.detail.value}`))
