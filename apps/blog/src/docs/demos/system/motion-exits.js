import { toaster } from '@tasteee/zest'

document.querySelector('#toast').addEventListener('click', () => {
  toaster.show({ title: 'Toasts fold away', description: 'The stack glides closed behind them.', tone: 'info' })
})
