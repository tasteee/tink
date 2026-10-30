// crypto.randomUUID is missing on plain-http LAN origins,
// which is exactly how the game is tested on a phone.
export const createObjectId = (): string => {
	const timePart = Date.now().toString(36)
	const randomPart = Math.random().toString(36).slice(2, 8)
	return `object-${timePart}-${randomPart}`
}
