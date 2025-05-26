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
		const term = searchTerm.toLowerCase().trim()

		if (!term) return text

		const cacheKey = `${text}:${term}`

		if (highlightCache.has(cacheKey)) {
			return highlightCache.get(cacheKey)
		}

		const lowerText = text.toLowerCase()

		if (!lowerText.includes(term)) {
			highlightCache.set(cacheKey, text)
			return text
		}

		const parts: React.ReactNode[] = []
		let lastIndex = 0
		let index = lowerText.indexOf(term)

		while (index !== -1) {
			if (index > lastIndex) {
				parts.push(text.substring(lastIndex, index))
			}

			parts.push(
				<mark
					key={`${index}-${term}`}
					className='bg-yellow-200/20 text-foreground rounded'
				>
					{text.substring(index, index + term.length)}
				</mark>,
			)

			lastIndex = index + term.length
			index = lowerText.indexOf(term, lastIndex)
		}

		if (lastIndex < text.length) {
			parts.push(text.substring(lastIndex))
		}

		const result = <span>{parts}</span>

		// Ограничиваем размер кэша
		if (highlightCache.size > 1000) {
			const firstKey = highlightCache.keys().next().value
			if (firstKey) {
				highlightCache.delete(firstKey)
			}
		}

		highlightCache.set(cacheKey, result)
		return result
	}, [value, searchTerm])

	return highlightedText as React.ReactElement
}
