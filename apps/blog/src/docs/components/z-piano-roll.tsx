import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

const starterNotes = [{ id: 1, pitch: 60, start: 0, duration: 1, velocity: 100 }, { id: 2, pitch: 64, start: 1, duration: 1, velocity: 96 }, { id: 3, pitch: 67, start: 2, duration: 2, velocity: 108 }]

export const ZPianoRollDoc = () => {
	return <ComponentDoc tag="z-piano-roll" category="Specialized" description="A self-contained MIDI editor for note placement, selection, movement, resize, snapping, scale highlighting, and keyboard-first editing.">
		<DocExample title="Start with controlled notes" description="Store notes in your application and replace them from the change event." code={`const roll = document.querySelector('z-piano-roll')
roll.notes = [
  { id: 1, pitch: 60, start: 0, duration: 1, velocity: 100 },
  { id: 2, pitch: 64, start: 1, duration: 1, velocity: 96 }
]
roll.addEventListener('change', (event) => saveNotes(event.detail.notes))`}>
			<z-piano-roll notes={starterNotes} bars={2} scale="major" root={0} />
		</DocExample>
		<DocExample title="Authoring and zoom gestures" description="Choose Draw from the toolbar, then drag to create notes. The sticky keyboard and timing ruler are direct zoom controls: drag up to zoom out and down to zoom in." code={`// Select: drag a note to move it; drag an edge to resize.
// Draw: click-drag on empty space to write a note.
// Keyboard: Delete, Cmd/Ctrl+D, Cmd/Ctrl+A, arrows, Shift+arrows, Escape.
// Drag the piano keys up/down for vertical zoom.
// Drag the top timing ruler up/down for horizontal zoom.

<z-piano-roll snap="0.25" mode="draw" />`}>
			<z-column gap="2"><z-text>Try the toolbar: switch to <strong>Draw</strong>, make a note, then return to <strong>Select</strong> to move or resize it.</z-text><z-text color="muted" size="sm">Drag the left keyboard vertically to change row height, or drag the top ruler vertically to change beat width. Right-click deletes a note.</z-text></z-column>
		</DocExample>
		<DocExample title="Embed it in a focused editor" description="Hide the built-in controls when your product already supplies transport and edit controls." code={`<z-piano-roll
  notes={notes}
  bars="8"
  beats-per-bar="4"
  snap="0.25"
  root="9"
  scale="minor"
  playhead={currentBeat}
  hide-toolbar
/>`}>
			<z-piano-roll notes={starterNotes} bars={4} root={9} scale="minor" playhead={2.25} hideToolbar style={{ height: '17rem' }} />
		</DocExample>
		<DocExample title="Use the imperative editing API" description="These methods make toolbar buttons, undo stacks, and shortcuts easy to layer on top." code={`roll.setNotes(nextNotes)
roll.selectAll()
roll.duplicateSelection()
roll.deleteSelection()
const selectedIds = roll.getSelection()
const currentNotes = roll.getNotes()`}>
			<z-text color="muted">The <code>select</code> event reports the selected IDs. The <code>change</code> event is the source of truth for committed note edits.</z-text>
		</DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">Key props</z-heading><dl><dt>notes</dt><dd>Array of <code>{'{ id, pitch, start, duration, velocity }'}</code>; pitch is MIDI 0–127 and time is in beats.</dd><dt>bars / beats-per-bar / snap</dt><dd>Configure the timeline and edit quantization.</dd><dt>scale / root / fold</dt><dd>Highlight a scale and optionally fold to used or scale pitches.</dd><dt>playhead</dt><dd>Beat position for the non-editing playback cursor.</dd><dt>hide-toolbar / hide-keyboard</dt><dd>Use when surrounding product UI supplies those controls.</dd></dl></section>
	</ComponentDoc>
}
