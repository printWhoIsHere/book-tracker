import { Row } from '@tanstack/react-table'

interface CellTextProps {
	row: Row<Book>
	field: string
}

export function CellText({ row, field }: CellTextProps) {
	const value = (row.original as any)[field]

	if (!value) return <span className='text-muted-foreground'>—</span>

	return (
		<div className='truncate max-w-full' title={value}>
			{value}
		</div>
	)
}
