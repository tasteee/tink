import type { ComponentType } from 'react'
import { BirchTree, Bush, CherryTree, FlowerBed, OakTree, PalmTree, PineTree } from './trees'
import type { ModelPropsT } from './trees'
import { Armchair, Bed, Bookshelf, Chair, DiningTable, FloorLamp, PottedPlant, Sofa } from './furniture'

const modelsByDefId: Record<string, ComponentType<ModelPropsT>> = {
	oakTree: OakTree,
	pineTree: PineTree,
	birchTree: BirchTree,
	palmTree: PalmTree,
	cherryTree: CherryTree,
	bush: Bush,
	flowers: FlowerBed,
	sofa: Sofa,
	armchair: Armchair,
	diningTable: DiningTable,
	chair: Chair,
	bed: Bed,
	bookshelf: Bookshelf,
	lamp: FloorLamp,
	pottedPlant: PottedPlant
}

type ObjectModelPropsT = {
	defId: string
	seed: number
}

export const ObjectModel = (props: ObjectModelPropsT) => {
	const Model = modelsByDefId[props.defId] ?? OakTree
	return <Model seed={props.seed} />
}
