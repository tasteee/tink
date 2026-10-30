const command = document.querySelector('#command')
const log = document.querySelector('#log')

command.addEventListener('select', (event) => {
  const { value } = event.detail
  log.textContent = value === 'new' ? 'select → open the new-project dialog' : `select → navigate to /${value}`
})
