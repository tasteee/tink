import { afterEach, describe, expect, it } from 'vitest'
import '../../index'
import { expectNoA11yViolations } from './a11y-helpers'

/*
 * Helpers for the browser project. Everything here runs in real Chromium,
 * so a <form> is a real form owner and FormData is the platform's answer,
 * not a simulation.
 */

type UpdatableT = HTMLElement & { updated?: Promise<void> }

/** Waits for every Zest element under `root` to finish its pending render. */
export const settle = async (root: ParentNode = document): Promise<void> => {
	await Promise.resolve()
	const elements = [...root.querySelectorAll<UpdatableT>('*')].filter((el) => el.localName.startsWith('z-'))
	await Promise.all(elements.map((el) => el.updated))
	// Two frames: the first callback runs before this frame paints, so a CSS
	// animation on a node rendered this turn does not exist yet; after the
	// second it does, and it can be waited out. axe would otherwise sample a
	// toast at half opacity and call it low contrast.
	await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
	await Promise.all(deepAnimations(document.body).map((animation) => animation.finished.catch(() => undefined)))
	await waitForExits(document.body)
}

// Surfaces leave through shared/presence.ts: they carry
// data-state="closing" until their exit transition ends, and only then
// close, hide or unmount. Wait that out so a test sees the settled state.
const hasClosingElement = (root: ParentNode): boolean => {
	for (const element of root.querySelectorAll('*')) {
		const isClosing = (element as HTMLElement).dataset?.state === 'closing'
		if (isClosing) return true
		const hasClosingChild = element.shadowRoot ? hasClosingElement(element.shadowRoot) : false
		if (hasClosingChild) return true
	}
	return false
}

const waitForExits = async (root: ParentNode): Promise<void> => {
	const deadline = performance.now() + 1500
	const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
	for (const _attempt of Array.from({ length: 120 })) {
		const isSettled = !hasClosingElement(root) || performance.now() > deadline
		if (isSettled) return
		await nextFrame()
	}
}

// document.getAnimations() does not reliably report animations inside shadow
// roots, so each element is asked directly, shadow trees included.
const deepAnimations = (root: ParentNode): Animation[] => {
	const found: Animation[] = []
	for (const element of root.querySelectorAll('*')) {
		found.push(...element.getAnimations())
		if (element.shadowRoot) found.push(...deepAnimations(element.shadowRoot))
	}
	return found
}

/** True when `node` is inside `ancestor` in the flat tree — through slots and shadow roots. */
export const flatContains = (ancestor: Node, node: Node | null): boolean => {
	let current: Node | null = node
	while (current) {
		if (current === ancestor) return true
		const assigned = (current as Element).assignedSlot
		if (assigned) { current = assigned; continue }
		const parent: Node | null = current.parentNode
		current = parent instanceof ShadowRoot ? parent.host : parent
	}
	return false
}

/** Mounts markup in the body, returns the wrapper once its elements have rendered. */
export const mount = async (markup: string): Promise<HTMLDivElement> => {
	const wrapper = document.createElement('div')
	wrapper.innerHTML = markup
	document.body.append(wrapper)
	await settle(wrapper)
	return wrapper
}

/** Mounts markup inside a <form>, returns the form once its elements have rendered. */
export const mountForm = async (markup: string): Promise<HTMLFormElement> => {
	const form = document.createElement('form')
	form.innerHTML = markup
	document.body.append(form)
	await settle(form)
	return form
}

export const entriesOf = (form: HTMLFormElement): Array<[string, FormDataEntryValue]> => [...new FormData(form).entries()]

/**
 * Calls requestSubmit(), which runs interactive validation like a click on a
 * submit button would, and reports whether a submit event actually fired.
 */
export const trySubmit = (form: HTMLFormElement): boolean => {
	let submitted = false
	const onSubmit = (event: Event) => { event.preventDefault(); submitted = true }
	form.addEventListener('submit', onSubmit, { once: true })
	form.requestSubmit()
	form.removeEventListener('submit', onSubmit)
	return submitted
}

export const innerOf = <T extends HTMLElement>(host: HTMLElement, selector: string): T => {
	const inner = host.shadowRoot?.querySelector<T>(selector)
	if (!inner) throw new Error(`Expected <${host.localName}> to render ${selector}`)
	return inner
}

/** The focused element, descending through open shadow roots. */
export const deepActiveElement = (): Element | null => {
	let active = document.activeElement
	while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement
	return active
}

export type FormHostT = HTMLElement & {
	form: HTMLFormElement | null
	validity: ValidityState
	validationMessage: string
	willValidate: boolean
	labels: NodeList
	checkValidity(): boolean
	reportValidity(): boolean
	setCustomValidity(message: string): void
	value?: unknown
	isChecked?: boolean
}

afterEach(() => {
	document.body.replaceChildren()
})

export type FormContractT = {
	tag: string
	/** Attributes that give the control a submittable value. */
	filled: string
	/** The FormData entry `filled` produces. */
	expected: string
	/** Attributes for a control with nothing to submit. */
	empty: string
	/** What an empty control contributes: an empty string (text-like) or nothing at all (checkbox-like). */
	emptyEntry: '' | null
	/** The native control that receives focus and the disabled state: a selector inside the shadow root, or a resolver. */
	inner: string | ((host: HTMLElement) => HTMLInputElement)
	/** Changes the value through the public property, for the reset test. */
	mutate: (host: FormHostT) => void
	/** Reads the public value back, for the reset test. */
	read: (host: FormHostT) => unknown
	/** Extra light-DOM children (a radio group's radios). */
	children?: string
}

/**
 * The contract every form-associated Zest control honours. Each control's
 * test file runs this and then adds what is particular to it.
 */
export const describeFormContract = (contract: FormContractT): void => {
	const { tag, filled, expected, empty, emptyEntry, mutate, read } = contract
	const children = contract.children ?? ''
	const markup = (attrs: string) => `<${tag} name="field" label="Field" ${attrs}>${children}</${tag}>`
	const inner = (host: HTMLElement): HTMLInputElement =>
		typeof contract.inner === 'string' ? innerOf<HTMLInputElement>(host, contract.inner) : contract.inner(host)

	describe(`<${tag}> form contract`, () => {
		it('submits its value under the host name', async () => {
			const form = await mountForm(markup(filled))
			expect(entriesOf(form)).toEqual([['field', expected]])
		})

		it(emptyEntry === null ? 'contributes nothing while empty' : 'contributes an empty entry while empty', async () => {
			const form = await mountForm(markup(empty))
			expect(entriesOf(form)).toEqual(emptyEntry === null ? [] : [['field', '']])
		})

		it('contributes nothing without a name', async () => {
			const form = await mountForm(`<${tag} ${filled}>${children}</${tag}>`)
			expect(entriesOf(form)).toEqual([])
		})

		it('exposes the native constraint-validation surface', async () => {
			const form = await mountForm(`<label for="the-field">Label</label>${markup(filled).replace('name="field"', 'id="the-field" name="field"')}`)
			const host = form.querySelector<FormHostT>(tag)!
			expect(host.form).toBe(form)
			expect(host.willValidate).toBe(true)
			expect(host.validity.valid).toBe(true)
			expect(host.validationMessage).toBe('')
			expect(host.checkValidity()).toBe(true)
			expect([...host.labels]).toHaveLength(1)
			await expectNoA11yViolations(form)
		})

		it('blocks submission while required and empty, and fires invalid on the host', async () => {
			const form = await mountForm(markup(`${empty} is-required`))
			const host = form.querySelector<FormHostT>(tag)!
			let invalidEvents = 0
			host.addEventListener('invalid', () => { invalidEvents += 1 })

			expect(host.validity.valueMissing).toBe(true)
			expect(host.validationMessage).not.toBe('')
			expect(form.checkValidity()).toBe(false)
			expect(trySubmit(form)).toBe(false)
			expect(invalidEvents).toBeGreaterThan(0)
			await expectNoA11yViolations(form)
		})

		it('submits while required and filled', async () => {
			const form = await mountForm(markup(`${filled} is-required`))
			expect(form.checkValidity()).toBe(true)
			expect(trySubmit(form)).toBe(true)
		})

		it('moves focus to the control when the form reports validity', async () => {
			const form = await mountForm(`<input name="other">${markup(`${empty} is-required`)}`)
			const host = form.querySelector<FormHostT>(tag)!
			expect(form.reportValidity()).toBe(false)
			expect(host.contains(document.activeElement)).toBe(true)
			expect(deepActiveElement()).toBe(inner(host))
		})

		it('honours setCustomValidity', async () => {
			const form = await mountForm(markup(filled))
			const host = form.querySelector<FormHostT>(tag)!
			host.setCustomValidity('Not this one')
			await settle(form)
			expect(host.validity.customError).toBe(true)
			expect(host.validationMessage).toBe('Not this one')
			expect(form.checkValidity()).toBe(false)

			host.setCustomValidity('')
			await settle(form)
			expect(host.validity.valid).toBe(true)
			expect(form.checkValidity()).toBe(true)
		})

		it('returns to its initial value on form reset', async () => {
			const form = await mountForm(markup(filled))
			const host = form.querySelector<FormHostT>(tag)!
			const initial = read(host)
			mutate(host)
			await settle(form)
			expect(read(host)).not.toEqual(initial)

			form.reset()
			await settle(form)
			expect(read(host)).toEqual(initial)
			expect(entriesOf(form)).toEqual([['field', expected]])
		})

		it('is excluded from submission and validation while its own is-disabled is set', async () => {
			const form = await mountForm(markup(`${empty} is-required is-disabled`))
			expect(entriesOf(form)).toEqual([])
			expect(form.checkValidity()).toBe(true)
		})

		it('follows a disabled fieldset and recovers when it is re-enabled', async () => {
			const form = await mountForm(`<fieldset disabled>${markup(`${filled} is-required`)}</fieldset>`)
			const host = form.querySelector<FormHostT>(tag)!
			const fieldset = form.querySelector('fieldset')!
			await settle(form)
			expect(entriesOf(form)).toEqual([])
			expect(inner(host).disabled).toBe(true)

			fieldset.disabled = false
			await settle(form)
			expect(entriesOf(form)).toEqual([['field', expected]])
			expect(inner(host).disabled).toBe(false)
		})
	})
}
