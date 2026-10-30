import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'
import { DocsLink } from '@app/docs/DocsLink'
import { RefTable } from '@app/docs/Prose'

export const ZBoxDoc = () => (
	<ComponentDoc
		tag="z-box"
		description="The general-purpose layout primitive: flexbox or grid through boolean attributes, no CSS required."
	>
		<DocExample
			demo="z-box/one-relationship"
			title="Start with one relationship"
			description="z-box is the flexible escape hatch. Declare only the display, axis, and spacing this group needs."
		/>
		<DocExample demo="z-box/column" title="Stack a column" description="is-flex is-column with a gap step." />
		<DocExample demo="z-box/row-wrap" title="Wrap a row" description="does-wrap lets a row of peers flow onto new lines." />
		<DocExample
			demo="z-box/responsive-grid"
			title="Let a responsive grid carry the page"
			description="Responsive column attributes handle repeated content without media queries."
		/>

		<h2>Display attributes</h2>
		<RefTable
			head={['Attribute', 'Effect']}
			rows={[
				['is-row · is-column', 'flex-direction'],
				['is-flex · is-inline-flex', 'display: flex / inline-flex'],
				['is-grid · is-inline-grid', 'display: grid / inline-grid'],
				['is-block · is-inline-block · is-inline', 'block display modes'],
				['does-wrap', 'flex-wrap: wrap'],
				['does-wrap-text', 'allow text inside to wrap']
			]}
		/>

		<h2>Alignment attributes</h2>
		<RefTable
			head={['Attribute', 'Axis', 'Effect']}
			rows={[
				[
					'x-start · x-center · x-end · x-between · x-around · x-evenly · x-stretch',
					'main',
					'justify-content (flex) / justify-items (grid)'
				],
				[
					'y-start · y-center · y-end · y-between · y-around · y-evenly · y-stretch',
					'cross',
					'align-items (flex) / align-content (grid)'
				]
			]}
		/>

		<h2>Value attributes</h2>
		<p>
			Spacing values take a scale step <code>0</code>–<code>8</code> (mapped onto the <code>--space-*</code> tokens) or any
			CSS length. Sizing treats a bare number as px; grid <code>columns</code>/<code>rows</code> treat a bare number{' '}
			<code>n</code> as <code>repeat(n, minmax(0, 1fr))</code>.
		</p>
		<RefTable
			head={['Attribute', 'Value', 'Description']}
			rows={[
				['gap · row-gap · column-gap', 'scale step or CSS length', 'spacing between children'],
				['margin · margin-x · margin-y · margin-top · …', 'scale step or CSS length', 'outer spacing'],
				['padding · padding-x · padding-y · padding-top · …', 'scale step or CSS length', 'inner spacing'],
				['width · min-width · max-width · height · …', 'bare number (px) or CSS length', 'sizing'],
				['columns · rows', 'bare number or grid-template value', 'grid template'],
				[
					'small-columns · medium-columns · large-columns · extra-large-columns',
					'bare number or grid-template value',
					'responsive columns'
				]
			]}
		/>

		<h2>When to reach for something else</h2>
		<p>
			For common layouts, prefer the dedicated primitives built on the same engine:{' '}
			<DocsLink href="/elements/z-stack">z-stack</DocsLink>, <DocsLink href="/elements/z-grid">z-grid</DocsLink>,{' '}
			<DocsLink href="/elements/z-cluster">z-cluster</DocsLink>, <DocsLink href="/elements/z-center">z-center</DocsLink>.
		</p>
	</ComponentDoc>
)
