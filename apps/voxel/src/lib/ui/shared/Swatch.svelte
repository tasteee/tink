<script lang="ts">
	import './Swatch.css'

	type SwatchPropsT = {
		color: string
		isSelected?: boolean
		size?: 'small' | 'medium'
		label?: string
		onselect: () => void
		oncontext?: () => void
	}

	let props: SwatchPropsT = $props()

	const sizeClass = $derived(props.size === 'medium' ? 'isMedium' : 'isSmall')
	const selectedClass = $derived(props.isSelected ? 'isSelected' : '')
	const swatchClass = $derived(`swatch ${sizeClass} ${selectedClass}`)
	const ariaLabel = $derived(props.label ?? props.color)

	const handleContextMenu = (mouseEvent: MouseEvent): void => {
		if (!props.oncontext) return
		mouseEvent.preventDefault()
		props.oncontext()
	}
</script>

<!-- The color is data, so it is the one inline style here. -->
<button type="button" class={swatchClass} style:--swatch-color={props.color} aria-label={ariaLabel} title={ariaLabel} onclick={props.onselect} oncontextmenu={handleContextMenu}></button>
