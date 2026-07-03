import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZButtonDoc = () => (
	<ComponentDoc tag="z-button" category="Actions" description="5 kinds × 6 tones × 3 sizes.">
		<div className="block">
			<div className="panel">
				<div className='micro'>Kinds — neutral tone</div>
				<div className='row'>
					<z-button kind='solid'>Solid</z-button>
					<z-button kind='soft'>Soft</z-button>
					<z-button kind='outline'>Outline</z-button>
					<z-button kind='ghost'>Ghost</z-button>
					<z-button kind='plain'>Plain</z-button>
				</div>
				<div className='micro' style={{ marginTop: '2rem' }}>Kinds — purple tone</div>
				<div className='row'>
					<z-button tone='primary' kind='solid'>Solid</z-button>
					<z-button tone='primary' kind='soft'>Soft</z-button>
					<z-button tone='primary' kind='outline'>Outline</z-button>
					<z-button tone='primary' kind='ghost'>Ghost</z-button>
					<z-button tone='primary' kind='plain'>Plain</z-button>
				</div>
				<div className='micro' style={{ marginTop: '2rem' }}>Kinds — pink tone</div>
				<div className='row'>
					<z-button tone='secondary' kind='solid'>Solid</z-button>
					<z-button tone='secondary' kind='soft'>Soft</z-button>
					<z-button tone='secondary' kind='outline'>Outline</z-button>
					<z-button tone='secondary' kind='ghost'>Ghost</z-button>
					<z-button tone='secondary' kind='plain'>Plain</z-button>
				</div>
				<div className='micro' style={{ marginTop: '2rem' }}>Sizes &amp; states</div>
				<div className='row'>
					<z-button size='small'>Small</z-button>
					<z-button size='medium'>Medium</z-button>
					<z-button size='large'>Large</z-button>
				</div>
				<div className='row' style={{ marginTop: '1.5rem' }}>
					<z-button isLoading>Loading</z-button>
					<z-button isDisabled>Disabled</z-button>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
