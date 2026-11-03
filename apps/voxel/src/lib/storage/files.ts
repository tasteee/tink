// Browser download + file picking helpers.

export const downloadBlob = (blob: Blob, fileName: string): void => {
	const objectUrl = URL.createObjectURL(blob)
	const anchor = document.createElement('a')
	anchor.href = objectUrl
	anchor.download = fileName
	anchor.click()
	setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}

export const downloadText = (text: string, fileName: string): void => {
	const blob = new Blob([text], { type: 'application/json' })
	downloadBlob(blob, fileName)
}

export const toSafeFileName = (name: string): string => {
	const trimmedName = name.trim()
	const safeName = trimmedName.replace(/[^a-z0-9-_ ]/gi, '').replace(/\s+/g, '-')
	const hasName = safeName.length > 0
	if (hasName) return safeName.toLowerCase()
	return 'project'
}

// Opens the system file picker and resolves with the text of
// the chosen file, or null if nothing was picked.
export const pickTextFile = (accept: string): Promise<string | null> => {
	return new Promise((resolve) => {
		const input = document.createElement('input')
		input.type = 'file'
		input.accept = accept

		const handleChange = async () => {
			const pickedFile = input.files?.[0]
			if (!pickedFile) return resolve(null)
			const fileText = await pickedFile.text()
			resolve(fileText)
		}

		input.addEventListener('change', handleChange)
		input.addEventListener('cancel', () => resolve(null))
		input.click()
	})
}
