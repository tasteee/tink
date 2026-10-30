import { Article, Code } from '@app/docs/Prose'

export const Installation = () => (
	<Article eyebrow="Setup" title="Installation" lede="Install the package, import it once, and every z element is defined.">
		<h2>Install</h2>
		<Code language="bash" code={`pnpm add @tasteee/zest`} />
		<p>npm and yarn work the same way.</p>

		<h2>Import once</h2>
		<p>
			Import the library (registers every element) and its token stylesheet at your app’s entry point. The stylesheet must
			load at the document level: tokens are CSS custom properties, which pierce every element’s shadow root from there.
		</p>
		<Code
			language="js"
			filename="main.js"
			code={`
import '@tasteee/zest'
import '@tasteee/zest/ink.css'
`}
		/>

		<h2>Without a bundler</h2>
		<p>Load the same two files from a CDN.</p>
		<Code
			language="html"
			code={`
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tasteee/zest/dist/ink.css" />
<script type="module" src="https://cdn.jsdelivr.net/npm/@tasteee/zest/dist/zest.js"></script>
`}
		/>

		<h2>Check it works</h2>
		<Code language="html" code={`<z-button tone="primary">It works</z-button>`} />
	</Article>
)
