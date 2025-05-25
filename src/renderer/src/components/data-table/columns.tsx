import { createColumnHelper } from '@tanstack/react-table'

import * as Header from '@renderer/components/data-table/headers'
import * as Cell from '@renderer/components/data-table/cells'

import type { BookRecord } from '@renderer/types/book'

const columnHelper = createColumnHelper<BookRecord>()

export const columns = [
	columnHelper.display({
		id: 'select',
		cell: ({ row }) => <Cell.CellSelect row={row} />,
		enableSorting: false,
		enableHiding: false,
		minSize: 60,
		maxSize: 60,
		size: 60,
	}),

	columnHelper.accessor('title', {
		header: (info) => <Header.HeaderSortable info={info} label='Название' />,
		cell: (info) => info.getValue(),
		minSize: 160,
	}),

	columnHelper.accessor('totalVolumes', {
		header: (info) => <Header.HeaderMenu info={info} label='Т' />,
		cell: (info) => info.getValue(),
		minSize: 60,
		maxSize: 60,
	}),

	columnHelper.accessor('currentVolume', {
		header: (info) => <Header.HeaderMenu info={info} label='№' />,
		cell: (info) => info.getValue(),
		minSize: 60,
		maxSize: 60,
	}),

	columnHelper.accessor('genre', {
		header: (info) => <Header.HeaderSortable info={info} label='Жанр' />,
		cell: (info) => info.getValue(),
		minSize: 160,
	}),

	columnHelper.accessor('content', {
		header: (info) => <Header.HeaderMenu info={info} label='Содержание' />,
		cell: (info) => info.getValue(),
		minSize: 160,
	}),

	columnHelper.accessor('annotation', {
		header: (info) => <Header.HeaderMenu info={info} label='Аннотация' />,
		cell: (info) => info.getValue(),
		minSize: 160,
	}),

	columnHelper.accessor('year', {
		header: (info) => <Header.HeaderMenu info={info} label='Год' />,
		cell: (info) => info.getValue(),
		maxSize: 60,
		minSize: 60,
		size: 60,
	}),

	columnHelper.accessor('tags', {
		header: (info) => <Header.HeaderMenu info={info} label='Ярлыки' />,
		cell: ({ row }) => <Cell.CellMultiSelect array={row.original.tags} />,
		minSize: 160,
	}),

	columnHelper.display({
		id: 'actions',
		cell: ({ row }) => <Cell.CellActions row={row} />,
		enableSorting: false,
		enableHiding: false,
		minSize: 64,
		maxSize: 64,
		size: 64,
	}),
]
