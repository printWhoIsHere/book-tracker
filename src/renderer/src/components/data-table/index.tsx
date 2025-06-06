import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	SortingState,
	ColumnFiltersState,
	PaginationState,
	RowSelectionState,
} from '@tanstack/react-table'

import { useWorkspaceSettings } from '@renderer/hooks/data/useWorkspace'
import { filterFns } from '@renderer/utils/filters'
import {
	generateOptions,
	getRowHeight,
	groupYears,
} from '@renderer/utils/table'
import type { BookRecord } from '@renderer/types/book'

import { columns } from '@renderer/components/data-table/columns'
import { DataTableToolbar } from '@renderer/components/data-table/data-table-toolbar'
import { DataTableContainer } from '@renderer/components/data-table/data-table-container'
import { DataTableBody } from '@renderer/components/data-table/data-table-body'
import { DataTableHeader } from '@renderer/components/data-table/data-table-header'
import { DataTableFooter } from '@renderer/components/data-table/data-table-footer'

interface DataTableProps {
	data: BookRecord[]
}

export function DataTable({ data }: DataTableProps) {
	const { settings } = useWorkspaceSettings()

	const [sorting, setSorting] = useState<SortingState>([])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [globalFilter, setGlobalFilter] = useState<string>('')
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 20,
	})
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

	const rowHeight = useMemo(() => {
		return getRowHeight(settings?.table.rowHeight)
	}, [settings?.table.rowHeight])

	const filterFields = React.useMemo<DataTableFilterField<BookRecord>[]>(() => {
		if (data.length === 0) return []

		const genres = new Set<string>()
		const years = new Set<number>()
		const tags = new Set<string>()

		data.forEach((book: BookRecord) => {
			book.genre && genres.add(book.genre)
			book.year && years.add(book.year)
			book.tags?.forEach((tag) => tags.add(tag))
		})

		return [
			{
				label: 'Жанр',
				value: 'genre',
				options: generateOptions(data, 'genre'),
			},
			{
				label: 'Год',
				value: 'year',
				options: groupYears(generateOptions(data, 'year')),
			},
			{
				label: 'Ярлык',
				value: 'tags',
				options: generateOptions(data, 'tags'),
			},
		]
	}, [data])

	const table = useReactTable<BookRecord>({
		data,
		columns,
		filterFns,
		state: {
			sorting,
			columnFilters,
			globalFilter,
			pagination,
			rowSelection,
		},
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		onPaginationChange: setPagination,
		onRowSelectionChange: setRowSelection,
		globalFilterFn: filterFns.columnGlobalFilter,
		columnResizeMode: 'onChange',
		enableColumnResizing: true,
		enableRowSelection: true,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	})

	const totalTableWidth = useMemo(() => {
		return table.getTotalSize()
	}, [table.getState().columnSizing])

	const tableContainerRef = useRef<HTMLDivElement>(null)
	const outerContainerRef = useRef<HTMLDivElement>(null)

	return (
		<div className='flex flex-col flex-1 overflow-hidden'>
			<DataTableToolbar
				table={table}
				globalFilter={globalFilter}
				setGlobalFilter={setGlobalFilter}
				filterFields={filterFields}
			/>

			<DataTableContainer
				totalTableWidth={totalTableWidth}
				outerContainerRef={outerContainerRef}
			>
				<DataTableHeader table={table} totalTableWidth={totalTableWidth} />
				<DataTableBody
					table={table}
					totalTableWidth={totalTableWidth}
					rowHeight={rowHeight}
					tableContainerRef={tableContainerRef}
					outerContainerRef={outerContainerRef}
				/>
			</DataTableContainer>

			<DataTableFooter table={table} selectedRows={rowSelection} />
		</div>
	)
}
