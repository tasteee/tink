import { c, css, useState, useEffect, useRef } from 'atomico'
import { debounce } from '../shared/debounce'

/*
 * z-status-bar — a sticky bottom bar for a text editor: word/char count, read
 * time, cursor position, and save state. Drive it from your editor:
 *   bar.text = editor.getText()          // recomputed debounced ~500ms
 *   bar.cursorLine = 12                  // live, not debounced — cheap and
 *   bar.cursorColumn = 4                 // users expect it to track instantly
 *   bar.saveState = 'saving'             // 'idle' | 'saving' | 'saved'
 * Setting saveState to 'saved' auto-reverts the *displayed* state back to
 * 'idle' after 2s — you don't need your own timer, just set 'saved' once.
 */
const styles = css`
	:host {
		display: flex;
		align-items: center;
		gap: 1rem;
		box-sizing: border-box;
		width: 100%;
		padding: 0.375rem 0.875rem;
		background: var(--popover);
		border-top: 1px solid var(--border);
		color: var(--muted-foreground);
		font-size: var(--font-size-caption);
		position: sticky;
		bottom: 0;
	}

	.stat {
		display: inline-flex;
		align-items: center;
		gap: 0.3125rem;
		white-space: nowrap;
	}

	.spacer {
		flex: 1;
	}

	.save-state {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
	}

	.dot {
		width: 0.4rem;
		height: 0.4rem;
		border-radius: 999px;
		background: var(--muted-foreground);
	}

	.save-state.is-saving .dot {
		background: var(--warning);
	}

	.save-state.is-saved .dot {
		background: var(--success);
	}
`

const computeStats = (text: string, wordsPerMinute: number) => {
	const trimmed = text.trim()
	const words = trimmed ? trimmed.split(/\s+/).length : 0
	const chars = text.length
	const readMinutes = words === 0 ? 0 : Math.max(1, Math.round(words / wordsPerMinute))
	return { words, chars, readMinutes }
}

export const ZStatusBar = c(
	(props) => {
		const [stats, setStats] = useState(() => computeStats(String(props.text || ''), props.wordsPerMinute || 200))
		const [displaySaveState, setDisplaySaveState] = useState(String(props.saveState || 'idle'))
		const debouncedRef = useRef<ReturnType<typeof debounce<[string, number]>>>()
		const revertTimerRef = useRef<ReturnType<typeof setTimeout>>()

		useEffect(() => {
			const runDebounced =
				debouncedRef.current ?? (debouncedRef.current = debounce((text: string, wpm: number) => setStats(computeStats(text, wpm)), 500))
			runDebounced(String(props.text || ''), props.wordsPerMinute || 200)
			return () => runDebounced.cancel()
		}, [props.text, props.wordsPerMinute])

		useEffect(() => {
			clearTimeout(revertTimerRef.current)
			const next = String(props.saveState || 'idle')
			setDisplaySaveState(next)
			if (next !== 'saved') return
			revertTimerRef.current = setTimeout(() => setDisplaySaveState('idle'), 2000)
			return () => clearTimeout(revertTimerRef.current)
		}, [props.saveState])

		const saveStateLabel = displaySaveState === 'saving' ? 'Saving…' : displaySaveState === 'saved' ? 'Saved' : 'Idle'
		const hasCursor = props.cursorLine != null

		return (
			<host shadowDom role="status" aria-label="Document status">
				<span class="stat">{stats.words} words</span>
				<span class="stat">{stats.chars} chars</span>
				<span class="stat">{stats.readMinutes} min read</span>
				{hasCursor && (
					<span class="stat">
						Ln {props.cursorLine}, Col {props.cursorColumn ?? 1}
					</span>
				)}
				<span class="spacer" />
				<span class={['save-state', `is-${displaySaveState}`].join(' ')}>
					<span class="dot" aria-hidden="true" />
					{saveStateLabel}
				</span>
			</host>
		)
	},
	{
		props: {
			text: { type: String },
			cursorLine: { type: Number },
			cursorColumn: { type: Number },
			saveState: { type: String, reflect: true },
			wordsPerMinute: { type: Number }
		},
		styles
	}
)

customElements.define('z-status-bar', ZStatusBar)
