import React, { createContext, useContext, useMemo, useState } from 'react'
import {
	SortingState,
	ColumnFiltersState,
	PaginationState,
	RowSelectionState,
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
} from '@tanstack/react-table'
import { columns } from '@renderer/components/data-table/columns'
import { filterFns } from '@renderer/utils/filters'
import type { BookRecord } from '@renderer/types/book'

interface DataTableContextValue {
	table: any
	totalTableWidth: number
	// Состояния
	sorting: SortingState
	setSorting: (sorting: SortingState) => void
	columnFilters: ColumnFiltersState
	setColumnFilters: (filters: ColumnFiltersState) => void
	globalFilter: string
	setGlobalFilter: (filter: string) => void
	pagination: PaginationState
	setPagination: (pagination: PaginationState) => void
	rowSelection: RowSelectionState
	setRowSelection: (selection: RowSelectionState) => void
	// Фильтры
	filterFields: DataTableFilterField<BookRecord>[]
}

const DataTableContext = createContext<DataTableContextValue | null>(null)

interface DataTableProviderProps {
	children: React.ReactNode
	data: BookRecord[]
}

export function DataTableProvider({ children, data }: DataTableProviderProps) {
	const [sorting, setSorting] = useState<SortingState>([])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [globalFilter, setGlobalFilter] = useState<string>('')
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 20,
	})
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

	const filterFields = useMemo<DataTableFilterField<BookRecord>[]>(() => {
		if (!data.length) return []

		const genreSet = new Set<string>()
		const yearSet = new Set<number>()
		const tagSet = new Set<string>()

		data.forEach((book: BookRecord) => {
			if (book.genre) genreSet.add(book.genre)
			if (book.year) yearSet.add(book.year)
			if (Array.isArray(book.tags)) {
				book.tags.forEach((tag) => tagSet.add(tag))
			}
		})

		return [
			{
				label: 'Search',
				value: 'search',
				placeholder: 'Search in title, content, annotation...',
			},
			{
				label: 'Жанр',
				value: 'genre',
				options: Array.from(genreSet)
					.sort()
					.map((value) => ({ label: value, value })),
			},
			{
				label: 'Год',
				value: 'year',
				options: Array.from(yearSet)
					.sort((a, b) => b - a)
					.map((value) => ({ label: String(value), value: String(value) })),
			},
			{
				label: 'Ярлыки',
				value: 'tags',
				options: Array.from(tagSet)
					.sort()
					.map((value) => ({ label: value, value })),
			},
		]
	}, [data])

	const table = useReactTable({
		data,
		columns,
		columnResizeMode: 'onChange',
		columnResizeDirection: 'ltr',
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		globalFilterFn: filterFns.multiColumnSearch,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onPaginationChange: setPagination,
		onRowSelectionChange: setRowSelection,
		enableColumnResizing: true,
		enableRowSelection: true,
		filterFns,
		state: {
			sorting,
			columnFilters,
			globalFilter,
			pagination,
			rowSelection,
		},
	})

	const totalTableWidth = useMemo(() => {
		return table.getTotalSize()
	}, [table.getState().columnSizing])

	const contextValue = useMemo(
		() => ({
			table,
			totalTableWidth,
			sorting,
			setSorting,
			columnFilters,
			setColumnFilters,
			globalFilter,
			setGlobalFilter,
			pagination,
			setPagination,
			rowSelection,
			setRowSelection,
			filterFields,
		}),
		[
			table,
			totalTableWidth,
			sorting,
			columnFilters,
			globalFilter,
			pagination,
			rowSelection,
			filterFields,
		],
	)

	return (
		<DataTableContext.Provider value={contextValue}>
			{children}
		</DataTableContext.Provider>
	)
}

export function useDataTable() {
	const context = useContext(DataTableContext)
	if (!context) {
		throw new Error('useDataTable must be used within DataTableProvider')
	}
	return context
}
