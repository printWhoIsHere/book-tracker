import { Row } from '@tanstack/react-table'

/**
 * Filter function for multi-column search.
 */
export function multiColumnSearch<TValue>(
	row: Row<TValue>,
	columnId: string,
	filterValue: string,
): boolean {
	if (!filterValue) return true
	const searchableColumns = ['title', 'content', 'annotation']
	const term = filterValue.toLowerCase()
	return searchableColumns.some((col) =>
		String(row.getValue(col) ?? '')
			.toLowerCase()
			.includes(term),
	)
}

/**
 * Filter function for genre.
 */
export function genreFilter<TValue>(
	row: Row<TValue>,
	columnId: string,
	filterValue: string[],
): boolean {
	if (!filterValue?.length) return true
	const cell = row.getValue(columnId) as string
	return filterValue.includes(cell)
}

/**
 * Filter function for year ranges.
 */
export function yearFilter<TValue>(
	row: Row<TValue>,
	columnId: string,
	filterValue: string[],
): boolean {
	if (!filterValue?.length) return true
	const year = Number(row.getValue(columnId))
	for (const val of filterValue) {
		if (val === 'all') return true
		if (val.includes('-')) {
			const [from, to] = val.split('-').map(Number)
			if (year >= from && year <= to) return true
		} else if (year === Number(val)) {
			return true
		}
	}
	return false
}

/**
 * Filter function for tags.
 */
export function tagsFilter<TValue>(
	row: Row<TValue>,
	columnId: string,
	filterValue: string[],
): boolean {
	if (!filterValue?.length) return true
	const tags = row.getValue(columnId) as unknown[]
	if (!Array.isArray(tags)) return false
	return filterValue.some((fv) => tags.includes(fv))
}

export const filterFns = {
	multiColumnSearch,
	genreFilter,
	yearFilter,
	tagsFilter,
}
