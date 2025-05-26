import { createColumnHelper } from '@tanstack/react-table'

import { formatFullName } from '@renderer/utils/table'
import { filterFns } from '@renderer/utils/filters'
import type { BookRecord } from '@renderer/types/book'

import * as Header from '@renderer/components/data-table/headers'
import * as Cell from '@renderer/components/data-table/cells'

const columnHelper = createColumnHelper<BookRecord>()

export const columns = [
	columnHelper.display({
		id: 'select',
		cell: ({ row }) => <Cell.CellSelect row={row} />,
		enableSorting: false,
		enableHiding: false,
		enableColumnFilter: false,
		enableGlobalFilter: false,
		minSize: 32,
		maxSize: 32,
		size: 32,
	}),

	columnHelper.accessor('title', {
		header: (info) => <Header.HeaderSortable info={info} label='Название' />,
		cell: (info) => (
			<Cell.CellHighlight
				value={info.getValue()}
				searchTerm={info.table.getState().globalFilter || ''}
			/>
		),
		enableColumnFilter: false,
		enableGlobalFilter: true,
		minSize: 160,
		filterFn: 'includesString',
	}),

	columnHelper.accessor('totalVolumes', {
		header: (info) => <Header.HeaderMenu info={info} label='Т' />,
		cell: (info) => info.getValue() || '-',
		enableColumnFilter: false,
		enableGlobalFilter: false,
		minSize: 48,
		maxSize: 48,
	}),

	columnHelper.accessor('currentVolume', {
		header: (info) => <Header.HeaderMenu info={info} label='№' />,
		cell: (info) => info.getValue() || '-',
		enableColumnFilter: false,
		enableGlobalFilter: false,
		minSize: 48,
		maxSize: 48,
	}),

	columnHelper.accessor(
		(row) => formatFullName(row.lastName, row.firstName, row.middleName),
		{
			id: 'author',
			header: (info) => <Header.HeaderSortable info={info} label='Автор' />,
			cell: (info) => (
				<Cell.CellHighlight
					value={info.getValue()}
					searchTerm={info.table.getState().globalFilter || ''}
				/>
			),
			enableColumnFilter: false,
			enableGlobalFilter: true,
			minSize: 160,
			filterFn: 'includesString',
		},
	),

	columnHelper.accessor('genre', {
		header: (info) => <Header.HeaderMenu info={info} label='Жанр' />,
		cell: (info) => info.getValue() || '-',
		filterFn: filterFns.columnGenreFilter,
		enableGlobalFilter: false,
		minSize: 160,
	}),

	columnHelper.accessor('content', {
		header: (info) => <Header.HeaderMenu info={info} label='Содержание' />,
		cell: (info) => (
			<Cell.CellHighlight
				value={info.getValue()}
				searchTerm={info.table.getState().globalFilter || ''}
			/>
		),
		enableColumnFilter: false,
		enableGlobalFilter: true,
		minSize: 160,
		filterFn: 'includesString',
	}),

	columnHelper.accessor('annotation', {
		header: (info) => <Header.HeaderMenu info={info} label='Аннотация' />,
		cell: (info) => (
			<Cell.CellHighlight
				value={info.getValue()}
				searchTerm={info.table.getState().globalFilter || ''}
			/>
		),
		enableColumnFilter: false,
		enableGlobalFilter: true,
		minSize: 164,
		filterFn: 'includesString',
	}),

	columnHelper.accessor('year', {
		header: (info) => <Header.HeaderMenu info={info} label='Год' />,
		cell: (info) => info.getValue() || '-',
		filterFn: filterFns.columnYearFilter,
		enableGlobalFilter: false,
		maxSize: 64,
		minSize: 64,
		size: 64,
	}),

	columnHelper.accessor('tags', {
		header: (info) => <Header.HeaderMenu info={info} label='Ярлыки' />,
		cell: ({ row }) => <Cell.CellMultiSelect array={row.original.tags || []} />,
		filterFn: filterFns.columnTagsFilter,
		enableGlobalFilter: false,
		minSize: 164,
	}),

	columnHelper.display({
		id: 'actions',
		cell: ({ row }) => <Cell.CellActions row={row} />,
		enableSorting: false,
		enableHiding: false,
		enableColumnFilter: false,
		enableGlobalFilter: false,
		minSize: 64,
		maxSize: 64,
		size: 64,
	}),
]
