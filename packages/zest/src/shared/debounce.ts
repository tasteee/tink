/* Trailing-edge debounce — used by z-mention-popover (async source lookups)
 * and z-status-bar (word/char/read-time recompute) to coalesce rapid updates. */
export const debounce = <ArgsT extends unknown[]>(fn: (...args: ArgsT) => void, waitMs: number) => {
	let timer: ReturnType<typeof setTimeout> | undefined

	const debounced = (...args: ArgsT) => {
		clearTimeout(timer)
		timer = setTimeout(() => fn(...args), waitMs)
	}

	debounced.cancel = () => clearTimeout(timer)
	return debounced
}
