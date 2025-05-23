export function formatFullName(
	lastName?: string | null,
	firstName?: string | null,
	middleName?: string | null,
): string {
	const nameParts = [firstName, middleName].filter(Boolean).join(' ')
	const fullNameParts = [lastName, nameParts].filter(Boolean)
	return fullNameParts.join(', ') || ''
}
