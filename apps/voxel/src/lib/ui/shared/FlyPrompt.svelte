<script lang="ts">
	import KeyCombo from './KeyCombo.svelte'
	import { keymap } from '../../state/keymap.svelte'
	import './FlyPrompt.css'

	type FlyPromptPropsT = {
		heading: string
	}

	let props: FlyPromptPropsT = $props()

	const moveCombo = $derived(`${keymap.moveForward}+${keymap.moveLeft}+${keymap.moveBack}+${keymap.moveRight}`)
</script>

<div class="fly-prompt">
	<z-text size="lg" weight={600}>{props.heading}</z-text>
	<z-text size="sm" color="muted">Click anywhere to fly</z-text>
	<div class="fly-prompt-keys">
		<span class="fly-prompt-key"><KeyCombo combo={moveCombo} /> move</span>
		<span class="fly-prompt-key"><KeyCombo combo={keymap.flyUp} /> <KeyCombo combo={keymap.flyDown} /> up / down</span>
		<span class="fly-prompt-key"><KeyCombo combo={keymap.interact} /> menu</span>
		<span class="fly-prompt-key"><KeyCombo combo={keymap.toggleMouse} /> free the mouse</span>
	</div>
</div>
