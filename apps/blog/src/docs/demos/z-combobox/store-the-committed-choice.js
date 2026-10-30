const framework = document.querySelector('#framework')
const log = document.querySelector('#log')

framework.options = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' }
]

framework.addEventListener('change', (event) => {
  log.textContent = `change → ${event.detail.value}`
})
