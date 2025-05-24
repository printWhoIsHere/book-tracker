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

import { useWorkspace } from '@renderer/hooks/useWorkspace'
import { columns, Payment } from './columns'
import { TablePagination } from './data-table-pagination'
import { TableContainer } from './data-table-container'
import { VirtualizedTableBody } from './data-table-body'
import { TableHeader } from './data-table-header'

const data: Payment[] = [
	{
		id: 'm5gr84i9',
		amount: 316,
		status: 'success',
		email: 'ken99@example.com',
	},
	{
		id: '3u1reuv4',
		amount: 242,
		status: 'success',
		email: 'Abe45@example.com',
	},
	{
		id: 'derv1ws0',
		amount: 837,
		status: 'processing',
		email: 'Monserrat44@example.com',
	},
	{
		id: '5kma53ae',
		amount: 874,
		status: 'success',
		email: 'Silas22@example.com',
	},
	{
		id: 'bhqecj4p',
		amount: 721,
		status: 'failed',
		email: 'carmella@example.com',
	},
	{
		id: 'm5gr84i9',
		amount: 316,
		status: 'success',
		email: 'ken99@example.com',
	},
	{
		id: '3u1reuv4',
		amount: 242,
		status: 'success',
		email: 'Abe45@example.com',
	},
	{
		id: 'derv1ws0',
		amount: 837,
		status: 'processing',
		email: 'Monserrat44@example.com',
	},
	{
		id: '5kma53ae',
		amount: 874,
		status: 'success',
		email: 'Silas22@example.com',
	},
	{
		id: 'bhqecj4p',
		amount: 721,
		status: 'failed',
		email: 'carmella@example.com',
	},
	{
		id: 'm5gr84i9',
		amount: 316,
		status: 'success',
		email: 'ken99@example.com',
	},
	{
		id: '3u1reuv4',
		amount: 242,
		status: 'success',
		email: 'Abe45@example.com',
	},
	{
		id: 'derv1ws0',
		amount: 837,
		status: 'processing',
		email: 'Monserrat44@example.com',
	},
	{
		id: '5kma53ae',
		amount: 874,
		status: 'success',
		email: 'Silas22@example.com',
	},
	{
		id: 'bhqecj4p',
		amount: 721,
		status: 'failed',
		email: 'carmella@example.com',
	},
]

export function DataTable() {
	const {} = useWorkspace()
	const [sorting, setSorting] = useState<SortingState>([])

	const tableContainerRef = useRef<HTMLDivElement>(null)
	const outerContainerRef = useRef<HTMLDivElement>(null)

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 20,
	})

	const table = useReactTable({
		data,
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
				/>
			</TableContainer>

			<div className='w-full flex items-center justify-end mt-4'>
				<TablePagination table={table} />
			</div>
		</div>
	)
}
