import { ComponentDoc } from '@app/docs/ComponentDoc'

const INSTALL = `$ npm install @tasteee/zest
added 42 packages in 3.1s
$ npm run build
Build complete in 1.2s`

const USAGE = `$ zesty init my-app
$ cd my-app
$ zesty dev --port 3000
  ➜  Local:   http://localhost:3000`

const DEPLOY = `$ zesty build
$ zesty deploy`

// Tier 2 — per-line timing. Slow steps hold longer before the next line starts.
const BOOT = [
	{ text: '$ pnpm dev', typeSpeed: 55 },
	{ text: 'zesty v0.1.0', delay: 500 },
	{ text: 'starting dev server…', delay: 250 },
	{ text: 'compiling modules', delay: 900 },
	{ text: '✓ ready in 842ms', delay: 700 },
	{ text: '➜  Local:   http://localhost:3000', delay: 300 }
]

export const ZTerminalDoc = () => (
	<ComponentDoc
		tag="z-terminal"
		category="Specialized"
		description="A clean terminal surface for command walkthroughs — mock shell + cwd, window dots, and per-line copy on hover. Add `animate` to type commands out live and fade output in; `lines` gives per-line timing control."
	>
		<div className="block">
			<div className="panel-grid">
				<div className="panel">
					<div className="micro">Install — prompt lines copyable</div>
					<z-terminal shell="zsh" cwd="~/projects/app" code={INSTALL} />
				</div>
				<div className="panel">
					<div className="micro">Usage — secondary tone</div>
					<z-terminal shell="bash" cwd="~/dev" tone="secondary" code={USAGE} />
				</div>
			</div>
		</div>

		<div className="block">
			<div className="panel-grid">
				<div className="panel">
					<div className="micro">Animated — types on view, loops</div>
					<z-terminal
						shell="zsh"
						cwd="~/projects/app"
						code={DEPLOY}
						animate
						start-on-view
						loop
					/>
				</div>
				<div className="panel">
					<div className="micro">Per-line timing — replay in corner</div>
					<z-terminal shell="bash" cwd="~/dev" tone="secondary" animate lines={BOOT} />
				</div>
			</div>
		</div>
	</ComponentDoc>
)
