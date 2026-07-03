import { ComponentDoc } from '@app/docs/ComponentDoc'
import { withProps } from '@app/docs/withProps'

const INSTALL = `$ npm install @tasteee/zest
added 42 packages in 3.1s
$ npm run build
Build complete in 1.2s`

const USAGE = `$ zesty init my-app
$ cd my-app
$ zesty dev --port 3000
  ➜  Local:   http://localhost:3000`

export const ZTerminalDoc = () => (
	<ComponentDoc
		tag="z-terminal"
		category="Specialized"
		description="A clean terminal surface for command walkthroughs — mock shell + cwd, window dots, and per-line copy on hover. Lines starting with the prompt are copyable by default."
	>
		<div className="block">
			<div className="panel-grid">
				<div className="panel">
					<div className="micro">Install — prompt lines copyable</div>
					<z-terminal shell="zsh" cwd="~/projects/app" ref={withProps({ code: INSTALL })} />
				</div>
				<div className="panel">
					<div className="micro">Usage — secondary tone</div>
					<z-terminal shell="bash" cwd="~/dev" tone="secondary" ref={withProps({ code: USAGE })} />
				</div>
			</div>
		</div>
	</ComponentDoc>
)
