import { afterEach, describe, expect, it, vi } from 'vitest'
import { warnDeprecated } from '../shared/deprecate'

describe('warnDeprecated', () => {
	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('names the deprecated subject and what to use instead', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

		warnDeprecated('z-example "old"', 'z-example "next"')

		expect(warn).toHaveBeenCalledTimes(1)
		const message = String(warn.mock.calls[0][0])
		expect(message).toContain('z-example "old"')
		expect(message).toContain('z-example "next"')
	})

	it('warns once per subject and replacement', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

		warnDeprecated('z-once "old"', 'z-once "next"')
		warnDeprecated('z-once "old"', 'z-once "next"')
		warnDeprecated('z-once "old"', 'z-once "next"')

		expect(warn).toHaveBeenCalledTimes(1)
	})

	it('warns again for a different subject', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

		warnDeprecated('z-first "old"', 'z-first "next"')
		warnDeprecated('z-second "old"', 'z-second "next"')

		expect(warn).toHaveBeenCalledTimes(2)
	})
})
