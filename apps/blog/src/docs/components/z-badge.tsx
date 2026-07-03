import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZBadgeDoc = () => (
	<ComponentDoc
		tag="z-badge"
		category="Data Display"
		description="Pills and inline status — soft, solid, outline kinds; selectable and removable variants."
	>
		<div className="block">
			<div className="block-title">
				<h3>Tints &amp; kinds</h3>
			</div>
			<div className="panel">
				<div className='micro'>Soft tints</div>
				<div className='row'>
					<z-badge tone='primary'>Active</z-badge>
					<z-badge tone='secondary'>Featured</z-badge>
					<z-badge tone='primary'>New</z-badge>
					<z-badge kind='outline'>Default</z-badge>
				</div>
				<div className='micro' style={{ marginTop: '2rem' }}>Solid &amp; outline</div>
				<div className='row'>
					<z-badge kind='solid' tone='primary'>Solid</z-badge>
					<z-badge kind='solid' tone='secondary'>Solid</z-badge>
				</div>
				<div className='micro' style={{ marginTop: '2rem' }}>Inline status</div>
				<div className='row' style={{ gap: '1.5rem' }}>
					<z-badge isDot tone='primary'>Online</z-badge>
					<z-badge isDot tone='secondary'>Limited</z-badge>
					<z-badge isDot tone='neutral'>Premium</z-badge>
				</div>
			</div>
		</div>
		<div className="block">
			<div className="block-title">
				<h3>Interactive</h3>
				<span className="desc">selectable &amp; removable tags</span>
			</div>
			<div className="panel">
				<div className='row'>
					<z-badge kind='outline'>Design</z-badge>
					<z-badge isSelectable isSelected>Selected</z-badge>
					<z-badge isSelectable>Selectable</z-badge>
					<z-badge kind='outline' isRemovable>Removable</z-badge>
					<z-badge tone='secondary' isSelectable isSelected>Pink</z-badge>
					<z-badge isSelectable isDisabled>Disabled</z-badge>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
