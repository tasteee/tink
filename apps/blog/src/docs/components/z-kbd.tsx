import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZKbdDoc = () => (
	<ComponentDoc
		tag="z-kbd"
		category="Data Display"
		description="A keyboard key cap for documenting shortcuts — mono, bordered, with a subtle raised edge. Five sizes."
	>
		<div className="block">
			<div className="block-title">
				<h3>Sizes</h3>
			</div>
			<div className="panel">
				<div className="row" style={{ alignItems: 'center', gap: '1rem' }}>
					<z-kbd size="xs">xs</z-kbd>
					<z-kbd size="sm">sm</z-kbd>
					<z-kbd size="md">md</z-kbd>
					<z-kbd size="lg">lg</z-kbd>
					<z-kbd size="xl">xl</z-kbd>
				</div>
			</div>
		</div>
		<div className="block">
			<div className="block-title">
				<h3>Chords</h3>
				<span className="desc">combine with plain "+" between keys</span>
			</div>
			<div className="panel">
				<div className="row" style={{ alignItems: 'center', gap: '0.5rem' }}>
					<z-kbd>⌘</z-kbd>
					<span>+</span>
					<z-kbd>⇧</z-kbd>
					<span>+</span>
					<z-kbd>K</z-kbd>
				</div>
				<div className="micro" style={{ marginTop: '2rem' }}>Inline in prose</div>
				<div className="row">
					<z-text>
						Press <z-kbd size="sm">Ctrl</z-kbd> <z-kbd size="sm">C</z-kbd> to copy.
					</z-text>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
