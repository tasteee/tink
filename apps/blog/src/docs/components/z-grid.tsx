import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZGridDoc = () => (
	<ComponentDoc tag="z-grid" category="Layout" description="CSS grid — fixed `columns` for a known count, or `min-column-width` for a responsive auto-fit grid.">
		<div className="block">
			<div className="block-title">
				<h3>columns="4"</h3>
				<span className="desc">a fixed four-track grid</span>
			</div>
			<div className="panel">
				<div className="stage">
					<z-grid columns='4' gap='sm'>
						<z-surface className='tile' tone='primary' variant='soft' radius='md'>1</z-surface>
						<z-surface className='tile' variant='soft' radius='md'>2</z-surface>
						<z-surface className='tile' variant='soft' radius='md'>3</z-surface>
						<z-surface className='tile' tone='secondary' variant='soft' radius='md'>4</z-surface>
						<z-surface className='tile' variant='soft' radius='md'>5</z-surface>
						<z-surface className='tile' variant='soft' radius='md'>6</z-surface>
						<z-surface className='tile' variant='soft' radius='md'>7</z-surface>
						<z-surface className='tile' tone='primary' variant='soft' radius='md'>8</z-surface>
					</z-grid>
				</div>
				<p className='cap'><span className='el'>&lt;z-grid</span> <b>columns</b>="4" <b>gap</b>="sm"<span className='el'>&gt;</span></p>
			</div>
		</div>
		<div className="block">
			<div className="block-title">
				<h3>min-column-width="14rem"</h3>
				<span className="desc">resize the window — tracks add and drop themselves</span>
			</div>
			<div className="panel">
				<div className="stage">
					<z-grid minColumnWidth='14rem' gap='sm'>
						<z-surface className='tile' tone='primary' variant='soft' radius='md'>auto-fit</z-surface>
						<z-surface className='tile' variant='soft' radius='md'>auto-fit</z-surface>
						<z-surface className='tile' variant='soft' radius='md'>auto-fit</z-surface>
						<z-surface className='tile' tone='secondary' variant='soft' radius='md'>auto-fit</z-surface>
						<z-surface className='tile' variant='soft' radius='md'>auto-fit</z-surface>
					</z-grid>
				</div>
				<p className='cap'><span className='el'>&lt;z-grid</span> <b>min-column-width</b>="14rem" <b>gap</b>="sm"<span className='el'>&gt;</span></p>
			</div>
		</div>
	</ComponentDoc>
)
