import { useRef } from 'react'
import type { ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

// Tiny building blocks for the low-poly models. Every part
// casts and receives shadows and uses flat shading so faces
// read as crisp facets.

export type Vector3TupleT = [number, number, number]

type BlockPropsT = {
	size: Vector3TupleT
	position?: Vector3TupleT
	rotation?: Vector3TupleT
	color: string
	roughness?: number
}

export const Block = (props: BlockPropsT) => {
	const roughness = props.roughness ?? 0.8

	return (
		<mesh position={props.position} rotation={props.rotation} castShadow receiveShadow>
			<boxGeometry args={props.size} />
			<meshStandardMaterial color={props.color} roughness={roughness} flatShading />
		</mesh>
	)
}

type BallPropsT = {
	radius: number
	position?: Vector3TupleT
	scale?: Vector3TupleT
	color: string
	detail?: number
}

export const Ball = (props: BallPropsT) => {
	const detail = props.detail ?? 0

	return (
		<mesh position={props.position} scale={props.scale} castShadow receiveShadow>
			<icosahedronGeometry args={[props.radius, detail]} />
			<meshStandardMaterial color={props.color} roughness={0.9} flatShading />
		</mesh>
	)
}

type CylinderPropsT = {
	radiusTop: number
	radiusBottom: number
	height: number
	position?: Vector3TupleT
	rotation?: Vector3TupleT
	color: string
	segments?: number
	emissive?: string
	emissiveIntensity?: number
}

export const Cylinder = (props: CylinderPropsT) => {
	const segments = props.segments ?? 7
	const emissive = props.emissive ?? '#000000'
	const emissiveIntensity = props.emissiveIntensity ?? 0
	const geometryArgs: [number, number, number, number] = [props.radiusTop, props.radiusBottom, props.height, segments]

	return (
		<mesh position={props.position} rotation={props.rotation} castShadow receiveShadow>
			<cylinderGeometry args={geometryArgs} />
			<meshStandardMaterial color={props.color} roughness={0.85} flatShading emissive={emissive} emissiveIntensity={emissiveIntensity} />
		</mesh>
	)
}

type ConePropsT = {
	radius: number
	height: number
	position?: Vector3TupleT
	rotation?: Vector3TupleT
	color: string
	segments?: number
}

export const Cone = (props: ConePropsT) => {
	const segments = props.segments ?? 7
	const geometryArgs: [number, number, number] = [props.radius, props.height, segments]

	return (
		<mesh position={props.position} rotation={props.rotation} castShadow receiveShadow>
			<coneGeometry args={geometryArgs} />
			<meshStandardMaterial color={props.color} roughness={0.9} flatShading />
		</mesh>
	)
}

type SwayPropsT = {
	children: ReactNode
	amount?: number
	speed?: number
	phase?: number
}

// Gentle wind on foliage, pivoting from the group origin.
export const Sway = (props: SwayPropsT) => {
	const groupRef = useRef<Group>(null)
	const amount = props.amount ?? 0.025
	const speed = props.speed ?? 1.3
	const phase = props.phase ?? 0

	useFrame((state) => {
		const group = groupRef.current
		if (group === null) return
		const time = state.clock.elapsedTime * speed + phase
		group.rotation.z = Math.sin(time) * amount
		group.rotation.x = Math.cos(time * 0.8) * amount * 0.6
	})

	return <group ref={groupRef}>{props.children}</group>
}
