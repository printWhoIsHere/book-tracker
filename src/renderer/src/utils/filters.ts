import { Row } from '@tanstack/react-table'

const searchCache = new Map<string, string>()

function getCachedLowerCase(str: string): string {
	if (!searchCache.has(str)) {
		searchCache.set(str, str.toLowerCase())
	}
	return searchCache.get(str)!
}

export function multiColumnSearch<TValue>(
	row: Row<TValue>,
	columnId: string,
	filterValue: string,
): boolean {
	if (!filterValue) return true

	const searchableColumns = ['title', 'content', 'annotation']
	const term = getCachedLowerCase(filterValue.trim())

	if (!term) return true

	return searchableColumns.some((col) => {
		const value = row.getValue(col)
		if (!value) return false

		const cellValue = String(value)
		return getCachedLowerCase(cellValue).includes(term)
	})
}

export function genreFilter<TValue>(
	row: Row<TValue>,
	columnId: string,
	filterValue: string[],
): boolean {
	if (!filterValue?.length) return true
	const cell = row.getValue(columnId) as string
	return filterValue.includes(cell)
}

export function yearFilter<TValue>(
	row: Row<TValue>,
	columnId: string,
	filterValue: string[],
): boolean {
	if (!filterValue?.length) return true
	const year = Number(row.getValue(columnId))

	return filterValue.some((val) => {
		if (val === 'all') return true
		if (val.includes('-')) {
			const [from, to] = val.split('-').map(Number)
			return year >= from && year <= to
		}
		return year === Number(val)
	})
}

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

export function clearSearchCache() {
	searchCache.clear()
}
