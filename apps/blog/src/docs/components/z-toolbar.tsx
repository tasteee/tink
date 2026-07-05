import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZToolbarDoc = () => (
	<ComponentDoc
		tag="z-toolbar"
		category="Actions"
		description="An action strip with real toolbar semantics: role=toolbar + roving tabindex, so the whole bar is one tab stop and arrow keys move between controls."
	>
		<div className="block">
			<div className="panel">
				<z-toolbar>
					<z-button kind="ghost" size="small">Bold</z-button>
					<z-button kind="ghost" size="small">Italic</z-button>
					<z-button kind="ghost" size="small">Underline</z-button>
					<z-separator orientation="vertical" style={{ height: '1.25rem' }} />
					<z-button kind="ghost" size="small">Link</z-button>
					<z-button kind="ghost" size="small">Code</z-button>
				</z-toolbar>
			</div>
		</div>

		<div className="block">
			<h3>Vertical</h3>
			<div className="panel">
				<z-toolbar orientation="vertical" style={{ width: 'fit-content' }}>
					<z-button kind="ghost" size="small">Move</z-button>
					<z-button kind="ghost" size="small">Scale</z-button>
					<z-button kind="ghost" size="small">Rotate</z-button>
				</z-toolbar>
			</div>
		</div>
	</ComponentDoc>
)
