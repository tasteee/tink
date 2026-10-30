import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

const starterSignals = [
	{ id: 'root', tone: 1, octave: 0, start: 0, duration: 0.5, velocity: 110, probability: 1, enabled: true },
	{ id: 'third', tone: 3, octave: 0, start: 0.5, duration: 0.5, velocity: 92, probability: 1, enabled: true },
	{ id: 'fifth', tone: 5, octave: 0, start: 1, duration: 1, velocity: 104, probability: 0.8, enabled: true }
]

export const ZPatternRollDoc = () => (
	<ComponentDoc tag="z-pattern-roll" category="Specialized" description="A chord-relative pattern editor. Signals use chord-tone degrees instead of absolute MIDI pitches, so one rhythmic shape can adapt to any chord.">
		<DocExample title="Start with chord-relative signals" description="tone is a one-based chord degree; start and duration are beats. Persist the signals returned by change as your application’s source of truth." code={`const roll = document.querySelector('z-pattern-roll')
roll.signals = [
  {
    id: 'root',
    tone: 1,
    octave: 0,
    start: 0,
    duration: 1,
    velocity: 110,
    probability: 1,
    enabled: true
  }
]
roll.addEventListener('change', (event) => save(event.detail.signals))`}>
			<z-pattern-roll signals={starterSignals} tones={8} length={4} chordSize={3} style={{ height: '19rem' }} />
		</DocExample>
		<DocExample title="Embed it in a focused composer" description="Hide the built-in toolbar or keyboard when the surrounding product provides equivalent controls. playhead is a beat position and does not change the pattern." code={`<z-pattern-roll
  signals={signals}
  tones="8"
  length="8"
  beats-per-bar="4"
  snap="0.25"
  playhead={currentBeat}
  hide-toolbar
/>`}>
			<z-pattern-roll signals={starterSignals} tones={8} length={8} beatsPerBar={4} snap={0.25} playhead={2.5} hideToolbar style={{ height: '16rem' }} />
		</DocExample>
	</ComponentDoc>
)
