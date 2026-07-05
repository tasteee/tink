import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZStreamingTextDoc = () => (
	<ComponentDoc
		tag="z-streaming-text"
		category="Chat"
		description="Reveals assistant text with a trailing cursor. Live mode: append to content + set is-streaming. Typewriter mode: set typewriter and it reveals content at speed (chars/sec). Set markdown to render through z-markdown. Feeds z-message-text in AI chat."
	>
		<div className="block">
			<h3>Typewriter</h3>
			<div className="panel">
				<z-streaming-text typewriter speed={50} content="Hello! I'm typing this out one token at a time, with a blinking cursor at the end…" />
			</div>
		</div>

		<div className="block">
			<h3>Streaming (static content + cursor)</h3>
			<div className="panel">
				<z-streaming-text is-streaming content="Generating a response" />
			</div>
		</div>

		<div className="block">
			<h3>Markdown typewriter</h3>
			<div className="panel">
				<z-streaming-text typewriter markdown speed={60} content={"Here's a **plan**:\n\n1. Parse the input\n2. Call the tool\n3. Return `result`"} />
			</div>
		</div>
	</ComponentDoc>
)
