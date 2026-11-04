export type PresetPaletteT = {
	id: string
	name: string
	colors: string[]
}

export const PRESET_PALETTES: PresetPaletteT[] = [
	{
		id: 'soft-earth',
		name: 'Soft Earth',
		colors: ['#f2f0e5', '#b8b5b9', '#868188', '#646365', '#45444f', '#3a3858', '#212123', '#352b42', '#43436a', '#4b80ca', '#68c2d3', '#a2dcc7', '#ede19e', '#d3a068', '#b45252', '#6a536e', '#4b4158', '#80493a', '#a77b5b', '#e5ceb4', '#c2d368', '#8ab060', '#567b79', '#4e584a', '#7b7243', '#b2b47e', '#edc8c4', '#cf8acb', '#5f556a']
	},
	{
		id: 'spectrum',
		name: 'Spectrum',
		colors: ['#000000', '#3d3d3d', '#868686', '#ffffff', '#500000', '#9e0000', '#e22323', '#ff8383', '#591a00', '#b93d00', '#fa9239', '#ffd07e', '#756a00', '#cfbf25', '#ffef54', '#fff8b0', '#004a28', '#00a03a', '#31f733', '#b0ff74', '#003766', '#1d93cd', '#2bdbf1', '#89f2ff', '#0e0041', '#200097', '#5731e6', '#9376ff', '#450071', '#a216c8', '#e337e9', '#fb92ff']
	},
	{
		id: 'sunset-pop',
		name: 'Sunset Pop',
		colors: ['#ffffff', '#fb6b1d', '#e83b3b', '#831c5d', '#c32454', '#f04f78', '#f68181', '#fca790', '#e3c896', '#ab947a', '#966c6c', '#625565', '#3e3546', '#0b5e65', '#0b8a8f', '#1ebc73', '#91db69', '#fbff86', '#fbb954', '#cd683d', '#9e4539', '#7a3045', '#6b3e75', '#905ea9', '#a884f3', '#eaaded', '#8fd3ff', '#4d9be6', '#4d65b4', '#484a77', '#30e1b9', '#8ff8e2']
	},
	{
		id: 'berry-meadow',
		name: 'Berry Meadow',
		colors: ['#5ba675', '#6bc96c', '#abdd64', '#fcef8d', '#ffb879', '#ea6262', '#cc425e', '#a32858', '#751756', '#390947', '#611851', '#873555', '#a6555f', '#c97373', '#f2ae99', '#ffc3f2', '#ee8fcb', '#d46eb3', '#873e84', '#1f102a', '#4a3052', '#7b5480', '#a6859f', '#d9bdc8', '#ffffff', '#aee2ff', '#8db7ff', '#6d80fa', '#8465ec', '#834dc4', '#7d2da0', '#4e187c']
	},
	{
		id: 'twilight',
		name: 'Twilight',
		colors: ['#5e315b', '#8c3f5d', '#ba6156', '#f2a65e', '#ffe478', '#cfff70', '#8fde5d', '#3ca370', '#3d6e70', '#323e4f', '#322947', '#473b78', '#4b5bab', '#4da6ff', '#66ffe3', '#ffffeb', '#c2c2d1', '#7e7e8f', '#606070', '#43434f', '#272736', '#3e2347', '#57294b', '#964253', '#e36956', '#ffb570', '#ff9166', '#eb564b', '#b0305c', '#73275c', '#422445', '#5a265e', '#80366b', '#bd4882', '#ff6b97', '#ffb5b5']
	}
]
