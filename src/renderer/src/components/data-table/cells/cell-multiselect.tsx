import { Row } from '@tanstack/react-table'
import { Badge } from '@renderer/components/ui/badge'

interface CellMultiSelectProps {
	row: Row<Book>
	field: string
}

export function CellMultiSelect({ row, field }: CellMultiSelectProps) {
	const value = (row.original as any)[field]

	if (!value || !Array.isArray(value) || value.length === 0) {
		return <span className='text-muted-foreground'>—</span>
	}

	return (
		<div className='flex flex-wrap gap-1 max-w-full'>
			{value.slice(0, 3).map((item, index) => (
				<Badge
					key={index}
					variant='outline'
					className='text-xs truncate max-w-20'
					title={item}
				>
					{item}
				</Badge>
			))}
			{value.length > 3 && (
				<Badge variant='secondary' className='text-xs'>
					+{value.length - 3}
				</Badge>
			)}
		</div>
	)
}
