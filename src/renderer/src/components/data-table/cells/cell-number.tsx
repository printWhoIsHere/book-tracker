import { Row } from '@tanstack/react-table'

interface CellNumberProps {
	row: Row<Book>
	field: string
}

export function CellNumber({ row, field }: CellNumberProps) {
	const value = (row.original as any)[field]

	if (value === null || value === undefined) {
		return <span className='text-muted-foreground'>—</span>
	}

	return (
		<div className='text-right font-mono'>
			{typeof value === 'number' ? value : Number(value) || 0}
		</div>
	)
}
