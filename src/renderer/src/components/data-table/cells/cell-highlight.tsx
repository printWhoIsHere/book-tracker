import { useMemo } from 'react'

interface CellHighlightProps {
	value: string | null | undefined
	searchTerm: string
}

export function CellHighlight({ value, searchTerm }: CellHighlightProps) {
	const highlightedText = useMemo(() => {
		if (!value || !searchTerm) return value || ''

		const text = String(value)
		const term = searchTerm.toLowerCase()
		const lowerText = text.toLowerCase()

		if (!lowerText.includes(term)) return text

		const parts = []
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

		return parts
	}, [value, searchTerm])

	return <span>{highlightedText}</span>
}
