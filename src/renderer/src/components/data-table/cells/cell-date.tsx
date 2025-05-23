import { Row } from '@tanstack/react-table'
import { format, parseISO, isValid } from 'date-fns'
import { ru } from 'date-fns/locale'

interface CellDateProps {
	row: Row<Book>
	field: string
}

export function CellDate({ row, field }: CellDateProps) {
	const value = (row.original as any)[field]

	if (!value) return <span className='text-muted-foreground'>—</span>

	try {
		const date = typeof value === 'string' ? parseISO(value) : new Date(value)

		if (!isValid(date)) {
			return <span className='text-muted-foreground'>—</span>
		}

		return (
			<div className='font-mono text-sm'>
				{format(date, 'dd.MM.yyyy', { locale: ru })}
			</div>
		)
	} catch {
		return <span className='text-muted-foreground'>—</span>
	}
}
