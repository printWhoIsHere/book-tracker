/**
 * Get row height in pixels based on row height setting
 */
export function getRowHeight(rowHeight: RowHeight): number {
	switch (rowHeight) {
		case 'compact':
			return 40
		case 'comfortable':
			return 104
		case 'default':
		default:
			return 52
	}
}

/**
 * Get maximum number of lines for cell content based on row height
 */
export function getMaxLines(rowHeight: RowHeight): number {
	switch (rowHeight) {
		case 'compact':
			return 1
		case 'comfortable':
			return 3
		case 'default':
		default:
			return 1
	}
}

/**
 * Get maximum height for tag containers based on row height
 */
export function getTagContainerMaxHeight(rowHeight: RowHeight): number {
	switch (rowHeight) {
		case 'compact':
			return 24
		case 'comfortable':
			return 64
		case 'default':
		default:
			return 24
	}
}

/**
 * Format full name from individual name parts
 */
export function formatFullName(
	lastName?: string,
	firstName?: string,
	middleName?: string,
): string {
	const parts = [lastName, firstName, middleName].filter(Boolean)
	return parts.length > 0 ? parts.join(' ') : '—'
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text
	return text.slice(0, maxLength) + '...'
}

/**
 * Check if a value is empty (null, undefined, empty string, or empty array)
 */
export function isEmpty(value: unknown): boolean {
	if (value == null) return true
	if (typeof value === 'string') return value.trim().length === 0
	if (Array.isArray(value)) return value.length === 0
	return false
}
