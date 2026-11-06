import { afterEach, describe, expect, it } from 'vitest'
import { mount } from './form-helpers'

/*
 * Layout elements must fit the space they are given. A page that scrolls
 * sideways on a phone is a bug in the element, not in the page.
 */

afterEach(() => {
	document.body.replaceChildren()
})

describe('<z-grid>', () => {
	it('min-column-width never makes the grid wider than its container', async () => {
		const wrapper = await mount('<div id="box" style="width: 200px"><z-grid min-column-width="22rem" gap="sm"><div>One</div><div>Two</div></z-grid></div>')
		const box = wrapper.querySelector<HTMLElement>('#box')!
		const grid = wrapper.querySelector<HTMLElement>('z-grid')!
		expect(grid.getBoundingClientRect().width).toBeLessThanOrEqual(box.getBoundingClientRect().width)
		expect(box.scrollWidth).toBeLessThanOrEqual(box.clientWidth)
	})

	it('min-column-width still makes several columns when there is room', async () => {
		const wrapper = await mount('<div style="width: 900px"><z-grid min-column-width="10rem" gap="sm"><div>One</div><div>Two</div><div>Three</div></z-grid></div>')
		const cells = [...wrapper.querySelectorAll<HTMLElement>('z-grid > div')]
		const tops = new Set(cells.map((cell) => Math.round(cell.getBoundingClientRect().top)))
		expect(tops.size).toBe(1)
	})
})

describe.each(['z-scroll', 'z-scroll-area'])('<%s>', (tag) => {
	it('never widens the grid that holds it, however wide its content is', async () => {
		const markup = `<div id="box" style="display: grid; grid-template-columns: 1fr; width: 200px"><${tag} direction="horizontal"><div style="width: 900px">Wide content</div></${tag}></div>`
		const wrapper = await mount(markup)
		const box = wrapper.querySelector<HTMLElement>('#box')!
		const scroller = wrapper.querySelector<HTMLElement>(tag)!
		expect(scroller.getBoundingClientRect().width).toBeLessThanOrEqual(box.getBoundingClientRect().width)
		expect(box.scrollWidth).toBeLessThanOrEqual(box.clientWidth)
	})
})
