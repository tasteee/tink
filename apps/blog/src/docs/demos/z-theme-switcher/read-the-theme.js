import { getTheme } from '@tasteee/zest'

const switcher = document.querySelector('#switcher')
const status = document.querySelector('#status')

const showTheme = () => (status.textContent = `Painting ${getTheme()}`)

switcher.addEventListener('change', showTheme)
showTheme()
