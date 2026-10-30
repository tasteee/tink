const notice = document.querySelector('#notice')
const log = document.querySelector('#log')

notice.addEventListener('dismiss', () => {
  log.textContent = 'dismiss → preference saved'
})

document.querySelector('#restore').addEventListener('click', () => {
  notice.isHidden = false
  log.textContent = 'dismiss not fired yet'
})
