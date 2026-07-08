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
					<z-button slot="leading" kind="ghost" size="small">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<path d="M12 5v14M5 12h14" />
						</svg>
					</z-button>
				</z-composer>
			</div>
		</div>
	</ComponentDoc>
)
