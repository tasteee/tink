import { toaster } from '@tasteee/zest'

const actions = document.querySelector('#actions')
const confirm = document.querySelector('#confirm')

// the menu confirms the pick (a quick double flash) before `select` fires,
// so the dialog opens after the menu has visibly acknowledged the choice
actions.addEventListener('select', (event) => {
  if (event.detail.value === 'delete') confirm.isOpen = true
  else toaster.show(`${event.detail.value} clicked`)
})

confirm.addEventListener('confirm', () => {
  toaster.show({ title: 'Project deleted', tone: 'danger' })
})
