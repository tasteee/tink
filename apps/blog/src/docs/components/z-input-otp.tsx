import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZInputOtpDoc = () => (
	<ComponentDoc
		tag="z-input-otp"
		category="Forms"
		description="A fixed-length verification-code field with paste support and completion detection. Use it only for short, segmented codes."
	>
		<DocExample
			demo="z-input-otp/request-a-numeric-verification-code"
			title="Request a numeric verification code"
			description="Set the expected length and numeric mode; paste fills consecutive cells."
		/>
		<DocExample
			demo="z-input-otp/submit-only-after-completion"
			title="Submit only after completion"
			description="The complete event avoids prematurely validating partial input."
		/>
	</ComponentDoc>
)
