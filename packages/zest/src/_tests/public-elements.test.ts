// @ts-expect-error The build inventory is JavaScript; this test intentionally
// exercises the same source of truth used to create the package entries.
import { getPublicElementEntries } from '../../scripts/public-element-entries.mjs'
import { describe, expect, it } from 'vitest'
import { waitForRender } from './test-helpers'
import '../index'

const elementTags = (getPublicElementEntries() as Array<{ tag: string }>).map(({ tag }) => tag)

describe('public element registration', () => {
	it.each(elementTags)('registers <%s> from the root entry point', (tag) => {
		expect(customElements.get(tag)).toBeDefined()
	})

	it.each(elementTags)('mounts <%s> without throwing', async (tag) => {
		const element = document.createElement(tag)
		document.body.append(element)
		await waitForRender()

		expect(element.isConnected).toBe(true)
	})
})
