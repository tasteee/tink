const seats = document.querySelector('#seats')
const log = document.querySelector('#log')

// input reports every keystroke with its validity; change reports the committed, corrected value
seats.addEventListener('input', (event) => {
  const { rawValue, isValid } = event.detail
  log.textContent = `input: ${rawValue} (${isValid ? 'valid' : 'out of range'})`
})
seats.addEventListener('change', (event) => {
  log.textContent = `change → committed ${event.detail.value}`
})
