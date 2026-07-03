import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZLinkDoc = () => (
	<ComponentDoc
		tag="z-link"
		category="Actions"
		description="Animated underline, accent tones, external-link and disabled states."
	>
		<div className="block">
			<div className="panel">
				<div className='row' style={{ gap: '2rem' }}>
					<z-link href='#' tone='primary'>Purple link</z-link>
					<z-link href='#' tone='secondary'>Pink link</z-link>
					<z-link href='#' tone='neutral'>Neutral link</z-link>
					<z-link href='#' tone='primary' underline='always'>Always underlined</z-link>
					<z-link href='#' tone='primary' isExternal>External ↗</z-link>
					<z-link tone='primary' isDisabled>Disabled</z-link>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
