const format = document.querySelector('#format')
const log = document.querySelector('#log')

// a string for type="single", a string[] for type="multiple"
format.addEventListener('change', (event) => (log.textContent = `change → ${JSON.stringify(event.detail.value)}`))
