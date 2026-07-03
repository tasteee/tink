import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZRadioDoc = () => (
	<ComponentDoc tag="z-radio" category="Forms" description="A single option inside z-radio-group — always used as its child.">
		<div className="block">
			<div className="panel">
				<z-text size="sm" color="muted" style={{ display: 'block', marginBottom: '1rem' }}>
					Always rendered inside a &lt;z-radio-group&gt; — see that page for the full pattern.
				</z-text>
				<z-radio-group value='monthly' label='Billing'>
					<z-radio value='monthly'>Monthly</z-radio>
					<z-radio value='yearly'>Yearly</z-radio>
					<z-radio value='lifetime' isDisabled>Lifetime (soon)</z-radio>
				</z-radio-group>
			</div>
		</div>
	</ComponentDoc>
)
