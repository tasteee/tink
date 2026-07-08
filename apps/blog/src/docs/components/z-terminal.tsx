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

// Tier 2: per-line timing. Slow steps hold longer before the next line starts.
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
		description="A clean terminal surface for command walkthroughs: mock shell + cwd, window dots, and per-line copy on hover. Add `animate` to type commands out live and fade output in; `lines` gives per-line timing control."
	>
		<z-stack gap="2xl" fullWidth>
			<z-stack gap="md" fullWidth>
				<z-eyebrow tone="neutral">Install: prompt lines copyable</z-eyebrow>
				<z-card>
					<z-terminal shell="zsh" cwd="~/projects/app" code={INSTALL} />
				</z-card>
			</z-stack>

			<z-stack gap="md" fullWidth>
				<z-eyebrow tone="neutral">Usage: secondary tone</z-eyebrow>
				<z-card>
					<z-terminal shell="bash" cwd="~/dev" tone="secondary" code={USAGE} />
				</z-card>
			</z-stack>

			<z-stack gap="md" fullWidth>
				<z-eyebrow tone="neutral">Animated: types on view, loops</z-eyebrow>
				<z-card>
					<z-terminal shell="zsh" cwd="~/projects/app" code={DEPLOY} animate start-on-view loop />
				</z-card>
			</z-stack>

			<z-stack gap="md" fullWidth>
				<z-eyebrow tone="neutral">Per-line timing: replay in corner</z-eyebrow>
				<z-card>
					<z-terminal shell="bash" cwd="~/dev" tone="secondary" animate lines={BOOT} />
				</z-card>
			</z-stack>
		</z-stack>
	</ComponentDoc>
)
