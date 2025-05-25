/**
 * Generate accessible labels for table actions
 */
export function getActionLabel(action: string, itemName: string): string {
	const actionMap: Record<string, string> = {
		edit: 'Edit',
		delete: 'Delete',
		view: 'View details for',
		select: 'Select',
	}

	const actionText = actionMap[action] || action
	return `${actionText} ${itemName}`
}

/**
 * Generate sorting instruction text for screen readers
 */
export function getSortingInstructions(
	columnName: string,
	currentSort?: 'asc' | 'desc' | false,
): string {
	if (currentSort === 'asc') {
		return `${columnName}, sorted ascending. Click to sort descending.`
	} else if (currentSort === 'desc') {
		return `${columnName}, sorted descending. Click to remove sorting.`
	} else {
		return `${columnName}. Click to sort ascending.`
	}
}
