import { Link } from 'wouter'
import { Article } from '@app/docs/Prose'
import { SECTIONS } from '@app/docs/nav'

export const Introduction = () => (
	<Article
		eyebrow="Setup"
		title="Zest"
		lede="A design system shipped as framework-agnostic web components. One script and one stylesheet, and every z element works in plain HTML, React, Svelte, or anything else that renders the DOM."
	>
		<h2>How the docs are organized</h2>
		<div className="DocsIndexGrid">
			{SECTIONS.map((section) => (
				<Link key={section.id} href={`/${section.id}`} className="DocsBlockCard">
					<span className="DocsBlockTitle">{section.label}</span>
					<span className="DocsBlockSummary">{section.blurb}</span>
					<span className="DocsBlockMore">Open {section.label} →</span>
				</Link>
			))}
		</div>

		<h2>What you get</h2>
		<ul>
			<li>
				<strong>Elements</strong> are real custom elements (<code>&lt;z-button&gt;</code>, <code>&lt;z-dialog&gt;</code>…).
				They carry their own styles in a shadow root and read every color, space, radius, and duration from shared design
				tokens.
			</li>
			<li>
				<strong>Tokens</strong> live in one stylesheet, <code>ink.css</code>. Override any of them on <code>:root</code> (or
				any container) to retheme everything underneath.
			</li>
			<li>
				<strong>Zero runtime dependencies.</strong> The published bundle includes everything it needs.
			</li>
		</ul>

		<h2>Principles in one breath</h2>
		<p>
			Beautiful defaults, simple common cases, composition over special-purpose props. Data goes in properties, content goes
			in slots (or declarative child elements), and styling goes through tokens. Motion follows one shared scale, and every
			exit is as considered as its entrance.
		</p>
	</Article>
)
