const spacingScaleMap: Record<number, string> = {
	0: '0',
	1: 'var(--space-xs)',
	2: 'var(--space-sm)',
	3: 'var(--space-md)',
	4: 'var(--space-base)',
	5: 'var(--space-lg)',
	6: 'var(--space-xl)',
	7: 'var(--space-2xl)',
	8: 'var(--space-3xl)'
}

const isPureNumber = (value: string): boolean => /^-?\d+$/.test(value)

const resolveSpacingValue = (value?: string): string | undefined => {
	if (value == null || value === '') return undefined
	if (!isPureNumber(value)) return value
	const n = Number(value)
	return spacingScaleMap[n] ?? `calc(var(--space-base) * ${n})`
}

const resolveLengthValue = (value?: string): string | undefined => {
	if (value == null || value === '') return undefined
	return isPureNumber(value) ? `${value}px` : value
}

const resolveGridTemplateValue = (value?: string): string | undefined => {
	if (value == null || value === '') return undefined
	return isPureNumber(value) ? `repeat(${value}, minmax(0, 1fr))` : value
}

export const boxBooleanProps = {
	isRow: { type: Boolean, reflect: true },
	isColumn: { type: Boolean, reflect: true },
	isFlex: { type: Boolean, reflect: true },
	isInlineFlex: { type: Boolean, reflect: true },
	isGrid: { type: Boolean, reflect: true },
	isInlineGrid: { type: Boolean, reflect: true },
	isBlock: { type: Boolean, reflect: true },
	isInlineBlock: { type: Boolean, reflect: true },
	isInline: { type: Boolean, reflect: true },
	doesWrap: { type: Boolean, reflect: true },
	doesWrapText: { type: Boolean, reflect: true },
	xStart: { type: Boolean, reflect: true },
	xCenter: { type: Boolean, reflect: true },
	xEnd: { type: Boolean, reflect: true },
	xBetween: { type: Boolean, reflect: true },
	xAround: { type: Boolean, reflect: true },
	xEvenly: { type: Boolean, reflect: true },
	xStretch: { type: Boolean, reflect: true },
	yStart: { type: Boolean, reflect: true },
	yCenter: { type: Boolean, reflect: true },
	yEnd: { type: Boolean, reflect: true },
	yBetween: { type: Boolean, reflect: true },
	yAround: { type: Boolean, reflect: true },
	yEvenly: { type: Boolean, reflect: true }
} as const

export const boxValueProps = {
	gap: String,
	rowGap: String,
	columnGap: String,
	margin: String,
	marginTop: String,
	marginRight: String,
	marginBottom: String,
	marginLeft: String,
	marginX: String,
	marginY: String,
	padding: String,
	paddingTop: String,
	paddingRight: String,
	paddingBottom: String,
	paddingLeft: String,
	paddingX: String,
	paddingY: String,
	width: String,
	minWidth: String,
	maxWidth: String,
	height: String,
	minHeight: String,
	maxHeight: String,
	columns: String,
	rows: String,
	smallColumns: String,
	mediumColumns: String,
	largeColumns: String,
	extraLargeColumns: String
} as const

export const boxProps = { ...boxBooleanProps, ...boxValueProps }

type BoxValuePropsT = { [K in keyof typeof boxValueProps]?: string }

export const getBoxHostStyle = (props: BoxValuePropsT): Record<string, string> => {
	const style: Record<string, string> = {}

	const set = (variable: string, value?: string) => {
		if (value !== undefined) style[variable] = value
	}

	set('--z-box-gap', resolveSpacingValue(props.gap))
	set('--z-box-row-gap', resolveSpacingValue(props.rowGap))
	set('--z-box-column-gap', resolveSpacingValue(props.columnGap))

	set('--z-box-margin', resolveSpacingValue(props.margin))
	set('--z-box-margin-top', resolveSpacingValue(props.marginTop))
	set('--z-box-margin-right', resolveSpacingValue(props.marginRight))
	set('--z-box-margin-bottom', resolveSpacingValue(props.marginBottom))
	set('--z-box-margin-left', resolveSpacingValue(props.marginLeft))

	const marginX = resolveSpacingValue(props.marginX)
	set('--z-box-margin-left', marginX)
	set('--z-box-margin-right', marginX)

	const marginY = resolveSpacingValue(props.marginY)
	set('--z-box-margin-top', marginY)
	set('--z-box-margin-bottom', marginY)

	set('--z-box-padding', resolveSpacingValue(props.padding))
	set('--z-box-padding-top', resolveSpacingValue(props.paddingTop))
	set('--z-box-padding-right', resolveSpacingValue(props.paddingRight))
	set('--z-box-padding-bottom', resolveSpacingValue(props.paddingBottom))
	set('--z-box-padding-left', resolveSpacingValue(props.paddingLeft))

	const paddingX = resolveSpacingValue(props.paddingX)
	set('--z-box-padding-left', paddingX)
	set('--z-box-padding-right', paddingX)

	const paddingY = resolveSpacingValue(props.paddingY)
	set('--z-box-padding-top', paddingY)
	set('--z-box-padding-bottom', paddingY)

	set('--z-box-width', resolveLengthValue(props.width))
	set('--z-box-min-width', resolveLengthValue(props.minWidth))
	set('--z-box-max-width', resolveLengthValue(props.maxWidth))
	set('--z-box-height', resolveLengthValue(props.height))
	set('--z-box-min-height', resolveLengthValue(props.minHeight))
	set('--z-box-max-height', resolveLengthValue(props.maxHeight))

	set('--z-box-grid-template-columns', resolveGridTemplateValue(props.columns))
	set('--z-box-grid-template-rows', resolveGridTemplateValue(props.rows))
	set('--z-box-small-grid-template-columns', resolveGridTemplateValue(props.smallColumns))
	set('--z-box-medium-grid-template-columns', resolveGridTemplateValue(props.mediumColumns))
	set('--z-box-large-grid-template-columns', resolveGridTemplateValue(props.largeColumns))
	set('--z-box-extra-large-grid-template-columns', resolveGridTemplateValue(props.extraLargeColumns))

	return style
}
