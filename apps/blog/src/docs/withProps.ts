// Assign array/object-valued properties onto a zest element once it mounts —
// these can't be passed as JSX attributes (React would stringify them).
export const withProps =
	(props: Record<string, unknown>) =>
	(el: HTMLElement | null): void => {
		if (el) Object.assign(el, props)
	}
