import { Link, Route, Switch } from 'wouter'
import { SiteShell } from '@app/site/SiteShell'
import { Home } from '@app/site/Home'
import { Docs } from '@app/docs/Docs'
import { Tools } from '@app/tools/Tools'
import { FrameExtractor } from '@app/tools/FrameExtractor'
import { CanvasLab } from '@app/tools/CanvasLab'

const NotFound = () => (
	<div className="SitePage">
		<section className="hero">
			<z-box isColumn gap="3" xStart>
				<z-heading size="lg">Not found</z-heading>
				<z-text color="muted">That page doesn’t exist.</z-text>
				<Link href="/" className="FooterLink">
					← Back home
				</Link>
			</z-box>
		</section>
	</div>
)

// The tools section. Mounted under <Route path="/tools" nest>, so paths here are
// relative to /tools — "/" is the tools index, "/frame-extractor" is the tool.
const ToolsSection = () => (
	<Switch>
		<Route path="/" component={Tools} />
		<Route path="/frame-extractor" component={FrameExtractor} />
		<Route path="/canvas-lab" component={CanvasLab} />
		<Route component={NotFound} />
	</Switch>
)

export const App = () => (
	<SiteShell>
		<Switch>
			<Route path="/" component={Home} />
			<Route path="/docs" nest>
				<Docs />
			</Route>
			<Route path="/tools" nest>
				<ToolsSection />
			</Route>
			<Route component={NotFound} />
		</Switch>
	</SiteShell>
)
