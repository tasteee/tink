<script lang="ts">
	import CellBoxes from './CellBoxes.svelte'
	import { fromCellKey } from '../../model/cellKey'
	import { selection } from '../../state/editor.svelte'
	import { readTokenColor } from '../tokenColor'

	const selectionColor = readTokenColor('--accent')
	const selectedCells = $derived([...selection].map(fromCellKey))
</script>

<CellBoxes cells={selectedCells} color={selectionColor} opacity={0.35} scale={1.06} renderOrder={12} />
