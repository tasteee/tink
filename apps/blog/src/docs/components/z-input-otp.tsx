import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZInputOtpDoc = () => (
	<ComponentDoc tag="z-input-otp" category="Forms" description="A fixed-length verification code input.">
		<div className="block">
			<div className="panel">
				<div className='field'>
					<label>Verification code</label>
					<z-input-otp length={6} isNumeric />
				</div>
			</div>
		</div>
	</ComponentDoc>
)
