const otp = document.querySelector('#otp')
const log = document.querySelector('#log')

otp.addEventListener('complete', (event) => {
  log.textContent = `complete → verifying ${event.detail.value}…`
})
