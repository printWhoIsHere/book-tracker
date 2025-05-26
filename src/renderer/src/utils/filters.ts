import { Row } from '@tanstack/react-table'

const searchCache = new Map<string, string>()

function getCachedLowerCase(str: string): string {
	if (!searchCache.has(str)) {
		if (searchCache.size > 5000) {
			searchCache.clear()
		}
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

	const searchableColumns = ['title', 'content', 'annotation', 'author']
	const terms = filterValue.toLowerCase().trim().split(/\s+/).filter(Boolean)

	if (!terms.length) return true

	return terms.every((term) =>
		searchableColumns.some((col) => {
			let value: any

			if (col === 'author') {
				const rowData = row.original as any
				if (rowData.lastName || rowData.firstName || rowData.middleName) {
					value = [rowData.firstName, rowData.middleName, rowData.lastName]
						.filter(Boolean)
						.join(' ')
				} else {
					return false
				}
			} else {
				value = row.getValue(col)
			}

			if (!value) return false

			const cellValue = String(value)
			return getCachedLowerCase(cellValue).includes(term)
		}),
	)
}

export function genreFilter<TValue>(
	row: Row<TValue>,
	columnId: string,
	filterValue: string[],
): boolean {
	if (!filterValue?.length) return true
	const cell = row.getValue(columnId) as string
	if (!cell) return false
	return filterValue.includes(cell)
}

export function yearFilter<TValue>(
	row: Row<TValue>,
	columnId: string,
	filterValue: string[],
): boolean {
	if (!filterValue?.length) return true
	const year = Number(row.getValue(columnId))

	if (!year || isNaN(year)) return false

	return filterValue.some((val) => {
		if (val === 'all') return true

		if (val.includes('-')) {
			const [from, to] = val.split('-').map(Number)
			if (isNaN(from) || isNaN(to)) return false
			return year >= from && year <= to
		}

		const filterYear = Number(val)
		return !isNaN(filterYear) && year === filterYear
	})
}

// Фильтр по тегам (поддержка множественного выбора)
export function tagsFilter<TValue>(
	row: Row<TValue>,
	columnId: string,
	filterValue: string[],
): boolean {
	if (!filterValue?.length) return true
	const tags = row.getValue(columnId) as string[]

	if (!Array.isArray(tags) || !tags.length) return false

	return filterValue.some((filterTag) =>
		tags.some(
			(rowTag) =>
				String(rowTag).toLowerCase() === String(filterTag).toLowerCase(),
		),
	)
}

// Фильтр по тегам (частичное совпадение)
export function tagsSearchFilter<TValue>(
	row: Row<TValue>,
	columnId: string,
	filterValue: string,
): boolean {
	if (!filterValue) return true

	const tags = row.getValue(columnId) as string[]
	if (!Array.isArray(tags) || !tags.length) return false

	const searchTerm = getCachedLowerCase(filterValue.trim())
	if (!searchTerm) return true

	return tags.some((tag) =>
		getCachedLowerCase(String(tag)).includes(searchTerm),
	)
}

export const filterFns = {
	multiColumnSearch,
	genreFilter,
	yearFilter,
	tagsFilter,
	tagsSearchFilter,
}

export function clearSearchCache() {
	searchCache.clear()
}

export function getSearchCacheStats() {
	return {
		size: searchCache.size,
		keys: Array.from(searchCache.keys()).slice(0, 10),
	}
}
