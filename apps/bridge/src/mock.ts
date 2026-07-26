// Mocked data for the Bridge prototypes. No backend, no network.
// A "bridge" is an AI-mediated conversation between two engineers who
// speak different first languages. You talk to the AI in your own words;
// it conveys your intent — unambiguous, idiom-free — to the other side.

export type PartyT = {
	name: string
	role: string
	region: string
	language: string
	initials: string
}

export const you: PartyT = {
	name: "Shane",
	role: "Staff Engineer",
	region: "Austin, US",
	language: "English",
	initials: "SC",
}

export const them: PartyT = {
	name: "Rahul Iyer",
	role: "Principal Engineer",
	region: "Bengaluru, IN",
	language: "Hindi / English",
	initials: "RI",
}

export const topic = {
	title: "CLI tooling for the deploy pipeline",
	stakes: "Blocks Q3 platform migration · ~$4.2M throughput",
}

export type TurnT = {
	id: number
	author: "you" | "them"
	said: string // raw, as typed/sent
	meant: string // AI-bridged: intent-preserving, no idiom
	coach: string // AI's private note to you
	clarity: "clear" | "clarified" | "ambiguous"
}

export const turns: TurnT[] = [
	{
		id: 1,
		author: "you",
		said: "we should just build a CLI tool for this, the UI approach is gonna bite us later",
		meant:
			"I recommend we build a command-line tool for this workflow instead of a graphical interface. My concern is that the UI approach will create maintenance problems for us down the line.",
		coach:
			"“bite us later” is idiomatic and would translate literally. I rephrased it as a concrete future-maintenance risk.",
		clarity: "clear",
	},
	{
		id: 2,
		author: "them",
		said: "Sir, UI only is better for team na, CLI many people not comfortable. We can do the needful in UI itself no?",
		meant:
			"Rahul's position: a UI fits the team better because several engineers aren't comfortable on the command line. He's asking whether the same outcome can be achieved within a UI instead.",
		coach:
			"“do the needful” means “accomplish what's required,” not a demand. “Sir” is ordinary professional politeness — no need to mirror it. His real concern is team CLI-comfort, not a technical objection.",
		clarity: "clarified",
	},
	{
		id: 3,
		author: "you",
		said: "ok fair. what if the CLI wraps the same core and we ship a thin UI on top for the folks who want it",
		meant:
			"That's a fair point. Proposal: build the CLI around a shared core library, then ship a lightweight UI on top of that same core for engineers who prefer it. One engine, two interfaces — so we don't duplicate logic.",
		coach:
			"I made the shared-core architecture explicit — that's the part that resolves his team-comfort concern while keeping your maintenance win. Likely the agreement point.",
		clarity: "clear",
	},
	{
		id: 4,
		author: "them",
		said: "Yes yes this is very good. Shared core we can maintain easily. I will make the design doc and share by EOD IST.",
		meant:
			"Rahul agrees and is enthusiastic. He confirms the shared-core approach is maintainable and commits to writing the design document, sharing it by end of day India time (~1:30 PM Austin).",
		coach:
			"Agreement reached. “Yes yes” is genuine enthusiasm, not impatience. EOD IST ≈ 1:30 PM your time. Want me to log this as a decision?",
		clarity: "clarified",
	},
]

export const draft = {
	raw: "sounds good, lets sync tomorrow to nail down the interface boundary",
	bridged:
		"Sounds good. Let's schedule a short sync tomorrow to finalize the boundary between the CLI and the shared core — specifically which responsibilities live in the core versus the interface layer.",
	notes: [
		"“nail down” → “finalize” (idiom removed)",
		"Made “interface boundary” concrete so scope is unambiguous.",
	],
}

export const glossary = [
	{ term: "shared core", note: "one engine both the CLI and UI call" },
	{ term: "EOD IST", note: "end of day India ≈ 1:30 PM Austin" },
	{ term: "do the needful", note: "“do what's required” — not a demand" },
]

export const starters = [
	"Draft my reply",
	"What did he actually mean?",
	"Make this more direct",
	"Flag any ambiguity",
]

// --- Studio route ---------------------------------------------------------
// The main area is you working with the AI: you tell it what you want to
// convey; it proposes a send-ready message you approve. author: "you" | "ai".
export type AiMessageT = {
	id: number
	author: "you" | "ai"
	text: string
	proposal?: string // when present, AI is offering a ready-to-send message
}

export const aiThread: AiMessageT[] = [
	{
		id: 1,
		author: "you",
		text: "Rahul pushed back on the CLI idea. How do I keep it without steamrolling him?",
	},
	{
		id: 2,
		author: "ai",
		text: "He isn't objecting on technical grounds — his real worry is that some teammates aren't comfortable on the command line. Acknowledge that directly, then offer the shared-core idea so both a CLI and a UI can exist. Want me to draft it?",
	},
	{ id: 3, author: "you", text: "yeah draft it, keep it warm but concrete" },
	{
		id: 4,
		author: "ai",
		text: "Here's a version that lands your point and answers his concern:",
		proposal:
			"That's a fair point — thanks for raising it. Let's build the CLI around a shared core library, then ship a lightweight UI on top of that same core for anyone who prefers it. One engine, two interfaces, so we keep things maintainable without leaving anyone behind.",
	},
]

// Per-message analysis shown in the slide-out panel (keyed by chat turn id).
export const analysis: Record<number, { original: string; meaning: string; notes: string; tags: string[] }> = {
	2: {
		original: "Sir, UI only is better for team na, CLI many people not comfortable. We can do the needful in UI itself no?",
		meaning:
			"A UI fits the team better because several engineers aren't comfortable on the command line. He's asking whether the same outcome can be achieved within a UI instead.",
		notes:
			"“do the needful” = “accomplish what's required,” not a demand. “Sir” is ordinary professional politeness — no deference implied. The trailing “na/no?” softens it into a genuine question, not a challenge.",
		tags: ["idiom", "politeness register", "question softener"],
	},
	4: {
		original: "Yes yes this is very good. Shared core we can maintain easily. I will make the design doc and share by EOD IST.",
		meaning:
			"Genuine agreement and enthusiasm. He confirms the shared-core approach is maintainable and commits to writing the design doc, sharing it by end of day India time.",
		notes:
			"“Yes yes” reads as real enthusiasm, not impatience. “EOD IST” ≈ 1:30 PM Austin — worth confirming the handoff window.",
		tags: ["enthusiasm", "commitment", "timezone"],
	},
}
