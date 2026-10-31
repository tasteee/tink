import type { ThreeEvent } from '@react-three/fiber'
import { TAP_SLOP_PIXELS } from '../game/constants'
import { ToolId } from '../game/catalog'
import { removeObject } from '../game/actions'
import { getFootprintCenter, getFootprintSize } from '../game/footprint'
import type { PlacedObjectT } from '../game/footprint'
import { $selectedObjectId, getActiveTool, useSelectedObjectId, useWorld } from '../game/store'
import { FLOOR_THICKNESS } from './Floors'
import { ObjectModel } from './models/registry'
import type { Vector3TupleT } from './models/parts'

const SELECTION_COLOR = '#9b7cf0'

// Stable per-object number so each tree sways out of step.
const getSeedFromId = (objectId: string): number => {
	const characterCodes = Array.from(objectId).map((character) => character.charCodeAt(0))
	const total = characterCodes.reduce((sum, code) => sum + code, 0)
	return (total % 97) / 7
}

type FootprintPadPropsT = {
	width: number
	depth: number
	color: string
	opacity: number
}

export const FootprintPad = (props: FootprintPadPropsT) => {
	const planeArgs: [number, number] = [props.width - 0.06, props.depth - 0.06]

	return (
		<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_THICKNESS + 0.01, 0]} raycast={() => null}>
			<planeGeometry args={planeArgs} />
			<meshBasicMaterial color={props.color} transparent opacity={props.opacity} depthWrite={false} />
		</mesh>
	)
}

const handleObjectClick = (event: ThreeEvent<MouseEvent>, objectId: string) => {
	const isDrag = event.delta > TAP_SLOP_PIXELS
	if (isDrag) return
	const tool = getActiveTool()

	const isLookTool = tool === ToolId.look
	if (isLookTool) {
		event.stopPropagation()
		$selectedObjectId.set(objectId)
		return
	}

	const isBulldozeTool = tool === ToolId.bulldoze
	if (!isBulldozeTool) return
	event.stopPropagation()
	removeObject(objectId)
}

type PlacedObjectViewPropsT = {
	placedObject: PlacedObjectT
	isSelected: boolean
}

const PlacedObjectView = (props: PlacedObjectViewPropsT) => {
	const placedObject = props.placedObject
	const center = getFootprintCenter(placedObject.defId, placedObject, placedObject.rotation)
	const size = getFootprintSize(placedObject.defId, placedObject.rotation)
	const position: Vector3TupleT = [center.x, FLOOR_THICKNESS, center.z]
	const modelRotation: Vector3TupleT = [0, -placedObject.rotation * (Math.PI / 2), 0]
	const seed = getSeedFromId(placedObject.id)
	const selectionPadOpacity = 0.55

	const handleClick = (event: ThreeEvent<MouseEvent>) => {
		handleObjectClick(event, placedObject.id)
	}

	return (
		<group position={position}>
			{props.isSelected && <FootprintPad width={size.width} depth={size.depth} color={SELECTION_COLOR} opacity={selectionPadOpacity} />}
			<group rotation={modelRotation} onClick={handleClick}>
				<ObjectModel defId={placedObject.defId} seed={seed} />
			</group>
		</group>
	)
}

export const PlacedObjects = () => {
	const world = useWorld()
	const selectedObjectId = useSelectedObjectId()

	const views = world.objects.map((placedObject) => {
		const isSelected = placedObject.id === selectedObjectId
		return <PlacedObjectView key={placedObject.id} placedObject={placedObject} isSelected={isSelected} />
	})

	return <group>{views}</group>
}
