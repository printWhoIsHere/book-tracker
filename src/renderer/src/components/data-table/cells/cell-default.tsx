import { Cell, flexRender } from '@tanstack/react-table'
import { TableCell } from '@renderer/components/ui/table'
import { cn } from '@renderer/lib/utils'

interface CellDefaultProps<TData> {
	cell: Cell<TData, unknown>
}

export function CellDefault<TData>({ cell }: CellDefaultProps<TData>) {
	const lines = 1

	const multilineStyle =
		lines > 1
			? {
					display: '-webkit-box',
					WebkitBoxOrient: 'vertical' as const,
					WebkitLineClamp: lines,
					overflow: 'hidden',
				}
			: {}

	return (
		<TableCell
			key={cell.id}
			className={cn('p-0')}
			style={{
				width: cell.column.getSize(),
				minWidth: cell.column.columnDef.minSize ?? 60,
				flex: `0 0 ${cell.column.getSize()}px`,
			}}
		>
			<div
				className={cn(
					'block align-middle max-w-full px-3 overflow-hidden',
					lines === 1 ? 'whitespace-nowrap text-ellipsis' : 'whitespace-normal',
				)}
				style={multilineStyle}
				title={String(cell.getValue())}
			>
				{flexRender(cell.column.columnDef.cell, cell.getContext())}
			</div>
		</TableCell>
	)
}
