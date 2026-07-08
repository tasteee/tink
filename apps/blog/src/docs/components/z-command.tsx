import { ComponentDoc } from '@app/docs/ComponentDoc'

const COMMAND_ITEMS = [
	{ group: 'Navigation', value: 'home', label: 'Go to Dashboard', shortcut: 'G D' },
	{ group: 'Navigation', value: 'projects', label: 'Go to Projects', shortcut: 'G P', keywords: 'work' },
	{ group: 'Navigation', value: 'settings', label: 'Go to Settings', shortcut: 'G S' },
	{ group: 'Actions', value: 'new', label: 'New Project', shortcut: '⌘N', keywords: 'create add' },
	{ group: 'Actions', value: 'invite', label: 'Invite teammate', keywords: 'member user' },
	{ group: 'Actions', value: 'theme', label: 'Toggle theme', isDisabled: true }
]

export const ZCommandDoc = () => (
	<ComponentDoc tag="z-command" category="Overlays" description="A command palette — items grouped, with shortcuts and keywords.">
		<div className="block">
			<div className="panel">
				<z-command placeholder='Type a command or search…' items={COMMAND_ITEMS}>
					<z-button slot='trigger' kind='outline'>Open command palette</z-button>
				</z-command>
			</div>
		</div>
	</ComponentDoc>
)
