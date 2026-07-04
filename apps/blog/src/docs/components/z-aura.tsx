import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZAuraDoc = () => (
	<ComponentDoc
		tag="z-aura"
		category="Specialized"
		description="A rotating border-light effect that wraps any element in an animated glowing frame. Accent, dual, rainbow, holo, gold, silver, or a soft glow halo."
	>
		<div className="block">
			<div className="block-title">
				<h3>Variants</h3>
			</div>
			<div className="panel">
				<div className="row" style={{ gap: '1.5rem', flexWrap: 'wrap' }}>
					<z-aura>
						<z-button kind="solid">Accent</z-button>
					</z-aura>
					<z-aura variant="dual">
						<z-button kind="solid">Dual</z-button>
					</z-aura>
					<z-aura variant="rainbow">
						<z-button kind="solid">Rainbow</z-button>
					</z-aura>
					<z-aura variant="holo">
						<z-button kind="solid">Holo</z-button>
					</z-aura>
					<z-aura variant="gold">
						<z-button kind="solid">Gold</z-button>
					</z-aura>
					<z-aura variant="silver">
						<z-button kind="solid">Silver</z-button>
					</z-aura>
					<z-aura variant="glow">
						<z-button kind="solid">Glow</z-button>
					</z-aura>
				</div>
			</div>
		</div>
		<div className="block">
			<div className="block-title">
				<h3>Wraps anything</h3>
				<span className="desc">cards, avatars, images — size scales the frame</span>
			</div>
			<div className="panel">
				<div className="row" style={{ gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
					<z-aura variant="rainbow" size="lg" style={{ ['--aura-radius' as any]: '999px' }}>
						<z-avatar label="ZA"></z-avatar>
					</z-aura>
					<z-aura size="xl">
						<z-card style={{ width: '14rem', padding: '1.25rem' }}>
							<z-text weight="600">Pro plan</z-text>
							<z-text size="sm" color="muted" style={{ display: 'block' }}>
								Highlighted with an aura frame.
							</z-text>
						</z-card>
					</z-aura>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
