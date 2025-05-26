import { useMemo } from 'react'

interface CellHighlightProps {
	value: string | null | undefined
	searchTerm: string
}

const highlightCache = new Map<string, React.ReactNode>()

export function CellHighlight({ value, searchTerm }: CellHighlightProps) {
	const highlightedText = useMemo(() => {
		if (!value || !searchTerm) return value || ''

		const text = String(value)
		const lowerText = text.toLowerCase()
		const query = searchTerm.toLowerCase().trim()

		const cacheKey = `${text}::phrase::${query}`
		if (highlightCache.has(cacheKey)) {
			return highlightCache.get(cacheKey)!
		}

		const idx = lowerText.indexOf(query)
		if (idx !== -1) {
			const before = text.slice(0, idx)
			const match = text.slice(idx, idx + query.length)
			const after = text.slice(idx + query.length)

			const result = (
				<span>
					{before}
					<mark className='bg-yellow-200/30 text-foreground rounded-sm px-0.5'>
						{match}
					</mark>
					{after}
				</span>
			)

			highlightCache.set(cacheKey, result)
			return result
		}

		const rawTerms = query.split(/\s+/).filter(Boolean)
		if (!rawTerms.length) {
			highlightCache.set(cacheKey, text)
			return text
		}

		const escaped = rawTerms.map((t) =>
			t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
		)
		const regex = new RegExp(`(${escaped.join('|')})`, 'gi')
		const parts: (string | React.ReactElement)[] = []
		let lastIndex = 0
		let m: RegExpExecArray | null

		while ((m = regex.exec(text))) {
			if (m.index > lastIndex) {
				parts.push(text.slice(lastIndex, m.index))
			}
			parts.push(
				<mark
					key={`${m.index}-${m[0]}`}
					className='bg-yellow-200/30 text-foreground rounded-sm px-0.5'
				>
					{m[0]}
				</mark>,
			)
			lastIndex = regex.lastIndex
		}
		if (lastIndex < text.length) {
			parts.push(text.slice(lastIndex))
		}

		const result = parts.length > 1 ? <span>{parts}</span> : text

		if (highlightCache.size > 1000) {
			Array.from(highlightCache.keys())
				.slice(0, 100)
				.forEach((k) => highlightCache.delete(k))
		}

		highlightCache.set(cacheKey, result)
		return result
	}, [value, searchTerm])

	return highlightedText as React.ReactElement
}

export function clearHighlightCache() {
	highlightCache.clear()
}

export function getHighlightCacheStats() {
	return {
		size: highlightCache.size,
		keys: Array.from(highlightCache.keys()).slice(0, 5),
	}
}
