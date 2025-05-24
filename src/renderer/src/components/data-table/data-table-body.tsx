import { useEffect, useMemo } from 'react'
import { Table as ReactTable } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'

import { Table, TableBody, TableRow } from '@renderer/components/ui/table'
import { CellDefault } from '@renderer/components/data-table/cells'

interface VirtualizedTableBodyProps<TData> {
	table: ReactTable<TData>
	totalTableWidth: number
	rowHeight: number
	tableContainerRef: React.RefObject<HTMLDivElement>
	outerContainerRef: React.RefObject<HTMLDivElement>
}

export function VirtualizedTableBody<TData>({
	table,
	totalTableWidth,
	rowHeight,
	tableContainerRef,
	outerContainerRef,
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
			className='flex-1 overflow-y-auto overflow-x-hidden'
			onWheel={handleWheel}
		>
			<Table {...tableProps}>
				<TableBody
					style={{
						height: `${rowVirtualizer.getTotalSize()}px`,
						position: 'relative',
					}}
				>
					{virtualRows.map((virtualItem) => {
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
					})}
				</TableBody>
			</Table>
		</div>
	)
}
