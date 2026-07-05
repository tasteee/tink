import { c, css } from 'atomico'

/*
 * z-chat-shell — the app frame for a chat: a resizable inbox rail, the thread,
 * and an optional details pane. Composes z-resizable-panels, so the dividers
 * drag and (with an auto-save-id) persist.
 *
 *   <z-chat-shell>
 *     <z-conversation-list slot="list">…</z-conversation-list>
 *     <div>…header + z-message-list + z-composer…</div>
 *   </z-chat-shell>
 *
 * Add `has-details` to include a third pane (fed by the `details` slot). Tune
 * `list-size` / `details-size` (px or %).
 */
const styles = css`
	:host {
		display: block;
		height: 100%;
		min-height: 0;
	}
	z-resizable-panels {
		height: 100%;
	}
	.pane {
		height: 100%;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}
`

export const ZChatShell = c(
	(props) => {
		const listSize = (props.listSize as string) || '320px'
		const detailsSize = (props.detailsSize as string) || '300px'

		return (
			<host shadowDom>
				<z-resizable-panels direction="row" auto-save-id={props.autoSaveId}>
					<z-panel default-size={listSize} min-size="240px" max-size="460px">
						<div class="pane">
							<slot name="list" />
						</div>
					</z-panel>
					<z-panel-handle></z-panel-handle>
					<z-panel min-size="30%">
						<div class="pane">
							<slot />
						</div>
					</z-panel>
					{props.hasDetails && <z-panel-handle></z-panel-handle>}
					{props.hasDetails && (
						<z-panel default-size={detailsSize} min-size="240px" max-size="440px">
							<div class="pane">
								<slot name="details" />
							</div>
						</z-panel>
					)}
				</z-resizable-panels>
			</host>
		)
	},
	{
		props: {
			hasDetails: { type: Boolean, reflect: true },
			listSize: { type: String, reflect: true },
			detailsSize: { type: String, reflect: true },
			autoSaveId: { type: String, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-chat-shell', ZChatShell)
