import { toaster } from '@tasteee/zest'

// a string is enough. It's also the toast's id, so mashing the button
// refreshes one toast instead of stacking copies
document.querySelector('#saved').addEventListener('click', () => {
  toaster.show('Changes saved')
})

document.querySelector('#success').addEventListener('click', () => {
  toaster.show({ title: 'Deployed', description: 'zest-docs is live on production.', tone: 'success' })
})

document.querySelector('#info').addEventListener('click', () => {
  toaster.show({ title: 'New comment', description: 'Ada left feedback on “Motion”.', tone: 'info' })
})

document.querySelector('#warning').addEventListener('click', () => {
  toaster.show({ title: 'Storage almost full', description: '92% of 10 GB used.', tone: 'warning' })
})

document.querySelector('#danger').addEventListener('click', () => {
  toaster.show({ title: 'Payment failed', description: 'Update the card on file.', tone: 'danger', duration: 6000 })
})
