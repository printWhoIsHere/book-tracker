/**
 * Get row height in pixels based on row height setting
 */
export function getRowHeight(rowHeight: RowHeight | undefined): number {
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
export function getMaxLines(rowHeight: RowHeight | undefined): number {
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
export function getMultiSelectMaxHeight(
	rowHeight: RowHeight | undefined,
): number {
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
	lastName?: string | null,
	firstName?: string | null,
	middleName?: string | null,
): string {
	const nameParts = [firstName, middleName].filter(Boolean).join(' ')
	const fullNameParts = [lastName, nameParts].filter(Boolean)
	return fullNameParts.join(', ') || ''
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

/**
 * Получить уникальные значения поля из массива объектов
 * @param items - массив объектов
 * @param field - ключ объекта для извлечения значения
 * @returns массив уникальных значений поля
 */
export function getUniqueValues<T, K extends keyof T>(
	items: T[],
	field: K,
): T[K][] {
	const allValues: T[K][] = []
	items.forEach((item) => {
		const v = item[field]
		if (Array.isArray(v)) {
			allValues.push(...v)
		} else if (v != null) {
			allValues.push(v)
		}
	})
	return Array.from(new Set(allValues))
}

/**
 * Сгенерировать опции для селекта или фильтрации
 * @param items - массив объектов
 * @param field - ключ объекта для извлечения значения
 * @returns массив объектов { label, value }
 */
export function generateOptions<T, K extends keyof T>(
	items: T[],
	field: K,
): Option[] {
	return getUniqueValues(items, field)
		.map((val) => ({ label: String(val), value: String(val) }))
		.sort((a, b) => a.label.localeCompare(b.label))
}

/**
 * Группирует года по интервалу и возвращает опции для фильтрации.
 * Если в интервале только один год, возвращается `{label: '2001', value: '2001'}`,
 * иначе `{label: '2000-2004', value: '2000-2004'}`.
 * @param optionsArray - массив опций с годами
 * @param interval - размер интервала (по умолчанию 5 лет)
 * @returns массив объектов { label, value }
 */
export function groupYears(optionsArray: Option[], interval = 5): Option[] {
	if (!optionsArray.length) return []

	const years = optionsArray
		.map((opt) => parseInt(opt.value, 10))
		.filter((year) => !isNaN(year))

	if (!years.length) return []

	const sorted = Array.from(new Set(years)).sort((a, b) => a - b)
	const groupsMap = new Map<number, number[]>()

	sorted.forEach((year) => {
		const binStart = Math.floor(year / interval) * interval
		if (!groupsMap.has(binStart)) {
			groupsMap.set(binStart, [])
		}
		groupsMap.get(binStart)!.push(year)
	})

	const options: Option[] = []
	Array.from(groupsMap.entries())
		.sort((a, b) => a[0] - b[0])
		.forEach(([start, groupVals]) => {
			const label =
				groupVals.length === 1
					? `${groupVals[0]}`
					: `${start}-${start + interval - 1}`
			options.push({ label, value: label })
		})

	return options
}
