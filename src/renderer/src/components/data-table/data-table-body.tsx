import { useEffect, useMemo } from 'react'
import { Table as ReactTable } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'

import {
	Table,
	TableBody,
	TableCell,
	TableRow,
} from '@renderer/components/ui/table'
import { CellDefault } from '@renderer/components/data-table/cells'

interface VirtualizedTableBodyProps<TData> {
	table: ReactTable<TData>
	totalTableWidth: number
	rowHeight: number
	tableContainerRef: React.RefObject<HTMLDivElement>
	outerContainerRef: React.RefObject<HTMLDivElement>
	isLoading: boolean
}

export function VirtualizedTableBody<TData>({
	table,
	totalTableWidth,
	rowHeight,
	tableContainerRef,
	outerContainerRef,
	isLoading,
}: VirtualizedTableBodyProps<TData>) {
	const { rows } = table.getRowModel()

	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => tableContainerRef.current,
		estimateSize: () => rowHeight,
		overscan: 10,
	})

	const virtualRows = rowVirtualizer.getVirtualItems()

	useEffect(() => {
		rowVirtualizer.measure()
	}, [rowHeight, rowVirtualizer])

	const tableProps = useMemo(
		() => ({
			style: {
				minWidth: `${totalTableWidth}px`,
				width: '100%',
				tableLayout: 'fixed' as const,
			},
		}),
		[totalTableWidth],
	)

	const handleWheel = (e: React.WheelEvent) => {
		if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
			e.stopPropagation()
			if (outerContainerRef.current) {
				outerContainerRef.current.scrollLeft += e.deltaX
			}
		}
	}

	return (
		<div
			ref={tableContainerRef}
			className='flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide hover:overflow-y-auto'
			onWheel={handleWheel}
		>
			<Table {...tableProps}>
				<TableBody
					style={{
						height: `${rowVirtualizer.getTotalSize()}px`,
						position: 'relative',
					}}
				>
					{isLoading ? (
						<TableRow>
							<TableCell colSpan={virtualRows.length} className='text-center'>
								Загрузка...
							</TableCell>
						</TableRow>
					) : virtualRows.length ? (
						virtualRows.map((virtualItem) => {
							const row = rows[virtualItem.index]
							return (
								<TableRow
									key={virtualItem.key}
									className='absolute top-0 left-0 flex w-full items-center'
									style={{
										height: `${virtualItem.size}px`,
										transform: `translateY(${virtualItem.start}px)`,
									}}
									data-state={row.getIsSelected() && 'selected'}
								>
									{row.getVisibleCells().map((cell) => (
										<CellDefault key={cell.id} cell={cell} />
									))}
								</TableRow>
							)
						})
					) : (
						<TableRow>
							<TableCell colSpan={virtualRows.length} className='text-center'>
								Нет результатов.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	)
}
