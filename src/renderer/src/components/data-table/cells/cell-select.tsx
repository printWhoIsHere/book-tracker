import { Row } from '@tanstack/react-table'

import { Checkbox } from '@renderer/components/ui/checkbox'

interface CellSelectProps<TData> {
	row: Row<TData>
}

export function CellSelect<TData>({ row }: CellSelectProps<TData>) {
	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation()
	}

	return (
		<Checkbox
			className='flex items-center border-foreground/50 data-[state=checked]:border-primary'
			checked={row.getIsSelected()}
			onCheckedChange={(value) => row.toggleSelected(!!value)}
			onClick={handleClick}
			aria-label='Select row'
		/>
	)
}
