import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZClusterDoc = () => (
	<ComponentDoc tag="z-cluster" category="Layout" description="A horizontal row that wraps by default — for tags, filters, toolbars, and badge groups.">
		<div className="panel">
			<div className='micro'>tags &amp; actions · wraps onto new lines</div>
			<div className="stage">
				<z-cluster gap='sm' alignsY='center'>
					<z-badge kind='outline'>Design systems</z-badge>
					<z-badge kind='outline'>Web platform</z-badge>
					<z-badge kind='outline'>OKLCH</z-badge>
					<z-badge kind='outline'>Shadow DOM</z-badge>
					<z-badge kind='outline'>Atomico</z-badge>
					<z-badge kind='outline'>Tokens</z-badge>
					<z-badge tone='primary' kind='outline'>+6 more</z-badge>
				</z-cluster>
			</div>
			<p className='cap'><span className='el'>&lt;z-cluster</span> <b>gap</b>="sm" <b>aligns-y</b>="center"<span className='el'>&gt;</span></p>
		</div>
		<div className="block">
			<div className="block-title">
				<h3>aligns-x="end"</h3>
				<span className="desc">push the cluster to the trailing edge — e.g. dialog footers</span>
			</div>
			<div className="panel">
				<div className="stage">
					<z-cluster gap='sm' alignsX='end' alignsY='center' fullWidth>
						<z-button kind='outline' size='small'>Cancel</z-button>
						<z-button tone='primary' kind='solid' size='small'>Save changes</z-button>
					</z-cluster>
				</div>
				<p className='cap'><span className='el'>&lt;z-cluster</span> <b>aligns-x</b>="end" <b>gap</b>="sm" <b>full-width</b><span className='el'>&gt;</span></p>
			</div>
		</div>
	</ComponentDoc>
)
