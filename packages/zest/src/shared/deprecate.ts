/// <reference types="vite/client" />
/*
 * The deprecation rule from SUPPORT.md, as code: a deprecated value keeps
 * working for one minor and warns once per page load in development builds,
 * naming what to use instead. `import.meta.env.DEV` is false in dist, so a
 * production bundle never logs.
 */
const warned = new Set<string>()

export const warnDeprecated = (subject: string, replacement: string): void => {
	if (!import.meta.env.DEV) return
	const key = `${subject} → ${replacement}`
	if (warned.has(key)) return
	warned.add(key)
	console.warn(`[zest] ${subject} is deprecated and will be removed in the next minor; use ${replacement}.`)
}
