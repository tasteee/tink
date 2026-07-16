import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocsLink } from '@app/docs/DocsLink'
import { DocExample } from '@app/docs/DocExample'

const COLUMN_CODE = `<z-box is-flex is-column gap="4">
	<p>Column layout</p>
	<p>is-flex is-column gap="4"</p>
</z-box>`

const ROW_WRAP_CODE = `<z-box is-flex is-row gap="3" does-wrap>
	<z-badge kind="outline">Row</z-badge>
	<z-badge kind="outline">does-wrap</z-badge>
	<z-badge kind="outline">gap="3"</z-badge>
</z-box>`

const SPACE_BETWEEN_CODE = `<z-box is-flex is-row y-center x-between margin-bottom="1rem">
	<span>Left</span>
	<span>Right</span>
</z-box>`

const GRID_CODE = `<z-box is-grid columns="1" medium-columns="3" gap="4">
	<z-card is-column gap="2">One</z-card>
	<z-card is-column gap="2">Two</z-card>
	<z-card is-column gap="2">Three</z-card>
</z-box>`

const DISPLAY_COLUMNS = [
	{ key: 'attr', label: 'Attribute', isMono: true },
	{ key: 'effect', label: 'Effect' }
]
const DISPLAY_ROWS = [
	{ id: 1, attr: 'is-row · is-column', effect: 'flex-direction' },
	{ id: 2, attr: 'is-flex · is-inline-flex', effect: 'display: flex / inline-flex' },
	{ id: 3, attr: 'is-grid · is-inline-grid', effect: 'display: grid / inline-grid' },
	{ id: 4, attr: 'is-block · is-inline-block · is-inline', effect: 'block display modes' },
	{ id: 5, attr: 'does-wrap', effect: 'flex-wrap: wrap' },
	{ id: 6, attr: 'does-wrap-text', effect: 'allow text inside to wrap' }
]

const ALIGN_COLUMNS = [
	{ key: 'attr', label: 'Attribute', isMono: true },
	{ key: 'axis', label: 'Axis' },
	{ key: 'effect', label: 'Effect' }
]
const ALIGN_ROWS = [
	{
		id: 1,
		attr: 'x-start · x-center · x-end · x-between · x-around · x-evenly · x-stretch',
		axis: 'main',
		effect: 'justify-content (flex) / justify-items (grid)'
	},
	{
		id: 2,
		attr: 'y-start · y-center · y-end · y-between · y-around · y-evenly · y-stretch',
		axis: 'cross',
		effect: 'align-items (flex) / align-content (grid)'
	}
]

const VALUE_COLUMNS = [
	{ key: 'attr', label: 'Attribute', isMono: true },
	{ key: 'type', label: 'Value' },
	{ key: 'effect', label: 'Description' }
]
const VALUE_ROWS = [
	{ id: 1, attr: 'gap · row-gap · column-gap', type: 'scale step or CSS length', effect: 'spacing between children' },
	{
		id: 2,
		attr: 'margin · margin-x · margin-y · margin-top · margin-right · margin-bottom · margin-left',
		type: 'scale step or CSS length',
		effect: 'outer spacing'
	},
	{
		id: 3,
		attr: 'padding · padding-x · padding-y · padding-top · padding-right · padding-bottom · padding-left',
		type: 'scale step or CSS length',
		effect: 'inner spacing'
	},
	{
		id: 4,
		attr: 'width · min-width · max-width · height · min-height · max-height',
		type: 'bare number (px) or CSS length',
		effect: 'sizing'
	},
	{ id: 5, attr: 'columns · rows', type: 'bare number or CSS grid-template value', effect: 'grid template' },
	{
		id: 6,
		attr: 'small-columns · medium-columns · large-columns · extra-large-columns',
		type: 'bare number or CSS grid-template value',
		effect: 'responsive grid columns at each breakpoint'
	}
]

export const ZBoxDoc = () => (
	<ComponentDoc
		tag="z-box"
		category="Foundations"
		description="The general-purpose layout primitive — flexbox or grid via boolean props, no CSS required."
	>
		<DocExample title="Start with one relationship" description="z-box is the flexible escape hatch. Declare only the display, axis, and spacing needed for this group." code={`<z-box is-flex is-row x-between y-center gap="3">
  <z-text weight="600">Workspace</z-text>
  <z-button size="small">Invite</z-button>
</z-box>`}>
			<z-box isFlex isRow xBetween yCenter gap="3"><z-text weight="600">Workspace</z-text><z-button size="small">Invite</z-button></z-box>
		</DocExample>
		<DocExample title="Let responsive grid carry the page" description="Use responsive column props for repeated content; do not create a card just to obtain layout." code={`<z-box is-grid columns="1" medium-columns="2" large-columns="3" gap="4">
  <z-text>One</z-text><z-text>Two</z-text><z-text>Three</z-text>
</z-box>`}>
			<z-box isGrid columns="1" mediumColumns="2" largeColumns="3" gap="4"><z-text>One</z-text><z-text>Two</z-text><z-text>Three</z-text></z-box>
		</DocExample>
		<div className="block">
			<div className="block-title">
				<h3>&lt;z-box&gt;</h3>
				<span className="desc">flex · column</span>
			</div>
			<div className="panel">
				<z-box isFlex isColumn gap="4">
					<z-text>Column layout</z-text>
					<z-text color="muted">isFlex isColumn gap="4"</z-text>
				</z-box>
			</div>
			<z-code-block filename="html" language="html" code={COLUMN_CODE} style={{ marginTop: '1rem' }} />
		</div>

		<div className="block">
			<div className="block-title">
				<h3>&lt;z-box&gt;</h3>
				<span className="desc">flex · row · wrap</span>
			</div>
			<div className="panel">
				<z-box isFlex isRow gap="3" doesWrap>
					<z-badge kind="outline">Row</z-badge>
					<z-badge kind="outline">doesWrap</z-badge>
					<z-badge kind="outline">gap="3"</z-badge>
				</z-box>
			</div>
			<z-code-block filename="html" language="html" code={ROW_WRAP_CODE} style={{ marginTop: '1rem' }} />
		</div>

		<div className="block">
			<div className="block-title">
				<h3>&lt;z-box&gt;</h3>
				<span className="desc">flex · row · space-between</span>
			</div>
			<div className="panel">
				<z-box isFlex isRow yCenter xBetween marginBottom="1rem">
					<z-text weight="700" size="sm">
						Left
					</z-text>
					<z-text color="muted" size="xs">
						Right
					</z-text>
				</z-box>
			</div>
			<z-code-block filename="html" language="html" code={SPACE_BETWEEN_CODE} style={{ marginTop: '1rem' }} />
		</div>

		<div className="block">
			<div className="block-title">
				<h3>&lt;z-box&gt;</h3>
				<span className="desc">grid · responsive columns</span>
			</div>
			<div className="panel">
				<z-box isGrid columns="1" mediumColumns="3" gap="4">
					<z-card isColumn gap="2">
						<z-text size="sm">One</z-text>
					</z-card>
					<z-card isColumn gap="2">
						<z-text size="sm">Two</z-text>
					</z-card>
					<z-card isColumn gap="2">
						<z-text size="sm">Three</z-text>
					</z-card>
				</z-box>
			</div>
			<z-code-block filename="html" language="html" code={GRID_CODE} style={{ marginTop: '1rem' }} />
		</div>

		<div className="block">
			<div className="block-title">
				<h3>Value scale</h3>
				<span className="desc">how gap / margin / padding / sizing props resolve</span>
			</div>
			<div className="panel">
				<z-text size="sm" color="muted" style={{ display: 'block' }}>
					Spacing props (<code className="inline">gap</code>, <code className="inline">margin*</code>,{' '}
					<code className="inline">padding*</code>) accept either a <b>scale step</b> <code className="inline">0</code>–
					<code className="inline">8</code>, which maps onto the <code className="inline">--space-*</code> design tokens (
					<code className="inline">3</code> = <code className="inline">--space-md</code>,{' '}
					<code className="inline">4</code> = <code className="inline">--space-base</code>, …; anything above{' '}
					<code className="inline">8</code> falls back to <code className="inline">calc(var(--space-base) * n)</code>), or any{' '}
					<b>CSS length</b> (<code className="inline">1rem</code>, <code className="inline">12px</code>,{' '}
					<code className="inline">2ch</code>), passed through verbatim.
				</z-text>
				<z-text size="sm" color="muted" style={{ display: 'block', marginTop: '1rem' }}>
					Sizing props (<code className="inline">width</code>, <code className="inline">height</code>, …) treat a bare number
					as <code className="inline">px</code> and pass any other CSS length through untouched. Grid{' '}
					<code className="inline">columns</code>/<code className="inline">rows</code> treat a bare number{' '}
					<code className="inline">n</code> as <code className="inline">repeat(n, minmax(0, 1fr))</code>.
				</z-text>
			</div>
		</div>

		<div className="block">
			<div className="block-title">
				<h3>Display attributes</h3>
				<span className="desc">boolean</span>
			</div>
			<z-table columns={DISPLAY_COLUMNS} rows={DISPLAY_ROWS} />
		</div>

		<div className="block">
			<div className="block-title">
				<h3>Alignment attributes</h3>
				<span className="desc">boolean</span>
			</div>
			<z-table columns={ALIGN_COLUMNS} rows={ALIGN_ROWS} />
		</div>

		<div className="block">
			<div className="block-title">
				<h3>Value attributes</h3>
			</div>
			<z-table columns={VALUE_COLUMNS} rows={VALUE_ROWS} />
		</div>

		<div className="block">
			<div className="block-title">
				<h3>Notes</h3>
			</div>
			<div className="panel">
				<z-text size="sm" color="muted" style={{ display: 'block' }}>
					<b>z-box</b> is the general escape hatch — no events, one default slot for its contents. For common layout
					patterns prefer the dedicated primitives, which expose a cleaner axis-based API on top of the same box
					engine: <DocsLink href="/components/z-stack">z-stack</DocsLink>,{' '}
					<DocsLink href="/components/z-grid">z-grid</DocsLink>,{' '}
					<DocsLink href="/components/z-cluster">z-cluster</DocsLink>,{' '}
					<DocsLink href="/components/z-center">z-center</DocsLink>.
				</z-text>
			</div>
		</div>
	</ComponentDoc>
)
