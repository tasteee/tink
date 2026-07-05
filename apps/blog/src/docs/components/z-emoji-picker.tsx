import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZEmojiPickerDoc = () => (
	<ComponentDoc
		tag="z-emoji-picker"
		category="Chat"
		description="A categorized emoji panel with search. Drop it inside a z-popover for a composer's emoji button or a message reaction picker. Emits select {emoji}. Ships a curated set; replace via the emojis property."
	>
		<div className="block">
			<div className="panel">
				<z-emoji-picker />
			</div>
		</div>
	</ComponentDoc>
)
