import './zest' // registers <z-*> elements + loads tokens/component CSS
import './site/site.css' // shared nav + home/docs page chrome
import './styles.css' // base tokens + body styles
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@app/App'

const rootElement = document.getElementById('root')
if (rootElement === null) throw new Error('Missing #root element')

createRoot(rootElement).render(
	<StrictMode>
		<App />
	</StrictMode>
)
