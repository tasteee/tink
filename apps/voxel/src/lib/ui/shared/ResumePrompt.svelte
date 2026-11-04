<script lang="ts">
	import KeyCombo from './KeyCombo.svelte'
	import { keymap } from '../../state/keymap.svelte'
	import './ResumePrompt.css'
</script>

<div class="resume-prompt">
	<z-text size="xs" color="muted">Click to resume editing</z-text>
	<KeyCombo combo={keymap.toggleMouse} size="xs" />
</div>
