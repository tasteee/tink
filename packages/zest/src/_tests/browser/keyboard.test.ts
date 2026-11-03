import { describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { deepActiveElement, flatContains, innerOf, mount, mountForm, settle } from './form-helpers'
import { expectNoA11yViolations } from './a11y-helpers'
import { toaster } from '../../components/z-toaster'

/*
 * One test per row of each core element's documented key map (the
 * `keyboard:` block on its doc page, or the Keyboard table in its markdown).
 * Keys are pressed for real through Playwright, so native behaviour — Space
 * on a checkbox, Escape on a <dialog> — is the platform's, not a simulation.
 * axe runs after each state the keys produce.
 */

const options = [
	{ value: 'apple', label: 'Apple' },
	{ value: 'banana', label: 'Banana' },
	{ value: 'cherry', label: 'Cherry', isDisabled: true },
	{ value: 'date', label: 'Date' }
]

// Polls a frame at a time until the check passes or a second runs out.
const waitUntil = async (check: () => boolean): Promise<void> => {
	const deadline = performance.now() + 1000
	const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
	for (const _attempt of Array.from({ length: 90 })) {
		const isDone = check() || performance.now() > deadline
		if (isDone) return
		await nextFrame()
	}
}

const focus = <T extends HTMLElement>(element: T): T => { element.focus(); return element }
// The focused element's text, falling back to its host's when it is the
// inner control of a Zest element whose label is slotted light DOM.
const activeText = () => {
	const active = deepActiveElement()
	const own = active?.textContent?.trim()
	if (own) return own
	const root = active?.getRootNode()
	return root instanceof ShadowRoot ? root.host.textContent?.trim() : own
}

describe('<z-button>', () => {
	it('Enter / Space — activates, and a submit button submits the form', async () => {
		const form = await mountForm('<z-input name="q" value="x"></z-input><z-button type="submit">Go</z-button>')
		let submitted = 0
		form.addEventListener('submit', (event) => { event.preventDefault(); submitted += 1 })
		focus(innerOf(form.querySelector('z-button')!, 'button'))
		await userEvent.keyboard('{Enter}')
		await userEvent.keyboard(' ')
		expect(submitted).toBe(2)
	})
})

describe('<z-button-group>', () => {
	it('Tab — moves through the buttons in order', async () => {
		const wrapper = await mount('<z-button-group><z-button>One</z-button><z-button>Two</z-button></z-button-group>')
		focus(innerOf(wrapper.querySelector('z-button')!, 'button'))
		await userEvent.keyboard('{Tab}')
		expect(activeText()).toBe('Two')
		await expectNoA11yViolations(wrapper)
	})
})

describe('<z-input>', () => {
	it('Enter — submits the owning form', async () => {
		const form = await mountForm('<z-input name="q" value="zest"></z-input>')
		let submitted = 0
		form.addEventListener('submit', (event) => { event.preventDefault(); submitted += 1 })
		focus(innerOf(form.querySelector('z-input')!, 'input'))
		await userEvent.keyboard('{Enter}')
		expect(submitted).toBe(1)
	})
})

describe('<z-textarea>', () => {
	it('Enter — inserts a line break and never submits', async () => {
		const form = await mountForm('<z-textarea name="notes"></z-textarea>')
		let submitted = 0
		form.addEventListener('submit', (event) => { event.preventDefault(); submitted += 1 })
		const textarea = focus(innerOf<HTMLTextAreaElement>(form.querySelector('z-textarea')!, 'textarea'))
		await userEvent.keyboard('a{Enter}b')
		expect(textarea.value).toBe('a\nb')
		expect(submitted).toBe(0)
	})
})

describe('<z-number-input>', () => {
	it('↑ / ↓ — step the value within min and max', async () => {
		const wrapper = await mount('<z-number-input name="n" value="4" min="0" max="5" step="1"></z-number-input>')
		const host = wrapper.querySelector<HTMLElement & { value?: number }>('z-number-input')!
		focus(innerOf(host, 'input'))
		await userEvent.keyboard('{ArrowUp}')
		await settle(wrapper)
		expect(host.value).toBe(5)
		await userEvent.keyboard('{ArrowUp}')
		await settle(wrapper)
		expect(host.value).toBe(5)
		await userEvent.keyboard('{ArrowDown}{ArrowDown}')
		await settle(wrapper)
		expect(host.value).toBe(3)
	})

	it('Enter — submits the owning form', async () => {
		const form = await mountForm('<z-number-input name="n" value="2"></z-number-input>')
		let submitted = 0
		form.addEventListener('submit', (event) => { event.preventDefault(); submitted += 1 })
		focus(innerOf(form.querySelector('z-number-input')!, 'input'))
		await userEvent.keyboard('{Enter}')
		expect(submitted).toBe(1)
	})
})

describe.each([['z-checkbox', 'checked'], ['z-switch', 'on']])('<%s>', (tag) => {
	it('Space — toggles', async () => {
		const wrapper = await mount(`<${tag} name="t">Label</${tag}>`)
		const host = wrapper.querySelector<HTMLElement & { isChecked?: boolean }>(tag)!
		focus(innerOf(host, 'input'))
		await userEvent.keyboard(' ')
		await settle(wrapper)
		expect(host.isChecked).toBe(true)
		await expectNoA11yViolations(wrapper)
		await userEvent.keyboard(' ')
		await settle(wrapper)
		expect(host.isChecked).toBe(false)
	})
})

describe('<z-radio-group>', () => {
	const markup = `<z-radio-group name="p" label="Plan"><z-radio value="a">A</z-radio><z-radio value="b">B</z-radio><z-radio value="c" is-disabled>C</z-radio><z-radio value="d">D</z-radio></z-radio-group>`
	const valueOf = (wrapper: HTMLElement) => wrapper.querySelector<HTMLElement & { value?: string }>('z-radio-group')!.value

	it('↓ / → — move selection and focus to the next enabled radio, wrapping', async () => {
		const wrapper = await mount(markup)
		focus(innerOf(wrapper.querySelector('z-radio')!, 'input'))
		await userEvent.keyboard('{ArrowDown}')
		await settle(wrapper)
		expect(valueOf(wrapper)).toBe('b')
		expect(deepActiveElement()).toBe(innerOf(wrapper.querySelectorAll('z-radio')[1] as HTMLElement, 'input'))
		await userEvent.keyboard('{ArrowRight}')
		await settle(wrapper)
		expect(valueOf(wrapper)).toBe('d')
		await userEvent.keyboard('{ArrowDown}')
		await settle(wrapper)
		expect(valueOf(wrapper)).toBe('a')
		await expectNoA11yViolations(wrapper)
	})

	it('↑ / ← — move selection and focus to the previous enabled radio, wrapping', async () => {
		const wrapper = await mount(markup)
		focus(innerOf(wrapper.querySelector('z-radio')!, 'input'))
		await userEvent.keyboard('{ArrowUp}')
		await settle(wrapper)
		expect(valueOf(wrapper)).toBe('d')
		await userEvent.keyboard('{ArrowLeft}')
		await settle(wrapper)
		expect(valueOf(wrapper)).toBe('b')
	})

	it('Space — selects the focused radio', async () => {
		const wrapper = await mount(markup)
		focus(innerOf(wrapper.querySelectorAll('z-radio')[1] as HTMLElement, 'input'))
		await userEvent.keyboard(' ')
		await settle(wrapper)
		expect(valueOf(wrapper)).toBe('b')
	})
})

describe('<z-select>', () => {
	const setup = async (value = '') => {
		const wrapper = await mount(`<z-select name="f" label="Fruit" ${value ? `value="${value}"` : ''}></z-select>`)
		const host = wrapper.querySelector<HTMLElement & { value?: string; options?: typeof options }>('z-select')!
		host.options = options
		await settle(wrapper)
		const trigger = focus(innerOf<HTMLButtonElement>(host, 'button.trigger'))
		return { wrapper, host, trigger }
	}
	const isOpen = (trigger: HTMLElement) => trigger.getAttribute('aria-expanded') === 'true'
	const activeLabel = (host: HTMLElement) => host.shadowRoot!.querySelector('.option.is-active')?.textContent?.trim()

	it('↓ / ↑ — open at the selected option, then move, wrapping and skipping disabled', async () => {
		const { wrapper, host, trigger } = await setup('banana')
		await userEvent.keyboard('{ArrowDown}')
		await settle(wrapper)
		expect(isOpen(trigger)).toBe(true)
		expect(activeLabel(host)).toBe('Banana')
		await expectNoA11yViolations(wrapper)
		await userEvent.keyboard('{ArrowDown}')
		await settle(wrapper)
		expect(activeLabel(host)).toBe('Date')
		await userEvent.keyboard('{ArrowDown}')
		await settle(wrapper)
		expect(activeLabel(host)).toBe('Apple')
		await userEvent.keyboard('{ArrowUp}')
		await settle(wrapper)
		expect(activeLabel(host)).toBe('Date')
	})

	it('Home / End — first and last enabled option', async () => {
		const { wrapper, host } = await setup('banana')
		await userEvent.keyboard('{ArrowDown}{End}')
		await settle(wrapper)
		expect(activeLabel(host)).toBe('Date')
		await userEvent.keyboard('{Home}')
		await settle(wrapper)
		expect(activeLabel(host)).toBe('Apple')
	})

	it('Enter / Space — open, then commit and return focus to the trigger', async () => {
		const { wrapper, host, trigger } = await setup()
		await userEvent.keyboard('{Enter}')
		await settle(wrapper)
		expect(isOpen(trigger)).toBe(true)
		await userEvent.keyboard('{ArrowDown}')
		await userEvent.keyboard(' ')
		await settle(wrapper)
		expect(isOpen(trigger)).toBe(false)
		expect(host.value).toBe('banana')
		expect(deepActiveElement()).toBe(trigger)
	})

	it('Esc — closes without changing the value', async () => {
		const { wrapper, host, trigger } = await setup('apple')
		await userEvent.keyboard('{ArrowDown}{ArrowDown}{Escape}')
		await settle(wrapper)
		expect(isOpen(trigger)).toBe(false)
		expect(host.value).toBe('apple')
	})

	it('Tab — closes and moves on', async () => {
		const wrapper = await mount('<z-select name="f" label="Fruit"></z-select><button id="after">After</button>')
		const host = wrapper.querySelector<HTMLElement & { options?: typeof options }>('z-select')!
		host.options = options
		await settle(wrapper)
		const trigger = focus(innerOf<HTMLButtonElement>(host, 'button.trigger'))
		await userEvent.keyboard('{ArrowDown}')
		await userEvent.keyboard('{Tab}')
		await settle(wrapper)
		expect(isOpen(trigger)).toBe(false)
		expect(document.activeElement?.id).toBe('after')
	})

	it('A–Z — type-ahead jumps to the next matching option', async () => {
		const { wrapper, host } = await setup()
		await userEvent.keyboard('d')
		await settle(wrapper)
		expect(activeLabel(host)).toBe('Date')
	})
})

describe('<z-combobox>', () => {
	const setup = async () => {
		const wrapper = await mount('<z-combobox name="f" label="Fruit"></z-combobox>')
		const host = wrapper.querySelector<HTMLElement & { value?: string; options?: typeof options }>('z-combobox')!
		host.options = options
		await settle(wrapper)
		const input = focus(innerOf<HTMLInputElement>(host, 'input'))
		return { wrapper, host, input }
	}
	const isOpen = (input: HTMLElement) => input.getAttribute('aria-expanded') === 'true'
	const visibleLabels = (host: HTMLElement) => [...host.shadowRoot!.querySelectorAll('.option')].map((el) => el.textContent?.trim())

	it('A–Z — filters the options and opens the list', async () => {
		const { wrapper, host, input } = await setup()
		await userEvent.keyboard('an')
		await settle(wrapper)
		expect(isOpen(input)).toBe(true)
		expect(visibleLabels(host)).toEqual(['Banana'])
		await expectNoA11yViolations(wrapper)
	})

	it('↓ / ↑ — open the list, then move, wrapping and skipping disabled', async () => {
		const { wrapper, host, input } = await setup()
		// Focus opened the list at the first option; the arrows move from there.
		expect(isOpen(input)).toBe(true)
		expect(host.shadowRoot!.querySelector('.option.is-active')?.textContent?.trim()).toBe('Apple')
		await userEvent.keyboard('{ArrowDown}')
		await settle(wrapper)
		expect(host.shadowRoot!.querySelector('.option.is-active')?.textContent?.trim()).toBe('Banana')
		await userEvent.keyboard('{ArrowDown}')
		await settle(wrapper)
		expect(host.shadowRoot!.querySelector('.option.is-active')?.textContent?.trim()).toBe('Date')
		await userEvent.keyboard('{ArrowDown}')
		await settle(wrapper)
		expect(host.shadowRoot!.querySelector('.option.is-active')?.textContent?.trim()).toBe('Apple')
		await userEvent.keyboard('{Escape}{ArrowUp}')
		await settle(wrapper)
		expect(isOpen(input)).toBe(true)
		expect(host.shadowRoot!.querySelector('.option.is-active')?.textContent?.trim()).toBe('Date')
	})

	it('Enter — commits the active option', async () => {
		const { wrapper, host } = await setup()
		await userEvent.keyboard('ban{Enter}')
		await settle(wrapper)
		expect(host.value).toBe('banana')
	})

	it('Esc / Tab — close the list and clear the search text', async () => {
		const wrapper = await mount('<z-combobox name="f" label="Fruit"></z-combobox><button id="after">After</button>')
		const host = wrapper.querySelector<HTMLElement & { options?: typeof options }>('z-combobox')!
		host.options = options
		await settle(wrapper)
		const input = focus(innerOf<HTMLInputElement>(host, 'input'))
		await userEvent.keyboard('ap{Escape}')
		await settle(wrapper)
		expect(isOpen(input)).toBe(false)
		expect(input.value).toBe('')
		await userEvent.keyboard('ap{Tab}')
		await settle(wrapper)
		expect(isOpen(input)).toBe(false)
		expect(document.activeElement?.id).toBe('after')
	})
})

describe('<z-field>', () => {
	it('Tab — reaches the slotted control; the field itself is skipped, and its label click focuses the control', async () => {
		const wrapper = await mount('<button id="before">Before</button><z-field label="Email"><z-input name="e"></z-input></z-field>')
		focus(wrapper.querySelector<HTMLElement>('#before')!)
		await userEvent.keyboard('{Tab}')
		const host = wrapper.querySelector<HTMLElement>('z-input')!
		expect(deepActiveElement()).toBe(innerOf(host, 'input'))
		host.blur()
		innerOf<HTMLElement>(wrapper.querySelector('z-field')!, '.label').click()
		expect(deepActiveElement()).toBe(innerOf(host, 'input'))
	})
})

describe('<z-dialog>', () => {
	const markup = '<z-dialog heading="Confirm"><z-button slot="trigger">Open</z-button><p>Body</p><z-button slot="footer">OK</z-button></z-dialog>'

	it('Enter / Space on the trigger — opens, and focus moves inside', async () => {
		const wrapper = await mount(markup)
		const host = wrapper.querySelector<HTMLElement & { isOpen?: boolean }>('z-dialog')!
		focus(innerOf(wrapper.querySelector('z-button')!, 'button'))
		await userEvent.keyboard('{Enter}')
		await settle(wrapper)
		expect(host.isOpen).toBe(true)
		expect(flatContains(innerOf<HTMLDialogElement>(host, 'dialog'), deepActiveElement())).toBe(true)
		await expectNoA11yViolations(wrapper)
	})

	it('Tab — cycles inside the dialog; the page behind is inert', async () => {
		const wrapper = await mount('<button id="outside">Outside</button>' + markup)
		const host = wrapper.querySelector<HTMLElement & { isOpen?: boolean }>('z-dialog')!
		host.isOpen = true
		await settle(wrapper)
		const dialog = innerOf<HTMLDialogElement>(host, 'dialog')
		for (let i = 0; i < 5; i += 1) {
			await userEvent.keyboard('{Tab}')
			expect(flatContains(dialog, deepActiveElement())).toBe(true)
		}
		for (let i = 0; i < 5; i += 1) {
			await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
			expect(flatContains(dialog, deepActiveElement())).toBe(true)
		}
	})

	it('Esc — closes and returns focus to what opened it', async () => {
		const wrapper = await mount(markup)
		const host = wrapper.querySelector<HTMLElement & { isOpen?: boolean }>('z-dialog')!
		const trigger = focus(innerOf(wrapper.querySelector('z-button')!, 'button'))
		await userEvent.keyboard('{Enter}')
		await settle(wrapper)
		await userEvent.keyboard('{Escape}')
		await settle(wrapper)
		expect(host.isOpen).toBe(false)
		expect(deepActiveElement()).toBe(trigger)
	})
})

describe('<z-popover>', () => {
	const markup = '<z-popover label="Details"><z-button slot="trigger">Open</z-button><p>Text</p><z-button>Inside</z-button></z-popover>'

	it('Enter / Space on the trigger — opens and moves focus into the panel', async () => {
		const wrapper = await mount(markup)
		const host = wrapper.querySelector<HTMLElement & { isOpen?: boolean }>('z-popover')!
		focus(innerOf(wrapper.querySelector('z-button')!, 'button'))
		await userEvent.keyboard('{Enter}')
		await settle(wrapper)
		expect(host.isOpen).toBe(true)
		expect(activeText()).toBe('Inside')
		await expectNoA11yViolations(wrapper)
	})

	it('Esc — closes and returns focus to the trigger', async () => {
		const wrapper = await mount(markup)
		const host = wrapper.querySelector<HTMLElement & { isOpen?: boolean }>('z-popover')!
		const trigger = focus(innerOf(wrapper.querySelector('z-button')!, 'button'))
		await userEvent.keyboard('{Enter}')
		await settle(wrapper)
		await userEvent.keyboard('{Escape}')
		await settle(wrapper)
		expect(host.isOpen).toBe(false)
		expect(deepActiveElement()).toBe(trigger)
	})
})

describe('<z-tooltip>', () => {
	const surface = (host: HTMLElement) => innerOf<HTMLElement>(host, '.surface')
	const isShown = (host: HTMLElement) => surface(host).matches(':popover-open')

	it('Tab — focusing the trigger shows it, leaving hides it', async () => {
		const wrapper = await mount('<button id="before">Before</button><z-tooltip content="Help" open-delay="0"><z-button>Save</z-button></z-tooltip>')
		const host = wrapper.querySelector<HTMLElement>('z-tooltip')!
		focus(wrapper.querySelector<HTMLElement>('#before')!)
		await userEvent.keyboard('{Tab}')
		await new Promise((resolve) => setTimeout(resolve, 30))
		await settle(wrapper)
		expect(isShown(host)).toBe(true)
		await expectNoA11yViolations(wrapper)
		await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
		await settle(wrapper)
		expect(isShown(host)).toBe(false)
	})

	it('Esc — hides it', async () => {
		const wrapper = await mount('<z-tooltip content="Help" open-delay="0"><z-button>Save</z-button></z-tooltip>')
		const host = wrapper.querySelector<HTMLElement>('z-tooltip')!
		focus(innerOf(wrapper.querySelector('z-button')!, 'button'))
		await new Promise((resolve) => setTimeout(resolve, 30))
		await settle(wrapper)
		expect(isShown(host)).toBe(true)
		await userEvent.keyboard('{Escape}')
		await settle(wrapper)
		expect(isShown(host)).toBe(false)
	})
})

describe('<z-menu>', () => {
	const items = [
		{ value: 'new', label: 'New' },
		{ value: 'open', label: 'Open' },
		{ isSeparator: true },
		{ value: 'delete', label: 'Delete', isDisabled: true },
		{ value: 'duplicate', label: 'Duplicate' }
	]
	const setup = async () => {
		const wrapper = await mount('<z-menu><z-button slot="trigger">File</z-button></z-menu><button id="after">After</button>')
		const host = wrapper.querySelector<HTMLElement & { items?: typeof items }>('z-menu')!
		host.items = items
		await settle(wrapper)
		const trigger = focus(innerOf<HTMLButtonElement>(wrapper.querySelector('z-button')!, 'button'))
		return { wrapper, host, trigger }
	}
	const isOpen = (host: HTMLElement) => Boolean(host.shadowRoot!.querySelector('[role="menu"]'))

	it('↓ / Enter / Space on the trigger — opens and focuses the first item', async () => {
		for (const key of ['{ArrowDown}', '{Enter}', ' ']) {
			const { wrapper, host } = await setup()
			await userEvent.keyboard(key)
			await settle(wrapper)
			expect(isOpen(host)).toBe(true)
			expect(activeText()).toBe('New')
			await expectNoA11yViolations(wrapper)
			wrapper.remove()
		}
	})

	it('↑ on the trigger — opens and focuses the last item', async () => {
		const { wrapper } = await setup()
		await userEvent.keyboard('{ArrowUp}')
		await settle(wrapper)
		expect(activeText()).toBe('Duplicate')
	})

	it('↓ / ↑ — move focus, wrapping and skipping separators and disabled items', async () => {
		const { wrapper } = await setup()
		await userEvent.keyboard('{ArrowDown}{ArrowDown}')
		await settle(wrapper)
		expect(activeText()).toBe('Open')
		await userEvent.keyboard('{ArrowDown}')
		await settle(wrapper)
		expect(activeText()).toBe('Duplicate')
		await userEvent.keyboard('{ArrowDown}')
		await settle(wrapper)
		expect(activeText()).toBe('New')
		await userEvent.keyboard('{ArrowUp}')
		await settle(wrapper)
		expect(activeText()).toBe('Duplicate')
	})

	it('Home / End — first and last item', async () => {
		const { wrapper } = await setup()
		await userEvent.keyboard('{ArrowDown}{End}')
		await settle(wrapper)
		expect(activeText()).toBe('Duplicate')
		await userEvent.keyboard('{Home}')
		await settle(wrapper)
		expect(activeText()).toBe('New')
	})

	it('A–Z — type-ahead jumps to the next matching item', async () => {
		const { wrapper } = await setup()
		await userEvent.keyboard('{ArrowDown}d')
		await settle(wrapper)
		expect(activeText()).toBe('Duplicate')
	})

	it('Enter / Space — pick, close, and return focus to the trigger', async () => {
		const { wrapper, host, trigger } = await setup()
		const picked: string[] = []
		host.addEventListener('select', (event) => picked.push((event as CustomEvent<{ value: string }>).detail.value))
		await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')
		// A pick double-flashes the row before it fires select and closes.
		await waitUntil(() => picked.length > 0)
		await settle(wrapper)
		expect(picked).toEqual(['open'])
		expect(isOpen(host)).toBe(false)
		expect(deepActiveElement()).toBe(trigger)
	})

	it('Esc — closes and returns focus to the trigger', async () => {
		const { wrapper, host, trigger } = await setup()
		await userEvent.keyboard('{ArrowDown}{Escape}')
		await settle(wrapper)
		expect(isOpen(host)).toBe(false)
		expect(deepActiveElement()).toBe(trigger)
	})

	it('Tab — closes and moves on', async () => {
		const { wrapper, host } = await setup()
		await userEvent.keyboard('{ArrowDown}{Tab}')
		await settle(wrapper)
		expect(isOpen(host)).toBe(false)
		expect(document.activeElement?.id).toBe('after')
	})
})

describe('<z-tabs>', () => {
	const tabs = [
		{ value: 'a', label: 'Alpha' },
		{ value: 'b', label: 'Beta', isDisabled: true },
		{ value: 'c', label: 'Gamma' }
	]
	const setup = async (dir = 'ltr') => {
		const wrapper = await mount(`<div dir="${dir}"><z-tabs label="Sections"><div slot="a">Alpha panel</div><div slot="b">Beta panel</div><div slot="c">Gamma panel</div></z-tabs></div>`)
		const host = wrapper.querySelector<HTMLElement & { value?: string; tabs?: typeof tabs }>('z-tabs')!
		host.tabs = tabs
		await settle(wrapper)
		focus(innerOf<HTMLButtonElement>(host, '[role="tab"]'))
		return { wrapper, host }
	}

	it('→ / ← — move to the next or previous enabled tab and activate it, wrapping', async () => {
		const { wrapper, host } = await setup()
		await userEvent.keyboard('{ArrowRight}')
		await settle(wrapper)
		expect(host.value).toBe('c')
		expect(activeText()).toBe('Gamma')
		await expectNoA11yViolations(wrapper)
		await userEvent.keyboard('{ArrowRight}')
		await settle(wrapper)
		expect(host.value).toBe('a')
		await userEvent.keyboard('{ArrowLeft}')
		await settle(wrapper)
		expect(host.value).toBe('c')
	})

	it('→ / ← — swap in a right-to-left context', async () => {
		const { wrapper, host } = await setup('rtl')
		await userEvent.keyboard('{ArrowLeft}')
		await settle(wrapper)
		expect(host.value).toBe('c')
		await userEvent.keyboard('{ArrowRight}')
		await settle(wrapper)
		expect(host.value).toBe('a')
	})

	it('Home / End — first and last enabled tab', async () => {
		const { wrapper, host } = await setup()
		await userEvent.keyboard('{End}')
		await settle(wrapper)
		expect(host.value).toBe('c')
		await userEvent.keyboard('{Home}')
		await settle(wrapper)
		expect(host.value).toBe('a')
	})

	it('Tab — from the active tab, moves into its panel', async () => {
		const { wrapper } = await setup()
		await userEvent.keyboard('{Tab}')
		await settle(wrapper)
		expect(deepActiveElement()?.getAttribute('role')).toBe('tabpanel')
	})
})

describe('<z-table>', () => {
	const columns = [{ key: 'name', label: 'Name' }, { key: 'qty', label: 'Qty' }]
	const rows = [{ id: 1, name: 'Olives', qty: 3 }, { id: 2, name: 'Basil', qty: 1 }]

	it('Tab — reaches each clickable row; Enter / Space fire rowclick', async () => {
		const wrapper = await mount('<button id="before">Before</button><z-table is-clickable></z-table>')
		const host = wrapper.querySelector<HTMLElement & { columns?: unknown; rows?: unknown }>('z-table')!
		host.columns = columns
		host.rows = rows
		await settle(wrapper)
		const clicked: number[] = []
		host.addEventListener('rowclick', (event) => clicked.push((event as CustomEvent<{ index: number }>).detail.index))

		focus(wrapper.querySelector<HTMLElement>('#before')!)
		await userEvent.keyboard('{Tab}')
		expect(deepActiveElement()?.textContent).toContain('Olives')
		await userEvent.keyboard('{Enter}')
		await userEvent.keyboard('{Tab}')
		await userEvent.keyboard(' ')
		expect(clicked).toEqual([0, 1])
		await expectNoA11yViolations(wrapper)
	})

	it('rows stay out of the tab order without is-clickable', async () => {
		const wrapper = await mount('<button id="before">Before</button><z-table></z-table><button id="after">After</button>')
		const host = wrapper.querySelector<HTMLElement & { columns?: unknown; rows?: unknown }>('z-table')!
		host.columns = columns
		host.rows = rows
		await settle(wrapper)
		focus(wrapper.querySelector<HTMLElement>('#before')!)
		await userEvent.keyboard('{Tab}')
		expect(document.activeElement?.id).toBe('after')
	})
})

describe('<z-table-toolbar>', () => {
	it('Tab — reaches each action button while open; Enter / Space fire action', async () => {
		const wrapper = await mount('<button id="before">Before</button><z-table-toolbar is-open></z-table-toolbar>')
		const host = wrapper.querySelector<HTMLElement & { items?: unknown; anchorRect?: unknown }>('z-table-toolbar')!
		host.anchorRect = { x: 100, y: 100, width: 200, height: 40 }
		host.items = [{ value: 'insert-row', label: 'Insert row' }, { value: 'delete-row', label: 'Delete row' }]
		await settle(wrapper)
		const fired: string[] = []
		host.addEventListener('action', (event) => fired.push((event as CustomEvent<{ value: string }>).detail.value))
		focus(wrapper.querySelector<HTMLElement>('#before')!)
		await userEvent.keyboard('{Tab}')
		await userEvent.keyboard('{Enter}')
		await userEvent.keyboard('{Tab}')
		await userEvent.keyboard(' ')
		expect(fired).toEqual(['insert-row', 'delete-row'])
	})
})

describe('<z-toaster>', () => {
	it('Tab — reaches each dismiss button; Enter / Space remove that toast', async () => {
		const wrapper = await mount('<button id="before">Before</button><z-toaster></z-toaster>')
		const host = wrapper.querySelector<HTMLElement>('z-toaster')!
		toaster.show({ title: 'First', duration: 0 })
		toaster.show({ title: 'Second', duration: 0 })
		await settle(wrapper)
		await expectNoA11yViolations(wrapper)
		focus(wrapper.querySelector<HTMLElement>('#before')!)
		await userEvent.keyboard('{Tab}')
		await userEvent.keyboard('{Enter}')
		await settle(wrapper)
		expect([...host.shadowRoot!.querySelectorAll('.title')].map((el) => el.textContent)).toEqual(['Second'])
		await userEvent.keyboard('{Tab}')
		await userEvent.keyboard(' ')
		await settle(wrapper)
		expect(host.shadowRoot!.querySelectorAll('.toast')).toHaveLength(0)
		toaster.clear()
	})
})

describe('<z-alert>', () => {
	it('Tab — reaches the dismiss button; Enter / Space hide the alert', async () => {
		const wrapper = await mount('<button id="before">Before</button><z-alert tone="warning" heading="Heads up" is-dismissable>Body</z-alert>')
		const host = wrapper.querySelector<HTMLElement & { isHidden?: boolean }>('z-alert')!
		await expectNoA11yViolations(wrapper)
		focus(wrapper.querySelector<HTMLElement>('#before')!)
		await userEvent.keyboard('{Tab}')
		expect(deepActiveElement()?.getAttribute('aria-label')).toBe('Dismiss')
		await userEvent.keyboard('{Enter}')
		await settle(wrapper)
		expect(host.isHidden).toBe(true)
	})
})
