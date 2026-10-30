const nav = document.querySelector('#nav')
const log = document.querySelector('#log')

nav.items = [
  { value: 'library', label: 'Library' },
  { value: 'create', label: 'Create' },
  { value: 'explore', label: 'Explore' }
]

// the router owns navigation; keep value in sync with the route
nav.addEventListener('select', (event) => {
  const value = event.detail.value
  nav.value = value
  log.textContent = `route: /${value}`
})
