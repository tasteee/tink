import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZThemeSwitcherDoc = () => (
	<ComponentDoc
		tag="z-theme-switcher"
		category="Actions"
		description="The control that switches the page between zest's dark and light themes. Every switcher on a page shares one saved preference, so they stay in step without being wired together."
	>
		<DocExample
			demo="z-theme-switcher/segmented"
			title="Segmented"
			description="Light, dark and system as one joined control. System follows the operating system."
		/>
		<DocExample
			demo="z-theme-switcher/icon-toggle"
			title="Icon toggle"
			description='Use kind="icon" for a crowded header. It flips between light and dark and has no system state.'
		/>
		<DocExample demo="z-theme-switcher/sizes" title="Sizes" description="" />
		<DocExample
			demo="z-theme-switcher/read-the-theme"
			title="Read the theme"
			description="The change event fires on a user choice. getTheme(), setThemePreference() and subscribeToTheme() let an app read or set the same state."
		/>
	</ComponentDoc>
)
