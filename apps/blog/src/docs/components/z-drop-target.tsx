import { ComponentDoc } from '@app/docs/ComponentDoc'

const targetStyle = {
	width: '10rem',
	height: '5.5rem',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	textAlign: 'center' as const,
	border: '1.5px dashed var(--border)',
	borderRadius: 'var(--radius-md)',
	fontFamily: 'var(--font-mono)',
	fontSize: '0.8125rem',
	color: 'var(--muted-foreground)'
}

export const ZDropTargetDoc = () => (
	<ComponentDoc
		tag="z-drop-target"
		category="Specialized"
		description={'The drop surface for z-draggable. It matches a draggable when their group is equal and accept includes the draggable’s type (or accept is "*") — a mismatched drag over it shows the reject state via data-state="reject".'}
	>
		<div className="block">
			<div className="panel">
				<div className="row" style={{ gap: '2rem', alignItems: 'flex-start' }}>
					<z-draggable type="card" group="demo" data={{ id: 1 }}>
						<z-card style={{ width: '9rem', cursor: 'grab', textAlign: 'center' }}>card</z-card>
					</z-draggable>
					<z-drop-target accept="card" group="demo" style={targetStyle}>
						Accepts "card"
					</z-drop-target>
					<z-drop-target accept="note" group="demo" style={targetStyle}>
						Accepts "note" only
					</z-drop-target>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
