import { c, css, event, useState } from 'atomico'
import { themedScrollbarStyles } from '../shared/scrollbar-styles'

/*
 * z-emoji-picker — a categorized emoji panel with search. Drop it inside a
 * z-popover for a composer's emoji button or a message's reaction picker.
 * Emits `select` {emoji} when one is chosen.
 *
 *   const picker = document.querySelector('z-emoji-picker')
 *   picker.addEventListener('select', (e) => insert(e.detail.emoji))
 *
 * Ships a curated set (~120) grouped into categories, each tagged with a name so
 * the search box can filter across all of them. Extend or replace via the
 * `emojis` property (array of { char, name, cat }).
 */
type Emoji = { char: string; name: string; cat: string }

const CATEGORIES = [
	{ id: 'Smileys', icon: '😀' },
	{ id: 'Gestures', icon: '👍' },
	{ id: 'Hearts', icon: '❤️' },
	{ id: 'Animals', icon: '🐶' },
	{ id: 'Food', icon: '🍕' },
	{ id: 'Activities', icon: '⚽' },
	{ id: 'Travel', icon: '✈️' },
	{ id: 'Objects', icon: '💡' },
	{ id: 'Symbols', icon: '✅' }
]

// prettier-ignore
const DEFAULT_EMOJIS: Emoji[] = [
	['😀','grinning'],['😃','smiley'],['😄','happy'],['😁','beaming'],['😆','laughing'],['😅','sweat smile'],['😂','joy tears'],['🙂','slight smile'],['😉','wink'],['😊','blush'],['😍','heart eyes'],['😘','kiss'],['😎','cool sunglasses'],['🤔','thinking'],['😐','neutral'],['😴','sleep'],['😢','cry'],['😭','sob'],['😡','angry'],['🥳','party'],['🤯','mind blown'],['😱','scream'],['🙃','upside down'],['😇','angel'],
	['👍','thumbs up like'],['👎','thumbs down dislike'],['👌','ok'],['✌️','victory peace'],['🤞','crossed fingers'],['🤟','love you'],['🤘','rock'],['👏','clap'],['🙌','raised hands'],['🙏','pray thanks'],['💪','muscle strong'],['👋','wave hello'],['🤝','handshake'],['✍️','writing'],['👀','eyes look'],['🫶','heart hands'],
	['❤️','red heart love'],['🧡','orange heart'],['💛','yellow heart'],['💚','green heart'],['💙','blue heart'],['💜','purple heart'],['🖤','black heart'],['🤍','white heart'],['💔','broken heart'],['💕','two hearts'],['💖','sparkling heart'],['💘','heart arrow'],['💯','hundred perfect'],['🔥','fire lit'],['✨','sparkles'],['⭐','star'],
	['🐶','dog'],['🐱','cat'],['🐭','mouse'],['🐹','hamster'],['🐰','rabbit'],['🦊','fox'],['🐻','bear'],['🐼','panda'],['🐨','koala'],['🐯','tiger'],['🦁','lion'],['🐸','frog'],['🐵','monkey'],['🦄','unicorn'],['🐝','bee'],['🦋','butterfly'],
	['🍕','pizza'],['🍔','burger'],['🍟','fries'],['🌮','taco'],['🍣','sushi'],['🍜','ramen noodles'],['🍩','donut'],['🍪','cookie'],['🎂','cake birthday'],['🍎','apple'],['🍌','banana'],['🍓','strawberry'],['☕','coffee'],['🍺','beer'],['🍷','wine'],['🥂','cheers'],
	['⚽','soccer football'],['🏀','basketball'],['🏈','football'],['⚾','baseball'],['🎾','tennis'],['🏐','volleyball'],['🎮','game controller'],['🎲','dice'],['🎯','target dart'],['🎸','guitar'],['🎧','headphones music'],['🎨','art paint'],['🏆','trophy win'],['🥇','gold medal'],['🎉','tada celebrate'],['🎁','gift'],
	['✈️','airplane travel'],['🚗','car'],['🚀','rocket ship launch'],['🏝️','island beach'],['🗺️','map'],['🏔️','mountain'],['🚲','bike'],['⛵','sailboat'],['🚁','helicopter'],['🌍','earth globe world'],['🧭','compass'],['🏕️','camping'],
	['💡','idea lightbulb'],['📱','phone'],['💻','laptop computer'],['⌨️','keyboard'],['🖥️','desktop'],['📷','camera'],['🔒','lock secure'],['🔑','key'],['📌','pin'],['📎','paperclip'],['✏️','pencil edit'],['📚','books'],['💰','money bag'],['⏰','alarm clock time'],['🔔','bell notification'],['🔦','flashlight'],
	['✅','check done complete'],['❌','cross wrong no'],['❓','question'],['❗','exclamation'],['⚠️','warning'],['♻️','recycle'],['🔴','red circle'],['🟢','green circle'],['🔵','blue circle'],['➕','plus add'],['➖','minus'],['✔️','check mark'],['💤','zzz sleep'],['🆗','ok button'],['🔝','top'],['🎵','music note']
].map(([char, name]) => ({ char, name }) as Emoji)

// tag each emoji with its category (buckets are contiguous, 24/16/16/16/16/16/12/16/16)
const BUCKETS = [24, 16, 16, 16, 16, 16, 12, 16, 16]
;(() => {
	let idx = 0
	BUCKETS.forEach((size, b) => {
		for (let k = 0; k < size && idx < DEFAULT_EMOJIS.length; k++, idx++)
			DEFAULT_EMOJIS[idx].cat = CATEGORIES[b].id
	})
})()

const styles = css`
	:host {
		display: block;
		width: 20rem;
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}
	.search {
		display: block;
		width: 100%;
		box-sizing: border-box;
		border: none;
		border-bottom: 1px solid var(--border);
		background: transparent;
		color: var(--foreground);
		font-family: inherit;
		font-size: 0.875rem;
		padding: 0.6rem 0.75rem;
		outline: none;
	}
	.search::placeholder {
		color: var(--muted-foreground);
	}
	.tabs {
		display: flex;
		gap: 0.125rem;
		padding: 0.25rem 0.375rem;
		border-bottom: 1px solid var(--border);
	}
	.tab {
		flex: 1;
		border: none;
		background: transparent;
		border-radius: var(--radius-sm);
		padding: 0.25rem 0;
		font-size: 1rem;
		cursor: pointer;
		opacity: 0.65;
		transition: background-color 0.12s ease, opacity 0.12s ease;
	}
	.tab:hover {
		background: color-mix(in oklch, var(--foreground) 8%, transparent);
	}
	.tab.is-active {
		opacity: 1;
		background: color-mix(in oklch, var(--foreground) 12%, transparent);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		gap: 0.125rem;
		padding: 0.375rem;
		max-height: 14rem;
		overflow-y: auto;
	}
	.emoji {
		border: none;
		background: transparent;
		border-radius: var(--radius-sm);
		font-size: 1.25rem;
		line-height: 1;
		padding: 0.3rem 0;
		cursor: pointer;
		transition: background-color 0.1s ease, transform 0.06s ease;
	}
	.emoji:hover {
		background: color-mix(in oklch, var(--foreground) 10%, transparent);
		transform: scale(1.15);
	}
	.empty {
		grid-column: 1 / -1;
		text-align: center;
		color: var(--muted-foreground);
		font-size: 0.8125rem;
		padding: 1.5rem 0;
	}
`

export const ZEmojiPicker = c(
	(props) => {
		const [cat, setCat] = useState(CATEGORIES[0].id)
		const [query, setQuery] = useState('')

		const all: Emoji[] = Array.isArray(props.emojis) ? (props.emojis as Emoji[]) : DEFAULT_EMOJIS
		const q = query.trim().toLowerCase()
		const shown = q
			? all.filter((e) => e.name.includes(q) || e.char === q)
			: all.filter((e) => e.cat === cat)

		return (
			<host shadowDom>
				<input
					class="search"
					type="text"
					placeholder="Search emoji…"
					value={query}
					oninput={(e: any) => setQuery(e.target.value)}
				/>
				{!q && (
					<div class="tabs" role="tablist">
						{CATEGORIES.map((c) => (
							<button
								key={c.id}
								class={c.id === cat ? 'tab is-active' : 'tab'}
								role="tab"
								aria-selected={c.id === cat ? 'true' : 'false'}
								aria-label={c.id}
								onclick={() => setCat(c.id)}
							>
								{c.icon}
							</button>
						))}
					</div>
				)}
				<div class="grid">
					{shown.length ? (
						shown.map((e) => (
							<button
								key={e.char}
								class="emoji"
								type="button"
								title={e.name}
								aria-label={e.name}
								onclick={() => props.select({ emoji: e.char })}
							>
								{e.char}
							</button>
						))
					) : (
						<div class="empty">No emoji found</div>
					)}
				</div>
			</host>
		)
	},
	{
		props: {
			emojis: { type: Array },
			select: event<{ emoji: string }>({ bubbles: true, composed: true })
		},
		styles: [themedScrollbarStyles, styles]
	}
)

customElements.define('z-emoji-picker', ZEmojiPicker)
