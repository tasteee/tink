import { useEffect, useHost } from 'atomico'

/*
 * The strings zest says on its own — a close button's name, an empty
 * table's "No data", a validation message the browser cannot supply — live
 * here, in English, and nowhere else. An app in another language replaces
 * any of them once:
 *
 *   import { setLocale } from '@tasteee/zest'
 *   setLocale({ close: 'Fermer', noData: 'Aucune donnée' })
 *
 * Every mounted element re-renders with the new strings; keys left out keep
 * their English. Strings with `{name}` placeholders are filled by the
 * component. Messages the platform already localises (a native `required`
 * or `type="email"` failure) are not here; the browser's own text is used.
 */

export const englishStrings = {
	close: 'Close',
	dismiss: 'Dismiss',
	clear: 'Clear',
	notifications: 'Notifications',
	dismissNotification: 'Dismiss notification',
	noData: 'No data',
	noOptions: 'No options',
	noMatches: 'No matches',
	options: 'Options',
	selectPlaceholder: 'Select…',
	searchPlaceholder: 'Search…',
	decreaseValue: 'Decrease value',
	increaseValue: 'Increase value',
	invalidValue: 'Invalid value.',
	selectOneOfTheseOptions: 'Please select one of these options.',
	selectAnItemInTheList: 'Please select an item in the list.',
	enterANumber: 'Please enter a number.',
	valueAtLeast: 'Value must be greater than or equal to {min}.',
	valueAtMost: 'Value must be less than or equal to {max}.',
	valueOnStep: 'Please enter a valid value. The nearest valid values are {low} and {high}.',
	enterTheCode: 'Please enter all {length} characters.',
	digitOf: 'Digit {index} of {length}',
	lowerValue: 'Lower value',
	upperValue: 'Upper value',
	row: 'row',
	column: 'column',
	selectAxis: 'Select {axis}',
	insertAxisAfter: 'Insert {axis} after',
	removeAxis: 'Remove {axis}'
} as const

export type LocaleStringsT = { [Key in keyof typeof englishStrings]: string }
export type LocaleKeyT = keyof LocaleStringsT
export type LocaleParamsT = Record<string, string | number>

let overrides: Partial<LocaleStringsT> = {}
const subscribers = new Set<() => void>()

const interpolate = (template: string, params?: LocaleParamsT): string =>
	params ? template.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match)) : template

/** Replaces zest's strings. Keys left out keep their English. Every mounted element re-renders. */
export const setLocale = (strings: Partial<LocaleStringsT>): void => {
	overrides = { ...strings }
	for (const notify of subscribers) notify()
}

/** The current strings, overrides merged over English. */
export const getLocale = (): LocaleStringsT => ({ ...englishStrings, ...overrides })

export const getLocaleString = (key: LocaleKeyT, params?: LocaleParamsT): string =>
	interpolate(overrides[key] ?? englishStrings[key], params)

/**
 * A translator bound to the current locale that re-renders the host when
 * `setLocale` runs, so a language switch reaches every element on the page.
 */
export const useLocale = (): ((key: LocaleKeyT, params?: LocaleParamsT) => string) => {
	const host = useHost() as unknown as { current: HTMLElement & { update?: () => Promise<void> } }
	useEffect(() => {
		const notify = () => { void host.current.update?.() }
		subscribers.add(notify)
		return () => { subscribers.delete(notify) }
	}, [])
	return getLocaleString
}
