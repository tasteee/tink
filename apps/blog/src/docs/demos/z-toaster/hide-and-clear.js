import { toaster } from '@tasteee/zest'

let hide = () => {}

// show() returns a function that hides exactly that toast
document.querySelector('#persist').addEventListener('click', () => {
  hide = toaster.show({ title: 'Syncing your library…', duration: Infinity })
})
document.querySelector('#hide').addEventListener('click', () => hide())

document.querySelector('#many').addEventListener('click', () => {
  toaster.show({ title: 'Imported 12 photos', tone: 'success' })
  toaster.show({ title: '3 duplicates skipped', tone: 'warning' })
  toaster.show({ title: 'Album “Lisbon” created', tone: 'info' })
})

// clear() hides everything; hide(id) hides one toast by id
document.querySelector('#clear').addEventListener('click', () => toaster.clear())
