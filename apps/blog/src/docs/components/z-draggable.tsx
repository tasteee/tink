import { ComponentDoc } from '@app/docs/ComponentDoc'

const dropTargetStyle = {
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

export const ZDraggableDoc = () => (
	<ComponentDoc
		tag="z-draggable"
		category="Specialized"
		description="A pointer-based drag source (deliberately not native HTML5 DnD, which is inconsistent and hard to style). Give it a type + data; pairs with z-drop-target, which accepts the drop when its accept list matches."
	>
		<div className="block">
			<div className="panel">
				<div className="row" style={{ gap: '2rem', alignItems: 'flex-start' }}>
					<z-draggable type="card" group="demo" data={{ id: 1, label: 'Task card' }}>
						<z-card style={{ width: '9rem', cursor: 'grab', textAlign: 'center' }}>Drag me</z-card>
					</z-draggable>
					<z-drop-target accept="card" group="demo" style={dropTargetStyle}>
						Drop here
					</z-drop-target>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
