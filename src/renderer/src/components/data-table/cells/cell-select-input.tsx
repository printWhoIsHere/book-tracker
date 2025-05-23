import { Row } from '@tanstack/react-table'
import { Badge } from '@renderer/components/ui/badge'

interface CellSelectInputProps {
	row: Row<Book>
	field: string
}

export function CellSelectInput({ row, field }: CellSelectInputProps) {
	const value = (row.original as any)[field]

	if (!value) return <span className='text-muted-foreground'>—</span>

	return (
		<Badge variant='secondary' className='truncate max-w-full'>
			{value}
		</Badge>
	)
}
