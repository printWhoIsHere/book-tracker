import { useCallback, useMemo, memo } from 'react'
import type { Table as TableType, Row, Cell } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'

import * as Table from '@renderer/components/ui/table'
import { CellDefault } from '@renderer/components/data-table/cells'

interface DataTableBodyProps<TData> {
	table: TableType<TData>
	totalTableWidth: number
	rowHeight: number
	tableContainerRef: React.RefObject<HTMLDivElement>
	outerContainerRef: React.RefObject<HTMLDivElement>
}

export const DataTableBody = memo(function DataTableBody<TData>({
	table,
	totalTableWidth,
	rowHeight,
	tableContainerRef,
	outerContainerRef,
}: DataTableBodyProps<TData>) {
	const { rows } = table.getRowModel()

	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => tableContainerRef.current,
		estimateSize: useCallback(() => rowHeight, [rowHeight]),
		overscan: 3,
	})

	const virtualRows = rowVirtualizer.getVirtualItems()

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

	const handleWheel = useCallback(
		(e: React.WheelEvent) => {
			if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
				e.stopPropagation()
				if (outerContainerRef.current) {
					outerContainerRef.current.scrollLeft += e.deltaX
				}
			}
		},
		[outerContainerRef],
	)

	const bodyStyle = useMemo(
		() => ({
			height: `${rowVirtualizer.getTotalSize()}px`,
			position: 'relative' as const,
		}),
		[rowVirtualizer.getTotalSize()],
	)

	if (!virtualRows.length) {
		return (
			<div
				ref={tableContainerRef}
				className='flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide'
			>
				<Table.Table {...tableProps}>
					<Table.TableBody>
						<Table.TableRow>
							<Table.TableCell
								colSpan={table.getAllColumns().length}
								className='text-center py-8'
							>
								<div className='text-muted-foreground'>
									<div className='text-lg mb-2'>📚</div>
									<div>Нет результатов</div>
									<div className='text-sm'>
										Попробуйте изменить параметры поиска
									</div>
								</div>
							</Table.TableCell>
						</Table.TableRow>
					</Table.TableBody>
				</Table.Table>
			</div>
		)
	}

	return (
		<div
			ref={tableContainerRef}
			className='flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide hover:overflow-y-auto'
			onWheel={handleWheel}
		>
			<Table.Table {...tableProps}>
				<Table.TableBody style={bodyStyle}>
					{virtualRows.map((virtualItem) => {
						const row = rows[virtualItem.index]
						return (
							<VirtualRow<TData>
								key={virtualItem.key}
								row={row}
								virtualItem={virtualItem}
								style={{
									height: `${virtualItem.size}px`,
									transform: `translateY(${virtualItem.start}px)`,
								}}
							/>
						)
					})}
				</Table.TableBody>
			</Table.Table>
		</div>
	)
}) as <TData>(props: DataTableBodyProps<TData>) => JSX.Element

interface VirtualRowProps<TData> {
	row: Row<TData>
	virtualItem: any
	style: React.CSSProperties
}

const VirtualRow = memo(function VirtualRow<TData>({
	row,
	virtualItem,
	style,
}: VirtualRowProps<TData>) {
	return (
		<Table.TableRow
			className='absolute top-0 left-0 flex w-full items-center hover:bg-muted/50 transition-colors'
			style={style}
			data-state={row.getIsSelected() && 'selected'}
		>
			{row.getVisibleCells().map((cell: Cell<TData, unknown>) => (
				<CellDefault key={cell.id} cell={cell} />
			))}
		</Table.TableRow>
	)
}) as <TData>(props: VirtualRowProps<TData>) => JSX.Element
