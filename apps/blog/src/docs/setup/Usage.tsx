import { Link } from 'wouter'
import { Article, Code } from '@app/docs/Prose'

export const UsageHtml = () => (
	<Article
		eyebrow="Usage"
		title="Plain HTML"
		lede="Zest elements are ordinary HTML elements. Attributes configure them, properties take rich data, and events report back."
	>
		<h2>Attributes</h2>
		<p>
			Every option is an attribute in kebab-case. Boolean options are present or absent: <code>is-disabled</code>,{' '}
			<code>is-open</code>.
		</p>
		<Code code={`<z-button kind="outline" tone="primary" is-loading>Saving</z-button>`} />

		<h2>Content: slots and child elements</h2>
		<p>
			Content goes inside the element. Named slots place it (<code>slot="trigger"</code>, <code>slot="footer"</code>); list
			elements take declarative children, so a menu needs no JavaScript at all.
		</p>
		<Code
			code={`
<z-menu>
  <z-button slot="trigger" kind="outline">Actions</z-button>
  <z-menu-item value="rename" shortcut="⌘R">Rename</z-menu-item>
  <z-menu-separator></z-menu-separator>
  <z-menu-item value="delete" is-danger>Delete</z-menu-item>
</z-menu>
`}
		/>

		<h2>Properties</h2>
		<p>Data that isn’t text (arrays, objects) is set as a JavaScript property.</p>
		<Code
			language="js"
			code={`
const sidebar = document.querySelector('z-sidebar')
sidebar.items = [{ value: 'inbox', label: 'Inbox' }, { value: 'drafts', label: 'Drafts' }]
`}
		/>

		<h2>Events</h2>
		<p>
			Elements dispatch DOM events with a <code>detail</code> payload. They bubble and cross shadow boundaries.
		</p>
		<Code
			language="js"
			code={`
document.querySelector('z-menu').addEventListener('select', (event) => {
  console.log(event.detail.value)
})
`}
		/>
	</Article>
)

export const UsageReact = () => (
	<Article
		eyebrow="Usage"
		title="React"
		lede="React 19 supports custom elements natively: camelCase props become properties, so arrays and objects pass straight through."
	>
		<h2>Props</h2>
		<p>
			Write options in camelCase. React sets them as element properties, which is how array-valued options like{' '}
			<code>items</code> arrive intact.
		</p>
		<Code
			language="tsx"
			code={`
<z-sidebar value={route} items={[{ value: 'inbox', label: 'Inbox' }]} />
<z-button kind="outline" isLoading={saving}>Save</z-button>
`}
		/>

		<h2>Events</h2>
		<p>Listen with a ref, which works for every event name in every React version.</p>
		<Code
			language="tsx"
			code={`
const ref = useRef<HTMLElement>(null)

useEffect(() => {
  const menu = ref.current
  const onSelect = (event: Event) => run((event as CustomEvent).detail.value)
  menu?.addEventListener('select', onSelect)
  return () => menu?.removeEventListener('select', onSelect)
}, [])

return <z-menu ref={ref}>…</z-menu>
`}
		/>

		<h2>Types</h2>
		<p>
			See <Link href="/setup/typescript">TypeScript</Link> for declaring the z elements as JSX intrinsic elements.
		</p>
	</Article>
)

export const UsageSvelte = () => (
	<Article
		eyebrow="Usage"
		title="Svelte"
		lede="Svelte passes props to custom elements as properties when one exists, so data and events work without wrappers."
	>
		<Code
			language="html"
			filename="Inbox.svelte"
			code={`
<script>
  import '@tasteee/zest'
  let value = 'inbox'
  const items = [{ value: 'inbox', label: 'Inbox' }, { value: 'drafts', label: 'Drafts' }]
</script>

<z-sidebar {items} {value} on:select={(event) => (value = event.detail.value)} />
`}
		/>
	</Article>
)
