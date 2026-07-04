import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZSwapDoc = () => (
	<ComponentDoc
		tag="z-swap"
		category="Actions"
		description="Toggles between two faces — click to toggle, or control with is-active. Stack them in one footprint (crossfade) or set them beside each other; fade, rotate, or flip."
	>
		<div className="block">
			<div className="block-title">
				<h3>Stacked</h3>
				<span className="desc">kind=stack (default) — both faces share one footprint and crossfade</span>
			</div>
			<div className="panel">
				<div className="row" style={{ alignItems: 'center', gap: '2.5rem' }}>
					<z-swap style={{ fontSize: '1.25rem' }}>
						<span slot="off">OFF</span>
						<span slot="on">ON</span>
					</z-swap>
					<z-swap effect="rotate" style={{ fontSize: '1.5rem' }}>
						<span slot="off">☀️</span>
						<span slot="on">🌙</span>
					</z-swap>
					<z-swap effect="flip" style={{ fontSize: '1.5rem' }}>
						<span slot="off">😴</span>
						<span slot="on">🥳</span>
					</z-swap>
				</div>
			</div>
		</div>

		<div className="block">
			<div className="block-title">
				<h3>Beside</h3>
				<span className="desc">kind=beside — the faces sit next to each other</span>
			</div>
			<div className="panel">
				<div className="row" style={{ alignItems: 'center', gap: '2.5rem' }}>
					<z-swap kind="beside" style={{ fontSize: '1.25rem' }}>
						<span slot="off">OFF</span>
						<span slot="on">ON</span>
					</z-swap>
					<z-swap kind="beside" style={{ fontSize: '1.5rem' }}>
						<span slot="off">☀️</span>
						<span slot="on">🌙</span>
					</z-swap>
				</div>
			</div>
		</div>

		<div className="block">
			<div className="block-title">
				<h3>Beside, with ghost</h3>
				<span className="desc">
					has-ghost — the inactive face lingers as a faint silhouette so the space reads evenly
				</span>
			</div>
			<div className="panel">
				<div className="row" style={{ alignItems: 'center', gap: '2.5rem' }}>
					<z-swap kind="beside" has-ghost style={{ fontSize: '1.25rem' }}>
						<span slot="off">OFF</span>
						<span slot="on">ON</span>
					</z-swap>
					<z-swap kind="beside" has-ghost style={{ fontSize: '1.5rem' }}>
						<span slot="off">☀️</span>
						<span slot="on">🌙</span>
					</z-swap>
					<z-swap kind="beside" has-ghost style={{ fontSize: '1.5rem' }}>
						<span slot="off">😴</span>
						<span slot="on">🥳</span>
					</z-swap>
				</div>
			</div>
		</div>

		<div className="block">
			<div className="block-title">
				<h3>Controlled &amp; disabled</h3>
			</div>
			<div className="panel">
				<div className="row" style={{ alignItems: 'center', gap: '2.5rem' }}>
					<z-swap effect="rotate" isActive style={{ fontSize: '1.25rem' }}>
						<span slot="off">＋</span>
						<span slot="on">✕</span>
					</z-swap>
					<z-swap isDisabled style={{ fontSize: '1.25rem' }}>
						<span slot="off">OFF</span>
						<span slot="on">ON</span>
					</z-swap>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
