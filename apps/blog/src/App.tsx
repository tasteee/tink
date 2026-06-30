import { Link, Route, Switch } from 'wouter'
import { SiteShell } from '@app/site/SiteShell'
import { Home } from '@app/site/Home'
import { Docs } from '@app/docs/Docs'
import { Home as BlogHome } from '@app/pages/Home'
import { Post } from '@app/pages/Post'
import { New } from '@app/pages/New'
import { Admin } from '@app/pages/Admin'
import { EditorPage } from '@app/editor/EditorPage'
import { Tools } from '@app/tools/Tools'
import { FrameExtractor } from '@app/tools/FrameExtractor'

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
		<Route component={NotFound} />
	</Switch>
)

// The blog's own routes. Mounted under <Route path="/blog" nest>, so these paths
// are relative to /blog — i.e. "/" is /blog, "/post/:slug" is /blog/post/:slug.
// That means the blog pages' existing Links/navigate calls work unchanged.
const Blog = () => (
	<Switch>
		<Route path="/" component={BlogHome} />
		<Route path="/post/:slug" component={Post} />
		<Route path="/admin" component={Admin} />
		<Route path="/new" component={New} />
		<Route path="/edit/:id" component={EditorPage} />
		<Route component={NotFound} />
	</Switch>
)

export const App = () => (
	<SiteShell>
		<Switch>
			<Route path="/" component={Home} />
			<Route path="/blog" nest>
				<Blog />
			</Route>
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
