import { Article, Code } from '@app/docs/Prose'

export const TypeScriptSetup = () => (
	<Article
		eyebrow="Configuration"
		title="TypeScript"
		lede="The package ships its own types. For JSX, declare the z elements once so props type-check."
	>
		<Code
			language="ts"
			filename="zest-elements.d.ts"
			code={`
import 'react'

type ZProps = React.HTMLAttributes<HTMLElement> & Record<string, unknown>

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'z-button': ZProps & { kind?: 'solid' | 'soft' | 'outline' | 'ghost' | 'plain'; isLoading?: boolean }
      'z-menu': ZProps
      'z-menu-item': ZProps & { value?: string; shortcut?: string; isDanger?: boolean }
      // …one line per element you use
    }
  }
}
`}
		/>
		<p>
			The <code>toaster</code> API and option types (<code>ToastOptionsT</code>, <code>HideToastT</code>) are exported from
			the package root.
		</p>
	</Article>
)
