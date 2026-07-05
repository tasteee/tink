import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZToolbarGroupDoc = () => (
	<ComponentDoc
		tag="z-toolbar-group"
		category="Actions"
		description="A labeled cluster of related controls inside a z-toolbar — keeps buttons tight and exposes an accessible group name."
	>
		<div className="block">
			<div className="panel">
				<z-toolbar>
					<z-toolbar-group label="Text style">
						<z-button kind="ghost" size="small">B</z-button>
						<z-button kind="ghost" size="small">I</z-button>
						<z-button kind="ghost" size="small">U</z-button>
					</z-toolbar-group>
					<z-separator orientation="vertical" style={{ height: '1.25rem' }} />
					<z-toolbar-group label="Insert">
						<z-button kind="ghost" size="small">Link</z-button>
						<z-button kind="ghost" size="small">Image</z-button>
					</z-toolbar-group>
				</z-toolbar>
			</div>
		</div>
	</ComponentDoc>
)
