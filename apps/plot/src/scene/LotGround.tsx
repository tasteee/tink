import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { BufferGeometry, Float32BufferAttribute } from 'three'
import { HALF_LOT, LOT_SIZE, TAP_SLOP_PIXELS } from '../game/constants'
import { ToolId } from '../game/catalog'
import { $stroke, getActiveTool, StrokeKind, useTool } from '../game/store'
import { cancelStroke, checkIsDrawingTool, finishStroke, handleGroundTap, hideHover, startStroke, updateHover, updateStroke } from '../game/interaction'

const buildGridGeometry = (): BufferGeometry => {
	const lineIndexes = Array.from({ length: LOT_SIZE + 1 }, (_unused, index) => index)
	const positions: number[] = []

	for (const lineIndex of lineIndexes) {
		const offset = lineIndex - HALF_LOT
		positions.push(offset, 0, -HALF_LOT, offset, 0, HALF_LOT)
		positions.push(-HALF_LOT, 0, offset, HALF_LOT, 0, offset)
	}

	const geometry = new BufferGeometry()
	geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
	return geometry
}

const checkIsStrokeActive = (): boolean => {
	return $stroke.state.kind !== StrokeKind.none
}

// A second finger means the player is pinching or turning the
// camera, so any half-drawn stroke is dropped, not committed.
const useStrokeGuards = () => {
	const domElement = useThree((state) => state.gl.domElement)

	useEffect(() => {
		const activePointerIds = new Set<number>()

		const handlePointerDown = (event: PointerEvent) => {
			activePointerIds.add(event.pointerId)
			const isMultiTouch = activePointerIds.size > 1
			if (isMultiTouch) cancelStroke()
		}

		const handlePointerEnd = (event: PointerEvent) => {
			activePointerIds.delete(event.pointerId)
		}

		const handleWindowPointerUp = () => {
			const isStrokeActive = checkIsStrokeActive()
			if (isStrokeActive) finishStroke()
		}

		domElement.addEventListener('pointerdown', handlePointerDown)
		window.addEventListener('pointerup', handlePointerEnd)
		window.addEventListener('pointercancel', handlePointerEnd)
		window.addEventListener('pointerup', handleWindowPointerUp)
		window.addEventListener('pointercancel', cancelStroke)

		return () => {
			domElement.removeEventListener('pointerdown', handlePointerDown)
			window.removeEventListener('pointerup', handlePointerEnd)
			window.removeEventListener('pointercancel', handlePointerEnd)
			window.removeEventListener('pointerup', handleWindowPointerUp)
			window.removeEventListener('pointercancel', cancelStroke)
		}
	}, [domElement])
}

const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
	const isDrawingTool = checkIsDrawingTool(getActiveTool())
	if (!isDrawingTool) return
	const isMainButton = event.nativeEvent.button === 0
	if (!isMainButton) return
	startStroke(event.point.x, event.point.z)
}

const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
	const isStrokeActive = checkIsStrokeActive()
	if (isStrokeActive) {
		updateStroke(event.point.x, event.point.z)
		return
	}

	const isMouse = event.nativeEvent.pointerType === 'mouse'
	if (!isMouse) return
	updateHover(event.point.x, event.point.z)
}

const handleClick = (event: ThreeEvent<MouseEvent>) => {
	const isDrag = event.delta > TAP_SLOP_PIXELS
	if (isDrag) return
	const isDrawingTool = checkIsDrawingTool(getActiveTool())
	if (isDrawingTool) return
	handleGroundTap(event.point.x, event.point.z)
}

export const LotGround = () => {
	const tool = useTool()
	const gridGeometry = useMemo(buildGridGeometry, [])
	const isGridVisible = tool !== ToolId.look
	const gridOpacity = isGridVisible ? 0.28 : 0.08
	useStrokeGuards()

	return (
		<group>
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
				<planeGeometry args={[LOT_SIZE, LOT_SIZE]} />
				<meshStandardMaterial color="#79ad55" roughness={1} />
			</mesh>
			<lineSegments geometry={gridGeometry} position={[0, 0.012, 0]}>
				<lineBasicMaterial color="#ffffff" transparent opacity={gridOpacity} depthWrite={false} />
			</lineSegments>
			<mesh
				rotation={[-Math.PI / 2, 0, 0]}
				position={[0, 0.001, 0]}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerLeave={hideHover}
				onClick={handleClick}
			>
				<planeGeometry args={[160, 160]} />
				<meshBasicMaterial transparent opacity={0} depthWrite={false} />
			</mesh>
		</group>
	)
}
