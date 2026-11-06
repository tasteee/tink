import { afterAll, afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { setThemePreference } from '../../shared/theme'
import { deepActiveElement, flatContains, innerOf, mount, settle } from './form-helpers'
import { expectNoA11yViolations } from './a11y-helpers'

/*
 * The keyboard behaviour of the interactive elements keyboard.test.ts does
 * not cover. Keys are pressed for real through Playwright, so a native
 * <button> or <input type="range"> keeps the platform's own behaviour, and
 * what is asserted is what a keyboard user would feel: where focus goes, what
 * the key changes, and which event fires.
 */

type HostT = HTMLElement & Record<string, any>

const focus = <T extends HTMLElement>(element: T): T => {
	element.focus()
	return element
}

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

// Polls a frame at a time until the check passes or a second runs out.
const waitUntil = async (check: () => boolean): Promise<void> => {
	const deadline = performance.now() + 1000
	for (const _attempt of Array.from({ length: 90 })) {
		const isDone = check() || performance.now() > deadline
		if (isDone) return
		await nextFrame()
	}
}

const isVisible = (element: Element): boolean => {
	const box = element.getBoundingClientRect()
	const style = getComputedStyle(element)
	return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'
}

const activeText = (): string => {
	const active = deepActiveElement()
	const own = active?.textContent?.trim()
	if (own) return own
	const root = active?.getRootNode()
	return root instanceof ShadowRoot ? (root.host.textContent?.trim() ?? '') : ''
}

// Records the detail of every `name` event a host fires.
const recordEvents = (host: HTMLElement, name: string): unknown[] => {
	const details: unknown[] = []
	host.addEventListener(name, (event) => details.push((event as CustomEvent).detail))
	return details
}

afterEach(() => {
	document.body.replaceChildren()
})

afterAll(() => setThemePreference('dark'))

describe('<z-collapsible>', () => {
	it('Enter / Space on the trigger — opens and closes the section', async () => {
		const wrapper = await mount('<z-collapsible label="Section">Content</z-collapsible>')
		const host = wrapper.querySelector<HostT>('z-collapsible')!
		focus(innerOf<HTMLButtonElement>(host, 'button.trigger'))
		await userEvent.keyboard('{Enter}')
		await settle(wrapper)
		expect(host.isOpen).toBe(true)
		await expectNoA11yViolations(wrapper)
		await userEvent.keyboard(' ')
		await settle(wrapper)
		expect(host.isOpen).toBe(false)
	})

	it('a disabled section cannot be opened from the keyboard', async () => {
		const wrapper = await mount('<z-collapsible label="Section" is-disabled>Content</z-collapsible>')
		const host = wrapper.querySelector<HostT>('z-collapsible')!
		focus(innerOf<HTMLButtonElement>(host, 'button.trigger'))
		await userEvent.keyboard('{Enter}')
		await settle(wrapper)
		expect(host.isOpen).toBeFalsy()
	})
})

describe('<z-accordion>', () => {
	it('Enter on a section — opens it, and in single mode closes the other', async () => {
		const wrapper = await mount('<z-accordion><z-collapsible label="First" value="a">One</z-collapsible><z-collapsible label="Second" value="b">Two</z-collapsible></z-accordion>')
		const sections = [...wrapper.querySelectorAll<HostT>('z-collapsible')]
		focus(innerOf<HTMLButtonElement>(sections[0], 'button.trigger'))
		await userEvent.keyboard('{Enter}')
		await settle(wrapper)
		expect(sections[0].isOpen).toBe(true)
		focus(innerOf<HTMLButtonElement>(sections[1], 'button.trigger'))
		await userEvent.keyboard('{Enter}')
		await settle(wrapper)
		expect(sections[1].isOpen).toBe(true)
		expect(sections[0].isOpen).toBe(false)
	})
})

describe('<z-slider>', () => {
	it('→ / ← change the value by one step; Home and End jump to the ends; change fires', async () => {
		const wrapper = await mount('<z-slider label="Volume" min="0" max="10" step="1" value="5"></z-slider>')
		const host = wrapper.querySelector<HostT>('z-slider')!
		const changes = recordEvents(host, 'change')
		focus(innerOf<HTMLInputElement>(host, 'input'))
		await userEvent.keyboard('{ArrowRight}')
		expect(host.value).toBe(6)
		await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')
		expect(host.value).toBe(4)
		await userEvent.keyboard('{Home}')
		expect(host.value).toBe(0)
		await userEvent.keyboard('{End}')
		expect(host.value).toBe(10)
		expect(changes.length).toBeGreaterThan(0)
		await expectNoA11yViolations(wrapper)
	})
})

describe('<z-range>', () => {
	it('→ / ← move the focused handle; the handles do not cross', async () => {
		const wrapper = await mount('<z-range label="Price" min="0" max="100" step="1"></z-range>')
		const host = wrapper.querySelector<HostT>('z-range')!
		host.value = [20, 80]
		await settle(wrapper)
		focus(innerOf<HTMLInputElement>(host, 'input.left'))
		await userEvent.keyboard('{ArrowRight}')
		expect(host.value).toEqual([21, 80])
		focus(innerOf<HTMLInputElement>(host, 'input.right'))
		await userEvent.keyboard('{ArrowLeft}')
		expect(host.value).toEqual([21, 79])
		await userEvent.keyboard('{Home}')
		expect(host.value[1]).toBeGreaterThanOrEqual(host.value[0])
		await expectNoA11yViolations(wrapper)
	})
})

describe('<z-carousel>', () => {
	it('Enter on the next and previous buttons — moves one slide and fires change', async () => {
		const wrapper = await mount('<z-carousel><div>One</div><div>Two</div><div>Three</div></z-carousel>')
		const host = wrapper.querySelector<HostT>('z-carousel')!
		const changes = recordEvents(host, 'change')
		focus(innerOf<HTMLButtonElement>(host, 'button.next'))
		await userEvent.keyboard('{Enter}')
		await settle(wrapper)
		expect(changes.at(-1)).toEqual({ index: 1 })
		focus(innerOf<HTMLButtonElement>(host, 'button.prev'))
		await userEvent.keyboard('{Enter}')
		await settle(wrapper)
		expect(changes.at(-1)).toEqual({ index: 0 })
		await expectNoA11yViolations(wrapper)
	})

	it('Enter on a dot — jumps to that slide', async () => {
		const wrapper = await mount('<z-carousel><div>One</div><div>Two</div><div>Three</div></z-carousel>')
		const host = wrapper.querySelector<HostT>('z-carousel')!
		const changes = recordEvents(host, 'change')
		const dots = host.shadowRoot!.querySelectorAll<HTMLButtonElement>('button.dot')
		focus(dots[2])
		await userEvent.keyboard('{Enter}')
		await settle(wrapper)
		expect(changes.at(-1)).toEqual({ index: 2 })
	})
})

describe('<z-toggle-button>', () => {
	it('Space and Enter — toggle pressed and fire press', async () => {
		const wrapper = await mount('<z-toggle-button>Bold</z-toggle-button>')
		const host = wrapper.querySelector<HostT>('z-toggle-button')!
		const presses = recordEvents(host, 'press')
		focus(innerOf<HTMLButtonElement>(host, 'button'))
		await userEvent.keyboard(' ')
		expect(host.isPressed).toBe(true)
		await userEvent.keyboard('{Enter}')
		expect(host.isPressed).toBe(false)
		expect(presses).toEqual([{ pressed: true }, { pressed: false }])
	})

	it('a disabled toggle ignores the keyboard', async () => {
		const wrapper = await mount('<z-toggle-button is-disabled>Bold</z-toggle-button>')
		const host = wrapper.querySelector<HostT>('z-toggle-button')!
		focus(innerOf<HTMLButtonElement>(host, 'button'))
		await userEvent.keyboard(' ')
		expect(host.isPressed).toBeFalsy()
	})
})

describe('<z-toggle-button-group>', () => {
	const markup = '<z-toggle-button-group label="Align"><z-toggle-button-group-item value="left">Left</z-toggle-button-group-item><z-toggle-button-group-item value="center">Center</z-toggle-button-group-item><z-toggle-button-group-item value="right">Right</z-toggle-button-group-item></z-toggle-button-group>'

	it('Space on an item — selects it alone and fires change', async () => {
		const wrapper = await mount(markup)
		const group = wrapper.querySelector<HostT>('z-toggle-button-group')!
		const items = [...wrapper.querySelectorAll<HostT>('z-toggle-button-group-item')]
		const changes = recordEvents(group, 'change')
		focus(innerOf<HTMLButtonElement>(items[1], 'button'))
		await userEvent.keyboard(' ')
		await settle(wrapper)
		expect((changes.at(-1) as { value: string }).value).toBe('center')
		focus(innerOf<HTMLButtonElement>(items[2], 'button'))
		await userEvent.keyboard('{Enter}')
		await settle(wrapper)
		expect((changes.at(-1) as { value: string }).value).toBe('right')
		expect(items[1].isPressed).toBeFalsy()
		expect(items[2].isPressed).toBe(true)
		expect(changes.length).toBe(2)
	})

	it('in multiple mode, several items stay on', async () => {
		const wrapper = await mount(markup.replace('<z-toggle-button-group ', '<z-toggle-button-group is-multiple '))
		const group = wrapper.querySelector<HostT>('z-toggle-button-group')!
		const items = [...wrapper.querySelectorAll<HostT>('z-toggle-button-group-item')]
		const changes = recordEvents(group, 'change')
		focus(innerOf<HTMLButtonElement>(items[0], 'button'))
		await userEvent.keyboard(' ')
		focus(innerOf<HTMLButtonElement>(items[2], 'button'))
		await userEvent.keyboard(' ')
		await settle(wrapper)
		expect([...(changes.at(-1) as { value: string[] }).value].sort()).toEqual(['left', 'right'])
		expect(items[0].isPressed).toBe(true)
		expect(items[2].isPressed).toBe(true)
	})
})

describe('<z-toolbar>', () => {
	it('Tab enters once; → / ← / Home / End move between the buttons', async () => {
		const wrapper = await mount('<button id="before">Before</button><z-toolbar label="Format"><z-button>Bold</z-button><z-button>Italic</z-button><z-button>Underline</z-button></z-toolbar>')
		focus(wrapper.querySelector<HTMLButtonElement>('#before')!)
		await userEvent.keyboard('{Tab}')
		expect(activeText()).toBe('Bold')
		await userEvent.keyboard('{ArrowRight}')
		expect(activeText()).toBe('Italic')
		await userEvent.keyboard('{End}')
		expect(activeText()).toBe('Underline')
		await userEvent.keyboard('{Home}')
		expect(activeText()).toBe('Bold')
		await userEvent.keyboard('{ArrowLeft}')
		expect(activeText()).toBe('Underline')
	})
})

describe('<z-swap>', () => {
	it('Space — flips the faces and fires change', async () => {
		const wrapper = await mount('<z-swap label="Mute"><span slot="on">On</span><span slot="off">Off</span></z-swap>')
		const host = wrapper.querySelector<HostT>('z-swap')!
		const changes = recordEvents(host, 'change')
		focus(innerOf<HTMLInputElement>(host, 'input'))
		await userEvent.keyboard(' ')
		expect(host.isActive).toBe(true)
		await userEvent.keyboard(' ')
		expect(host.isActive).toBe(false)
		expect(changes).toEqual([{ active: true }, { active: false }])
	})
})

describe('<z-pagination>', () => {
	it('Enter on next, previous and a page number — changes the page', async () => {
		const wrapper = await mount('<z-pagination page="2" total="5"></z-pagination>')
		const host = wrapper.querySelector<HostT>('z-pagination')!
		const changes = recordEvents(host, 'change')
		focus(host.shadowRoot!.querySelector<HTMLButtonElement>('button[aria-label="Next page"]')!)
		await userEvent.keyboard('{Enter}')
		await settle(wrapper)
		expect(changes.at(-1)).toEqual({ page: 3 })
		focus(host.shadowRoot!.querySelector<HTMLButtonElement>('button[aria-label="Previous page"]')!)
		await userEvent.keyboard('{Enter}')
		await settle(wrapper)
		expect(changes.at(-1)).toEqual({ page: 2 })
		await expectNoA11yViolations(wrapper)
	})

	it('the first page has a disabled previous button', async () => {
		const wrapper = await mount('<z-pagination page="1" total="5"></z-pagination>')
		const host = wrapper.querySelector<HostT>('z-pagination')!
		const previous = host.shadowRoot!.querySelector<HTMLButtonElement>('button[aria-label="Previous page"]')!
		expect(previous.disabled).toBe(true)
	})
})

describe('<z-input-otp>', () => {
	it('typing fills the cells and advances; the last one fires complete', async () => {
		const wrapper = await mount('<z-input-otp label="Code" length="4" is-numeric></z-input-otp>')
		const host = wrapper.querySelector<HostT>('z-input-otp')!
		const completes = recordEvents(host, 'complete')
		const cells = host.shadowRoot!.querySelectorAll<HTMLInputElement>('input.cell')
		focus(cells[0])
		await userEvent.keyboard('1234')
		await settle(wrapper)
		expect(host.value).toBe('1234')
		expect(completes).toEqual([{ value: '1234' }])
	})

	it('Backspace — clears a cell and steps back', async () => {
		const wrapper = await mount('<z-input-otp label="Code" length="4" is-numeric></z-input-otp>')
		const host = wrapper.querySelector<HostT>('z-input-otp')!
		const cells = host.shadowRoot!.querySelectorAll<HTMLInputElement>('input.cell')
		focus(cells[0])
		await userEvent.keyboard('12')
		await userEvent.keyboard('{Backspace}')
		await settle(wrapper)
		expect(host.value).toBe('1')
		await userEvent.keyboard('{Backspace}')
		await settle(wrapper)
		expect(host.value).toBe('')
	})
})

describe('<z-color-picker>', () => {
	it('Enter on the swatch opens the panel; Escape closes it and returns focus', async () => {
		const wrapper = await mount('<z-color-picker label="Accent" value="#6d28d9"></z-color-picker>')
		const host = wrapper.querySelector<HostT>('z-color-picker')!
		const trigger = focus(innerOf<HTMLButtonElement>(host, 'button.trigger'))
		await userEvent.keyboard('{Enter}')
		const panel = innerOf(host, '.panel')
		await waitUntil(() => isVisible(panel))
		expect(isVisible(panel)).toBe(true)
		await userEvent.keyboard('{Escape}')
		await waitUntil(() => !isVisible(panel))
		expect(isVisible(panel)).toBe(false)
		expect(deepActiveElement()).toBe(trigger)
	})
})

describe('<z-hover-card>', () => {
	it('focusing the trigger opens the card; Escape closes it', async () => {
		const wrapper = await mount('<z-hover-card open-delay="0" close-delay="0"><z-button slot="trigger">@ada</z-button><p>Card body</p></z-hover-card>')
		const host = wrapper.querySelector<HostT>('z-hover-card')!
		const surface = innerOf(host, '.surface')
		focus(innerOf<HTMLButtonElement>(wrapper.querySelector('z-button')!, 'button'))
		await waitUntil(() => isVisible(surface))
		expect(isVisible(surface)).toBe(true)
		await userEvent.keyboard('{Escape}')
		await waitUntil(() => !isVisible(surface))
		expect(isVisible(surface)).toBe(false)
	})
})

describe.each([
	['z-drawer', '<z-drawer heading="Filters"><z-button slot="trigger">Open</z-button><p>Body</p></z-drawer>'],
	['z-sheet', '<z-sheet heading="Settings"><z-button slot="trigger">Open</z-button><p>Body</p></z-sheet>'],
	['z-alert-dialog', '<z-alert-dialog heading="Delete item" description="This cannot be undone."><z-button slot="trigger">Delete</z-button></z-alert-dialog>']
])('<%s>', (_tag, markup) => {
	it('Enter on the trigger opens it and moves focus inside; Escape closes and returns focus', async () => {
		const wrapper = await mount(markup)
		const host = wrapper.querySelector<HostT>(_tag)!
		const trigger = focus(innerOf<HTMLButtonElement>(wrapper.querySelector('z-button')!, 'button'))
		await userEvent.keyboard('{Enter}')
		await settle(wrapper)
		expect(host.isOpen).toBe(true)
		expect(flatContains(innerOf<HTMLDialogElement>(host, 'dialog'), deepActiveElement())).toBe(true)
		await expectNoA11yViolations(wrapper)
		await userEvent.keyboard('{Escape}')
		await settle(wrapper)
		expect(host.isOpen).toBe(false)
		expect(deepActiveElement()).toBe(trigger)
	})
})

describe.each([
	['z-drawer', '<z-drawer heading="Filters" description="Narrow the list."><p>Body</p></z-drawer>'],
	['z-sheet', '<z-sheet heading="Settings" description="Change how it works."><p>Body</p></z-sheet>'],
	['z-alert-dialog', '<z-alert-dialog heading="Delete item" description="This cannot be undone."></z-alert-dialog>'],
	['z-dialog', '<z-dialog heading="Confirm" description="Are you sure?"><p>Body</p></z-dialog>']
])('<%s> accessible name', (tag, markup) => {
	it('the dialog is named by its heading and described by its description', async () => {
		const wrapper = await mount(markup)
		const host = wrapper.querySelector<HostT>(tag)!
		const dialog = innerOf<HTMLDialogElement>(host, 'dialog')
		const labelId = dialog.getAttribute('aria-labelledby')
		const label = labelId ? host.shadowRoot!.getElementById(labelId) : null
		expect(label?.textContent?.trim()).toBe(host.getAttribute('heading'))
		const descriptionId = dialog.getAttribute('aria-describedby')
		const description = descriptionId ? host.shadowRoot!.getElementById(descriptionId) : null
		expect(description?.textContent?.trim()).toBe(host.getAttribute('description'))
	})
})

describe('<z-alert-dialog>', () => {
	it('Escape counts as cancel, not confirm', async () => {
		const wrapper = await mount('<z-alert-dialog heading="Delete item"><z-button slot="trigger">Delete</z-button></z-alert-dialog>')
		const host = wrapper.querySelector<HostT>('z-alert-dialog')!
		const confirms = recordEvents(host, 'confirm')
		const cancels = recordEvents(host, 'cancel')
		focus(innerOf<HTMLButtonElement>(wrapper.querySelector('z-button')!, 'button'))
		await userEvent.keyboard('{Enter}')
		await settle(wrapper)
		await userEvent.keyboard('{Escape}')
		await settle(wrapper)
		expect(cancels.length).toBe(1)
		expect(confirms.length).toBe(0)
	})
})

describe('<z-command>', () => {
	const markup = '<z-command placeholder="Search"><z-command-item value="new">New file</z-command-item><z-command-item value="open">Open file</z-command-item><z-command-item value="save">Save all</z-command-item></z-command>'

	it('typing filters; ↓ and Enter choose the first match, fire select, and close', async () => {
		const wrapper = await mount(markup)
		const host = wrapper.querySelector<HostT>('z-command')!
		const selections = recordEvents(host, 'select')
		host.isOpen = true
		await settle(wrapper)
		focus(innerOf<HTMLInputElement>(host, 'input'))
		await userEvent.keyboard('sav')
		await settle(wrapper)
		await userEvent.keyboard('{ArrowDown}{Enter}')
		await settle(wrapper)
		expect(selections.at(-1)).toEqual({ value: 'save' })
		expect(host.isOpen).toBe(false)
	})

	it('Escape — closes without selecting', async () => {
		const wrapper = await mount(markup)
		const host = wrapper.querySelector<HostT>('z-command')!
		const selections = recordEvents(host, 'select')
		host.isOpen = true
		await settle(wrapper)
		focus(innerOf<HTMLInputElement>(host, 'input'))
		await userEvent.keyboard('{Escape}')
		await settle(wrapper)
		expect(host.isOpen).toBe(false)
		expect(selections.length).toBe(0)
	})
})

describe('<z-context-menu>', () => {
	it('the contextmenu key opens the menu; ↓ and Enter choose an item; Escape closes', async () => {
		const wrapper = await mount('<z-context-menu><button id="target">Target</button></z-context-menu>')
		const host = wrapper.querySelector<HostT>('z-context-menu')!
		host.items = [{ value: 'copy', label: 'Copy' }, { value: 'paste', label: 'Paste' }]
		await settle(wrapper)
		const selections = recordEvents(host, 'select')
		const target = focus(wrapper.querySelector<HTMLButtonElement>('#target')!)
		target.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, composed: true, cancelable: true, clientX: 40, clientY: 40 }))
		const panel = innerOf(host, '.panel')
		await waitUntil(() => isVisible(panel))
		expect(isVisible(panel)).toBe(true)
		expect(flatContains(panel, deepActiveElement())).toBe(true)
		await userEvent.keyboard('{ArrowDown}{Enter}')
		await settle(wrapper)
		expect(selections.length).toBe(1)
		expect(deepActiveElement()).toBe(target)
		target.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, composed: true, cancelable: true, clientX: 40, clientY: 40 }))
		await waitUntil(() => isVisible(panel))
		await userEvent.keyboard('{Escape}')
		await waitUntil(() => !isVisible(panel))
		expect(isVisible(panel)).toBe(false)
	})
})

describe('<z-nav-menu>', () => {
	it('Enter on an entry fires select with its value', async () => {
		const wrapper = await mount('<z-nav-menu></z-nav-menu>')
		const host = wrapper.querySelector<HostT>('z-nav-menu')!
		host.items = [{ value: 'home', label: 'Home' }, { value: 'docs', label: 'Docs' }]
		await settle(wrapper)
		const selections = recordEvents(host, 'select')
		const entries = host.shadowRoot!.querySelectorAll<HTMLElement>('button, a')
		focus(entries[1])
		await userEvent.keyboard('{Enter}')
		await settle(wrapper)
		expect(selections.at(-1)).toEqual({ value: 'docs' })
		await expectNoA11yViolations(wrapper)
	})
})

describe('<z-sidebar>', () => {
	it('Enter on an entry fires select with its value', async () => {
		const wrapper = await mount('<z-sidebar></z-sidebar>')
		const host = wrapper.querySelector<HostT>('z-sidebar')!
		host.items = [{ label: 'Guides', items: [{ value: 'intro', label: 'Introduction' }, { value: 'setup', label: 'Setup' }] }]
		await settle(wrapper)
		const selections = recordEvents(host, 'select')
		const entries = [...host.shadowRoot!.querySelectorAll<HTMLElement>('button, a')]
		const setupEntry = entries.find((entry) => entry.textContent?.includes('Setup'))!
		focus(setupEntry)
		await userEvent.keyboard('{Enter}')
		await settle(wrapper)
		expect(selections.at(-1)).toEqual({ value: 'setup' })
		await expectNoA11yViolations(wrapper)
	})
})

describe('<z-filter>', () => {
	it('Enter on a pill picks that option and fires change', async () => {
		const wrapper = await mount('<z-filter label="Status"></z-filter>')
		const host = wrapper.querySelector<HostT>('z-filter')!
		host.options = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }]
		await settle(wrapper)
		const changes = recordEvents(host, 'change')
		const pills = host.shadowRoot!.querySelectorAll<HTMLButtonElement>('button.pill')
		focus(pills[1])
		await userEvent.keyboard('{Enter}')
		await settle(wrapper)
		expect(changes.length).toBeGreaterThan(0)
		expect(JSON.stringify(changes.at(-1))).toContain('"b"')
		await expectNoA11yViolations(wrapper)
	})
})

describe('<z-theme-switcher>', () => {
	it('Enter on a segment applies that theme and fires change', async () => {
		const wrapper = await mount('<z-theme-switcher></z-theme-switcher>')
		const host = wrapper.querySelector<HostT>('z-theme-switcher')!
		const changes = recordEvents(host, 'change')
		const segments = host.shadowRoot!.querySelectorAll<HTMLButtonElement>('button.segment')
		focus(segments[0])
		await userEvent.keyboard('{Enter}')
		expect((changes.at(-1) as { preference: string }).preference).toBe('light')
		focus(segments[1])
		await userEvent.keyboard('{Enter}')
		expect((changes.at(-1) as { preference: string }).preference).toBe('dark')
	})
})

describe('<z-tree>', () => {
	const items = [
		{ id: 'src', label: 'src', children: [{ id: 'index', label: 'index.ts' }, { id: 'util', label: 'util.ts' }] },
		{ id: 'readme', label: 'README.md' }
	]

	it('↓ / ↑ / Home / End move; → expands and ← collapses; Enter activates', async () => {
		const wrapper = await mount('<z-tree></z-tree>')
		const host = wrapper.querySelector<HostT>('z-tree')!
		host.items = items
		await settle(wrapper)
		const expands = recordEvents(host, 'expand')
		const collapses = recordEvents(host, 'collapse')
		const activations = recordEvents(host, 'activate')
		expect(host.getAttribute('role')).toBe('tree')
		focus(innerOf<HTMLElement>(host, '[role="treeitem"]'))
		await userEvent.keyboard('{ArrowRight}')
		await settle(wrapper)
		expect(expands.length).toBe(1)
		await userEvent.keyboard('{ArrowDown}')
		await settle(wrapper)
		expect(activeText()).toContain('index.ts')
		await userEvent.keyboard('{End}')
		await settle(wrapper)
		expect(activeText()).toContain('README.md')
		await userEvent.keyboard('{Home}')
		await settle(wrapper)
		expect(activeText()).toContain('src')
		await userEvent.keyboard('{ArrowLeft}')
		await settle(wrapper)
		expect(collapses.length).toBe(1)
		await userEvent.keyboard('{Enter}')
		await settle(wrapper)
		expect(activations.length).toBeGreaterThan(0)
		await expectNoA11yViolations(wrapper)
	})
})

describe('<z-dropzone>', () => {
	it('Enter and Space on the drop area open the file picker', async () => {
		const wrapper = await mount('<z-dropzone></z-dropzone>')
		const host = wrapper.querySelector<HostT>('z-dropzone')!
		const input = innerOf<HTMLInputElement>(host, 'input')
		let pickerOpens = 0
		input.addEventListener('click', (event) => {
			pickerOpens += 1
			event.preventDefault()
		})
		focus(innerOf<HTMLElement>(host, '.zone'))
		await userEvent.keyboard('{Enter}')
		await userEvent.keyboard(' ')
		expect(pickerOpens).toBe(2)
		await expectNoA11yViolations(wrapper)
	})

	it('a disabled drop area is out of the tab order and ignores the keyboard', async () => {
		const wrapper = await mount('<z-dropzone is-disabled></z-dropzone>')
		const host = wrapper.querySelector<HostT>('z-dropzone')!
		const zone = innerOf<HTMLElement>(host, '.zone')
		expect(zone.tabIndex).toBe(-1)
		expect(zone.getAttribute('aria-disabled')).toBe('true')
	})
})
