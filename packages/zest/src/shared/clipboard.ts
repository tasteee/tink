// The copy primitive every clipboard affordance sits on:
// z-code-block today, and anything an app builds on top.
//
// Callers get a plain result rather than a thrown error. Clipboard writes
// fail for ordinary, uninteresting reasons — an insecure origin, a denied
// permission, a document that wasn't focused — and every caller wants the
// same response to all of them: leave the affordance un-confirmed. This is
// the one place that can handle the failure meaningfully, so it is the one
// place that catches.

export type CopyResultT = {
	isCopied: boolean
	error: Error | null
}

const buildFailure = (reason: string): CopyResultT => {
	return { isCopied: false, error: new Error(reason) }
}

const COPY_SUCCESS: CopyResultT = { isCopied: true, error: null }

export const checkIsClipboardAvailable = (): boolean => {
	const hasNavigator = typeof navigator !== 'undefined'
	if (!hasNavigator) return false
	return Boolean(navigator.clipboard)
}

export const copyText = async (text: string): Promise<CopyResultT> => {
	const isAvailable = checkIsClipboardAvailable()
	if (!isAvailable) return buildFailure('clipboard unavailable in this context')

	try {
		await navigator.clipboard.writeText(text)
		return COPY_SUCCESS
	} catch (writeError) {
		const isError = writeError instanceof Error
		if (isError) return { isCopied: false, error: writeError }
		return buildFailure('clipboard write rejected')
	}
}

// How long a copy affordance holds its confirmed state before reverting.
export const COPY_FEEDBACK_DURATION = 1600
