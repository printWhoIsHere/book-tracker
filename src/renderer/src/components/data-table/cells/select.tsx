import { Row } from '@tanstack/react-table'

import { Checkbox } from '@renderer/components/ui/checkbox'

export function CellSelect({ row }: { row: Row<Book> }) {
	return (
		<Checkbox
			className=' flex items-center border-foreground/50 data-[state=checked]:border-primary'
			checked={row.getIsSelected()}
			onCheckedChange={(value) => row.toggleSelected(!!value)}
			onClick={(e) => e.stopPropagation()}
			aria-label='Выбрать строку'
		/>
	)
}
