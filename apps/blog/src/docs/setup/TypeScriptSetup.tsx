import { Article, Code } from '@app/docs/Prose'

export const TypeScriptSetup = () => (
	<Article
		eyebrow="Configuration"
		title="TypeScript"
		lede="The package ships its own types, including JSX typings for React. One line turns them on."
	>
		<h2>React</h2>
		<p>
			Reference the typings once, in any <code>.d.ts</code> file your project includes. Every <code>z-*</code> element then
			type-checks with its real props, and a wrong value is a compile error.
		</p>
		<Code
			language="ts"
			filename="src/zest.d.ts"
			code={`/// <reference types="@tasteee/zest/react" />`}
		/>
		<p>Or list it in <code>tsconfig.json</code> instead:</p>
		<Code
			language="json"
			filename="tsconfig.json"
			code={`{
  "compilerOptions": {
    "types": ["@tasteee/zest/react"]
  }
}`}
		/>
		<Code
			language="tsx"
			filename="App.tsx"
			code={`import '@tasteee/zest'
import '@tasteee/zest/ink.css'

export const App = () => (
  <>
    <z-button kind="solid" tone="primary">Save</z-button>
    <z-switch label="Dark mode" onchange={(event) => console.log(event.detail.checked)} />
    <z-button kind="huge">Error: "huge" is not a kind</z-button>
  </>
)`}
		/>
		<p>
			Props are the element's camelCase properties (<code>isOpen</code>, not <code>is-open</code>). Events are lowercase
			handlers named after the event: <code>onchange</code>, <code>onselect</code>, and the event's{' '}
			<code>detail</code> is typed. The typings are generated from the package's own manifest, so they never name a prop the
			element does not have.
		</p>

		<h2>Vue and Svelte</h2>
		<p>
			Both work with no typings. In Vue, tell the compiler the <code>z-</code> tags are custom elements with{' '}
			<code>isCustomElement</code>, and listen with <code>@change</code>. In Svelte, listen with <code>onchange</code>.
		</p>

		<h2>The rest of the API</h2>
		<p>
			The <code>toaster</code> API and option types (<code>ToastOptionsT</code>, <code>HideToastT</code>) are exported from
			the package root.
		</p>
	</Article>
)
