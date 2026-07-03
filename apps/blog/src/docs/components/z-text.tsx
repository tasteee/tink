import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZTextDoc = () => (
	<ComponentDoc
		tag="z-text"
		category="Foundations"
		description="DM Sans body copy — size, color intent, weight, and style modifiers (italic/underline/strikethrough)."
	>
		<div className="block">
			<div className="block-title">
				<h3>&lt;z-text&gt;</h3>
				<span className="desc">size · color · weight · style</span>
			</div>
			<div className="panel">
				<z-box isFlex isColumn gap="4">
					<z-text size="lg">
						Body copy stays calm and legible. White is reserved for hierarchy — headlines and CTAs — while supporting
						text rests in a softer gray.
					</z-text>
					<z-text size="md" color="muted">
						Muted supporting copy for secondary detail and captions.
					</z-text>
					<z-box isFlex isRow gap="3" doesWrap>
						<z-text color="primary" weight="lg">
							Purple accent
						</z-text>
						<z-text color="secondary" weight="lg">
							Pink accent
						</z-text>
						<z-text isItalic>Italic</z-text>
						<z-text isUnderlined>Underlined</z-text>
						<z-text isStrikethrough color="muted">
							Strikethrough
						</z-text>
					</z-box>
				</z-box>
			</div>
		</div>
	</ComponentDoc>
)
