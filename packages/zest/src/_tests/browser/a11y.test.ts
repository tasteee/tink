import { describe, it } from 'vitest'
import { mountForm, settle } from './form-helpers'
import { expectNoA11yViolations } from './a11y-helpers'

/*
 * The core form controls, audited by axe in their resting, labelled state.
 * This is the floor, not the ceiling: Phase 2 runs axe after every state
 * change in each control's own tests. A violation here is a bug, not a
 * baseline to tune around.
 */

const controls: Array<[string, string]> = [
	['z-button', '<z-button>Save</z-button>'],
	['z-input', '<z-input name="email" label="Email"></z-input>'],
	['z-textarea', '<z-textarea name="notes" label="Notes"></z-textarea>'],
	['z-number-input', '<z-number-input name="qty" label="Quantity" value="1"></z-number-input>'],
	['z-checkbox', '<z-checkbox name="terms" value="yes">I agree</z-checkbox>'],
	['z-switch', '<z-switch name="dark">Dark mode</z-switch>'],
	['z-radio-group', '<z-radio-group name="plan" label="Plan"><z-radio value="a">Free</z-radio><z-radio value="b">Pro</z-radio></z-radio-group>'],
	['z-select', '<z-select name="fruit" label="Fruit"></z-select>'],
	['z-combobox', '<z-combobox name="city" label="City"></z-combobox>']
]

describe('core controls pass axe at rest', () => {
	it.each(controls)('<%s>', async (_tag, markup) => {
		const form = await mountForm(markup)
		await settle(form)
		await expectNoA11yViolations(form)
	})
})
