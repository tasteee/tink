import { c, css } from 'atomico'
import { resolveRadius } from '../shared/layout-schema'

/*
 * z-progressive-blur — wraps slotted content (an image, a card, a hero
 * panel) and fades a blur in from one edge, strongest right at the edge and
 * clear a `reach`% in. `backdrop-filter: blur()` can't itself vary in
 * strength across an element, so this stacks several full-coverage layers —
 * each with its own blur amount and its own linear-gradient mask — and lets
 * them overlap: layers with a wide mask carry the least blur, layers with a
 * narrow mask (concentrated at the edge) carry the most, so the edge itself
 * sits under every layer at once (max blur) while the interior only falls
 * under the widest, lightest layer, tapering to none.
 */
const LAYER_COUNT = 8

const STRENGTH_PX: Record<string, number> = {
	sm: 12,
	md: 24,
	lg: 40,
	xl: 64
}

const GRADIENT_DIRECTION: Record<string, string> = {
	top: 'to bottom',
	bottom: 'to top',
	left: 'to right',
	right: 'to left'
}

const buildLayers = (direction: string, maxBlur: number, reach: number) => {
	const gradientDirection = GRADIENT_DIRECTION[direction] || GRADIENT_DIRECTION.bottom
	return Array.from({ length: LAYER_COUNT }, (_, index) => {
		const bandWidth = reach * ((LAYER_COUNT - index) / LAYER_COUNT)
		const blur = maxBlur * ((index + 1) / LAYER_COUNT)
		const mask = `linear-gradient(${gradientDirection}, black, transparent ${bandWidth}%)`
		return { blur, mask }
	})
}

const styles = css`
	:host {
		display: block;
		position: relative;
	}

	:host([is-hidden]) {
		display: none;
	}

	.wrap {
		position: relative;
		overflow: hidden;
		border-radius: var(--pb-radius, 0);
		height: 100%;
	}

	.layers {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.layer {
		position: absolute;
		inset: 0;
	}
`

export const ZProgressiveBlur = c(
	(props) => {
		const maxBlur = STRENGTH_PX[props.strength || 'md'] || STRENGTH_PX.md
		const reach = props.reach || 40
		const direction = props.direction || 'bottom'
		const layers = buildLayers(direction, maxBlur, reach)
		const radius = resolveRadius(props.radius)

		return (
			<host shadowDom style={radius ? { '--pb-radius': radius } : {}}>
				<div class="wrap">
					<slot />
					<div class="layers" aria-hidden="true">
						{layers.map((layer, index) => (
							<div
								key={index}
								class="layer"
								style={{
									backdropFilter: `blur(${layer.blur}px)`,
									webkitBackdropFilter: `blur(${layer.blur}px)`,
									maskImage: layer.mask,
									webkitMaskImage: layer.mask
								}}
							/>
						))}
					</div>
				</div>
			</host>
		)
	},
	{
		props: {
			direction: { type: String, reflect: true },
			strength: { type: String, reflect: true },
			reach: Number,
			radius: String,
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-progressive-blur', ZProgressiveBlur)
