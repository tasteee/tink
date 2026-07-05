import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZComposerDoc = () => (
	<ComponentDoc
		tag="z-composer"
		category="Chat"
		description="The message input row: an auto-growing textarea flanked by a leading action slot and a trailing send control. Enter sends, Shift+Enter inserts a newline. Emits input {value} and send {value} (then clears). The shared base the AI prompt-input extends."
	>
		<div className="block">
			<div className="panel">
				<z-composer placeholder="Message Alice…" />
			</div>
		</div>

		<div className="block">
			<h3>With a leading action</h3>
			<div className="panel">
				<z-composer placeholder="Message…">
					<z-button slot="leading" kind="ghost" size="small">＋</z-button>
				</z-composer>
			</div>
		</div>
	</ComponentDoc>
)
