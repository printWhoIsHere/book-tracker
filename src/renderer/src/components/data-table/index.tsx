import { useEffect, useMemo, useRef, useState } from 'react'
import {
	getCoreRowModel,
	useReactTable,
	getSortedRowModel,
	SortingState,
	PaginationState,
	getPaginationRowModel,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'

import { useBook } from '@renderer/hooks/data/useBook'

import { columns } from '@renderer/components/data-table/columns'
import { TablePagination } from '@renderer/components/data-table/data-table-pagination'
import { TableContainer } from '@renderer/components/data-table/data-table-container'
import { VirtualizedTableBody } from '@renderer/components/data-table/data-table-body'
import { TableHeader } from '@renderer/components/data-table/data-table-header'

export function DataTable() {
	const { books, isLoading } = useBook()

	const [sorting, setSorting] = useState<SortingState>([])

	const tableContainerRef = useRef<HTMLDivElement>(null)
	const outerContainerRef = useRef<HTMLDivElement>(null)

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 20,
	})

	const table = useReactTable({
		data: books,
		columns,
		columnResizeMode: 'onChange',
		columnResizeDirection: 'ltr',
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		onPaginationChange: setPagination,
		enableColumnResizing: true,
		initialState: {
			pagination: {
				pageIndex: 0,
				pageSize: 5,
			},
		},
		state: {
			sorting,
			pagination,
		},
	})

	const { rows } = table.getRowModel()
	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => tableContainerRef.current,
		estimateSize: () => 64,
		overscan: 10,
	})

	useEffect(() => {
		rowVirtualizer.measure()
	}, [64, rowVirtualizer])

	const totalTableWidth = useMemo(() => {
		return table.getTotalSize()
	}, [table.getState().columnSizing])

	return (
		<div className='flex flex-col flex-1 overflow-hidden min-h-0'>
			<TableContainer
				totalTableWidth={totalTableWidth}
				outerContainerRef={outerContainerRef}
			>
				<TableHeader table={table} totalTableWidth={totalTableWidth} />

				<VirtualizedTableBody
					table={table}
					totalTableWidth={totalTableWidth}
					rowHeight={64}
					tableContainerRef={tableContainerRef}
					outerContainerRef={outerContainerRef}
					isLoading={isLoading}
				/>
			</TableContainer>

			<div className='w-full flex items-center justify-end mt-4'>
				<TablePagination table={table} />
			</div>
		</div>
	)
}
