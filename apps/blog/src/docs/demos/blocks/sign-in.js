import { toaster } from '@tasteee/zest'

const form = document.querySelector('#sign-in')
const submit = document.querySelector('#submit')

form.addEventListener('submit', (event) => {
  event.preventDefault()
  submit.isLoading = true

  // stand-in for a real request
  setTimeout(() => {
    submit.isLoading = false
    toaster.show({ id: 'sign-in', title: 'Signed in', description: 'Welcome back, Ada.', tone: 'success' })
  }, 900)
})
