import './zest' // registers <z-*> elements + loads tokens/component CSS
import './site/site.css' // shared nav + home/docs page chrome
import './styles.css' // blog page chrome
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexAuthProvider } from '@convex-dev/auth/react'
import { convex } from '@app/convexClient'
import { App } from '@app/App'

const rootElement = document.getElementById('root')
if (rootElement === null) throw new Error('Missing #root element')

createRoot(rootElement).render(
	<StrictMode>
		<ConvexAuthProvider client={convex}>
			<App />
		</ConvexAuthProvider>
	</StrictMode>
)
