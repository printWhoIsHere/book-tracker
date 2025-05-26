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
		const rawTerms = searchTerm.toLowerCase().trim().split(/\s+/)
		const terms = rawTerms.filter(Boolean)

		if (!terms.length) return text

		const cacheKey = `${text}:${terms.join('|')}`

		if (highlightCache.has(cacheKey)) {
			return highlightCache.get(cacheKey)
		}

		const lowerText = text.toLowerCase()

		const hasMatch = terms.some((term) => lowerText.includes(term))

		if (!hasMatch) {
			highlightCache.set(cacheKey, text)
			return text
		}

		const escapedTerms = terms.map((term) =>
			term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
		)
		const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi')

		const parts: (string | React.ReactElement)[] = []
		let lastIndex = 0
		let match: RegExpExecArray | null

		while ((match = regex.exec(text)) !== null) {
			if (match.index > lastIndex) {
				parts.push(text.substring(lastIndex, match.index))
			}

			parts.push(
				<mark
					key={`${match.index}-${match[0]}`}
					className='bg-yellow-200/30 text-foreground rounded-sm px-0.5'
				>
					{match[0]}
				</mark>,
			)

			lastIndex = regex.lastIndex

			if (match[0] === '') {
				regex.lastIndex++
			}
		}

		if (lastIndex < text.length) {
			parts.push(text.substring(lastIndex))
		}

		const result = parts.length > 1 ? <span>{parts}</span> : text

		if (highlightCache.size > 1000) {
			const keysToDelete = Array.from(highlightCache.keys()).slice(0, 100)
			keysToDelete.forEach((key) => highlightCache.delete(key))
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
