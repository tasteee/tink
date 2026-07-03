import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZRangeHandleDoc = () => (
	<ComponentDoc tag="z-range-handle" category="Forms" description="A single draggable handle inside z-range — always used as its child, never standalone.">
		<div className="block">
			<div className="panel" style={{ maxWidth: '480px' }}>
				<z-text size="sm" color="muted" style={{ display: 'block', marginBottom: '1rem' }}>
					Always rendered inside a &lt;z-range&gt; — see that page for the full pattern. Takes a <code>value</code>, an
					optional per-handle <code>min</code>/<code>max</code>, and a <code>tone</code>.
				</z-text>
				<z-range min={0} max={1000} label='Price range' showValue valuePrefix='$'>
					<z-range-handle value={200} />
					<z-range-handle value={750} tone='secondary' />
				</z-range>
			</div>
		</div>
	</ComponentDoc>
)
