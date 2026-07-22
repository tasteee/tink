import { FormDoc } from '@app/docs/FormDoc'

export const ZNumberInputDoc = () => <FormDoc tag="z-number-input" description="A numeric field with live validation, blur-time clamping, and optional ghost stepper buttons. It aligns with Zest controls at every size." examples={[
	{ title: 'Use bounds and a decimal step', description: 'step, min, and max are numeric properties. Decimal steps work naturally; typed values stay editable and clamp only when the field loses focus.', code: `<z-field label="Playback speed"><z-number-input value="1" min="0.5" max="2" step="0.25" has-stepper-buttons /></z-field>`, children: <z-field label="Playback speed"><z-number-input value={1} min={0.5} max={2} step={0.25} hasStepperButtons /></z-field> },
	{ title: 'Use the compact size beside small buttons', description: 'Small number inputs and small buttons are both 32px tall. The optional controls are ghost buttons within one outlined field.', code: `<z-row gap="2" align="center"><z-number-input size="small" label="Quantity" value="2" min="0" has-stepper-buttons is-inline /><z-button size="small">Add</z-button></z-row>`, children: <z-row gap="2" align="center"><z-number-input size="small" label="Quantity" value={2} min={0} hasStepperButtons isInline /><z-button size="small">Add</z-button></z-row> },
	{ title: 'Read live validity, commit corrected values', description: 'input fires on every keystroke, including invalid intermediate text. change fires after blur or a step action with the normalized numeric value.', code: `numberInput.addEventListener('input', (event) => { const { value, rawValue, isValid } = event.detail })\nnumberInput.addEventListener('change', (event) => save(event.detail.value))`, children: <z-field label="Seats" description="Try typing a value below 1 or above 20, then tab away."><z-number-input value={5} min={1} max={20} hasStepperButtons /></z-field> }
]} reference={[
	{ term: 'value / min / max / step', detail: 'Numeric properties and reflected attributes. Use a positive step; decimals such as 0.25 are supported.' },
	{ term: 'has-stepper-buttons', detail: 'Shows decrement and increment ghost buttons inside the shared outlined field.' },
	{ term: 'Sizing', detail: 'Uses a compact intrinsic width by default. Add is-full-width when a form layout should stretch it.' },
	{ term: 'input', detail: 'Bubbling detail is { value: number | null, rawValue: string, isValid: boolean } on every keystroke.' },
	{ term: 'change', detail: 'Bubbling detail is { value: number } after a blur correction or step action.' },
	{ term: 'Validation', detail: 'Invalid, non-numeric, and out-of-range input is styled as invalid while typing. Blur clamps numeric values to min/max and restores an invalid raw value.' },
	{ term: 'label', detail: 'Accessible name for compact use. Prefer z-field for a visible standalone label.' }
]} />
