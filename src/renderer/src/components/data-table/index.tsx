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
import { TablePagination } from '@renderer/components/data-table/data-table-pagination'
import { TableContainer } from '@renderer/components/data-table/data-table-container'
import { VirtualizedTableBody } from '@renderer/components/data-table/data-table-body'
import { TableHeader } from '@renderer/components/data-table/data-table-header'
import type { BookRecord } from '@renderer/types/book'
import { DataTableToolbar } from './data-table-toolbar'

const filterFields: DataTableFilterField<BookRecord>[] = [
	{
		label: 'Search',
		value: 'search',
		placeholder: 'Search in title, content, annotation...',
	},
	{
		label: 'Жанр',
		value: 'genre',
		options: [
			{ label: 'Фантастика', value: 'фантастика' },
			{ label: 'Фэнтези', value: 'фэнтези' },
			{ label: 'Детектив', value: 'детектив' },
			{ label: 'Роман', value: 'роман' },
			{ label: 'Биография', value: 'биография' },
			{ label: 'История', value: 'история' },
			{ label: 'Техническая литература', value: 'техническая литература' },
			{ label: 'Поэзия', value: 'поэзия' },
		],
	},
	{
		label: 'Год',
		value: 'year',
		options: [
			{ label: '2020-2024', value: '2020-2024' },
			{ label: '2015-2019', value: '2015-2019' },
			{ label: '2010-2014', value: '2010-2014' },
			{ label: '2000-2009', value: '2000-2009' },
			{ label: 'Before 2000', value: 'before-2000' },
		],
	},
	{
		label: 'Ярлыки',
		value: 'tags',
		options: [
			{ label: 'Избранное', value: 'избранное' },
			{ label: 'В наличии', value: 'в наличии' },
			{ label: 'Планируется', value: 'планируется' },
			{ label: 'Прочитано', value: 'прочитано' },
			{ label: 'Отложено', value: 'отложено' },
			{ label: 'Нет в наличии', value: 'нет в наличии' },
			{ label: 'Повреждено', value: 'повреждено' },
		],
	},
]

export function DataTable() {
	const { books, isLoading } = useBook()

	const [sorting, setSorting] = useState<SortingState>([])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

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
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onPaginationChange: setPagination,
		enableColumnResizing: true,
		filterFns: {
			multiColumnSearch: (row, columnId, filterValue) => {
				if (!filterValue) return true

				const searchableColumns = ['title', 'content', 'annotation']
				const searchTerm = String(filterValue).toLowerCase()

				return searchableColumns.some((colId) => {
					const cellValue = row.getValue(colId)
					return String(cellValue).toLowerCase().includes(searchTerm)
				})
			},
			yearRange: (row, columnId, filterValue) => {
				if (!filterValue || !Array.isArray(filterValue)) return true

				const year = row.getValue(columnId) as number

				return filterValue.some((range) => {
					switch (range) {
						case '2020-2024':
							return year >= 2020 && year <= 2024
						case '2015-2019':
							return year >= 2015 && year <= 2019
						case '2010-2014':
							return year >= 2010 && year <= 2014
						case '2000-2009':
							return year >= 2000 && year <= 2009
						case 'before-2000':
							return year < 2000
						default:
							return false
					}
				})
			},
			arrayIncludes: (row, columnId, filterValue) => {
				if (!filterValue || !Array.isArray(filterValue)) return true

				const cellValue = row.getValue(columnId) as string[]
				if (!Array.isArray(cellValue)) return false

				return filterValue.some((value) => cellValue.includes(value))
			},
		},
		initialState: {
			pagination: {
				pageIndex: 0,
				pageSize: 10,
			},
		},
		state: {
			sorting,
			columnFilters,
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
				<DataTableToolbar table={table} filterFields={filterFields} />
			</div>

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
