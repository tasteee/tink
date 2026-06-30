import './zest'
import './global.css'
import { render } from 'solid-js/web'
import { App } from './App'

const rootElement = document.getElementById('root')
if (rootElement === null) throw new Error('Missing #root element')
render(() => <App />, rootElement)
