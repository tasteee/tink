import { css, useEffect, useHost } from 'atomico'

/*
 * The one rule for naming and describing the native control inside a Zest
 * element, shared by every form control so no two of them disagree.
 *
 * Accessible name, in order:
 *   1. `aria-labelledby` on the host — resolved to the text of the elements
 *      it points at (an idref cannot cross the shadow boundary, so the text
 *      is what gets forwarded);
 *   2. `aria-label` on the host;
 *   3. the `label` property — which is also what z-field forwards;
 *   4. a `<label for>` pointing at the host. The host is a form-associated
 *      element, so the platform gives it `labels`; the text is forwarded
 *      because the inner control cannot be the label's target itself.
 *
 * Description: z-field forwards its `description` and `error` text as
 * properties; the control renders them into visually hidden nodes inside its
 * own shadow root and points `aria-describedby` at those. That is the only
 * relationship a screen reader can follow across the boundary today —
 * `ariaDescribedByElements` (element reflection) only reaches elements in a
 * shadow-including *ancestor* scope, and a sibling element's shadow root is
 * not one.
 */

export const DESCRIPTION_ID = 'z-description'
export const ERROR_ID = 'z-error'

export const srOnlyStyles = css`
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
`

export const resolveAccessibleName = (host: HTMLElement, label?: string): string | undefined => {
	const labelledBy = host.getAttribute('aria-labelledby')
	if (labelledBy) {
		const root = host.getRootNode() as Document | ShadowRoot
		const text = labelledBy
			.split(/\s+/)
			.map((id) => root.getElementById(id)?.textContent?.trim())
			.filter(Boolean)
			.join(' ')
		if (text) return text
	}
	if (host.getAttribute('aria-label')) return host.getAttribute('aria-label') || undefined
	if (label) return label
	const labels = (host as HTMLElement & { labels?: NodeList }).labels
	if (labels && labels.length) {
		const text = [...labels].map((node) => node.textContent?.trim()).filter(Boolean).join(' ')
		if (text) return text
	}
	return undefined
}

const NAME_ATTRIBUTES = ['aria-label', 'aria-labelledby']

/**
 * The accessible name for the inner control, kept current when the host's
 * aria-label / aria-labelledby change after mount (a framework re-render, a
 * translated label) — Atomico only re-renders on prop changes, so the
 * attributes are watched explicitly.
 */
export const useAccessibleName = (label?: string): string | undefined => {
	const host = useHost() as unknown as { current: HTMLElement & { update?: () => Promise<void> } }
	useEffect(() => {
		const element = host.current
		if (typeof MutationObserver === 'undefined') return
		const observer = new MutationObserver(() => { void element.update?.() })
		observer.observe(element, { attributes: true, attributeFilter: NAME_ATTRIBUTES })
		return () => observer.disconnect()
	}, [])
	return resolveAccessibleName(host.current, label)
}

/** The `aria-describedby` value for a control with the given description/error text, or undefined. */
export const describedBy = (description?: string, error?: string): string | undefined => {
	const ids = [description ? DESCRIPTION_ID : '', error ? ERROR_ID : ''].filter(Boolean)
	return ids.length ? ids.join(' ') : undefined
}

/** The visually hidden nodes `describedBy` points at. Render inside the shadow root next to the control. */
export const renderDescriptions = (description?: string, error?: string) => (
	<>
		{description && <span id={DESCRIPTION_ID} class="sr-only">{description}</span>}
		{error && <span id={ERROR_ID} class="sr-only">{error}</span>}
	</>
)

/** The props every describable control declares. */
export const describableProps = {
	description: String,
	error: String
} as const
