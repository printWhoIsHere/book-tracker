import { Cell, flexRender } from '@tanstack/react-table'

import { cn } from '@renderer/lib/cn'

import { TableCell } from '@renderer/components/ui/table'
import { useWorkspaceSettings } from '@renderer/hooks/data/useWorkspace'
import { getMaxLines } from '@renderer/utils/table'

interface CellDefaultProps<TData> {
	cell: Cell<TData, unknown>
}

export function CellDefault<TData>({ cell }: CellDefaultProps<TData>) {
	const { settings } = useWorkspaceSettings()
	const lines = getMaxLines(settings?.table.rowHeight)

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
			className='p-0'
			style={{
				width: cell.column.getSize(),
				minWidth: cell.column.columnDef.minSize ?? 60,
				flex: `0 0 ${cell.column.getSize()}px`,
			}}
		>
			<div
				className={cn(
					'block align-middle max-w-full px-3',
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
