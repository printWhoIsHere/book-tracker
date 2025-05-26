import { useEffect, useMemo, useRef, useState } from 'react'
import {
	getCoreRowModel,
	useReactTable,
	getSortedRowModel,
	SortingState,
	PaginationState,
	getPaginationRowModel,
	getFilteredRowModel,
	ColumnFiltersState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'

import { useBook } from '@renderer/hooks/data/useBook'

import { columns } from '@renderer/components/data-table/columns'
import { DataTablePagination } from '@renderer/components/data-table/data-table-pagination'
import { DataTableContainer } from '@renderer/components/data-table/data-table-container'
import { DataTableBody } from '@renderer/components/data-table/data-table-body'
import { DataTableHeader } from '@renderer/components/data-table/data-table-header'
import type { BookRecord } from '@renderer/types/book'
import { DataTableToolbar } from './data-table-toolbar'
import { generateOptions, groupYears } from '@renderer/utils/table'
import { filterFns } from '@renderer/utils/filters'

export function DataTable() {
	const { books, isLoading } = useBook()

	const [sorting, setSorting] = useState<SortingState>([])
	const [globalFilter, setGlobalFilter] = useState<string>('')
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

	const tableContainerRef = useRef<HTMLDivElement>(null)
	const outerContainerRef = useRef<HTMLDivElement>(null)

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 20,
	})

	const filterFields: DataTableFilterField<BookRecord>[] = useMemo(() => {
		if (!books.length) return []

		return [
			{
				label: 'Search',
				value: 'search',
				placeholder: 'Search in title, content, annotation...',
			},
			{
				label: 'Жанр',
				value: 'genre',
				options: generateOptions(books, 'genre'),
			},
			{
				label: 'Год',
				value: 'year',
				options: groupYears(generateOptions(books, 'year')),
			},
			{
				label: 'Ярлыки',
				value: 'tags',
				options: generateOptions(books, 'tags'),
			},
		]
	}, [books])

	const table = useReactTable({
		data: books,
		columns,
		columnResizeMode: 'onChange',
		columnResizeDirection: 'ltr',
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		globalFilterFn: filterFns.multiColumnSearch,
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onPaginationChange: setPagination,
		enableColumnResizing: true,
		filterFns,
		initialState: {
			pagination: {
				pageIndex: 0,
				pageSize: 10,
			},
		},
		state: {
			sorting,
			columnFilters,
			globalFilter,
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
			<div className='mb-4'>
				<DataTableToolbar
					table={table}
					filterFields={filterFields}
					onGlobalSearch={setGlobalFilter}
				/>
			</div>

			<DataTableContainer
				totalTableWidth={totalTableWidth}
				outerContainerRef={outerContainerRef}
			>
				<DataTableHeader table={table} totalTableWidth={totalTableWidth} />

				<DataTableBody
					table={table}
					totalTableWidth={totalTableWidth}
					rowHeight={64}
					tableContainerRef={tableContainerRef}
					outerContainerRef={outerContainerRef}
					isLoading={isLoading}
				/>
			</DataTableContainer>

			<div className='w-full flex items-center justify-end mt-4'>
				<DataTablePagination table={table} />
			</div>
		</div>
	)
}
