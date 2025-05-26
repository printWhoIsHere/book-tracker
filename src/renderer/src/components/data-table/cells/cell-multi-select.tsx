import { useMemo } from 'react'
import { Badge } from '@renderer/components/ui/badge'

interface CellMultiSelectProps {
	array: string[]
	maxVisible?: number
}

export function CellMultiSelect({
	array,
	maxVisible = 3,
}: CellMultiSelectProps) {
	const { visibleItems, hiddenCount } = useMemo(() => {
		if (array.length <= maxVisible) {
			return { visibleItems: array, hiddenCount: 0 }
		}
		return {
			visibleItems: array.slice(0, maxVisible),
			hiddenCount: array.length - maxVisible,
		}
	}, [array, maxVisible])

	if (array.length === 0) return null

	return (
		<div className='flex flex-wrap items-center gap-1 w-full'>
			{visibleItems.map((item) => (
				<Badge
					key={item}
					variant='outline'
					className='text-xs opacity-70 hover:opacity-100 transition-opacity duration-300 cursor-default flex-shrink-0'
					title={item}
				>
					{item}
				</Badge>
			))}
			{hiddenCount > 0 && (
				<Badge
					variant='secondary'
					className='text-xs flex-shrink-0'
					title={`+${hiddenCount} more: ${array.slice(maxVisible).join(', ')}`}
				>
					+{hiddenCount}
				</Badge>
			)}
		</div>
	)
}
