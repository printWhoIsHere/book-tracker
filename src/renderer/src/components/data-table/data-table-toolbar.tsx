import { useMemo, useState, useEffect } from 'react'
import { RowSelectionState, Table } from '@tanstack/react-table'
import { RotateCcw } from 'lucide-react'

import { cn } from '@renderer/lib/cn'
import { useDebounce } from '@renderer/hooks/useDebounce'
import type { BookRecord } from '@renderer/types/book'

import {
	ColumnFilter,
	GlobalSearch,
} from '@renderer/components/data-table/filters'
import { Button } from '@renderer/components/ui/button'

interface DataTableToolbarProps<TData>
	extends React.HTMLAttributes<HTMLDivElement> {
	table: Table<TData>
	globalFilter: string
	setGlobalFilter: (filter: string) => void
	filterFields: DataTableFilterField<BookRecord>[]
	reverse?: boolean
}

export function DataTableToolbar<TData>({
	table,
	globalFilter,
	setGlobalFilter,
	filterFields,
	children,
	className,
	reverse,
	...props
}: DataTableToolbarProps<TData>) {
	const [searchValue, setSearchValue] = useState(globalFilter)
	const debouncedSearchValue = useDebounce(searchValue, 300)

	useEffect(() => {
		setGlobalFilter(debouncedSearchValue)
	}, [debouncedSearchValue, setGlobalFilter])

	const isFiltered = table.getState().columnFilters.length > 0
	const isSorted = table.getState().sorting.length > 0
	const isSelected = table.getSelectedRowModel().rows.length > 0

	const { filterableFields } = useMemo(() => {
		return {
			filterableFields: filterFields.filter((f) => f.options),
		}
	}, [filterFields])

	const shouldShowReset = isFiltered || isSorted || globalFilter || isSelected

	const handleReset = () => {
		table.resetColumnFilters()
		table.resetSorting()
		table.resetRowSelection()
		setGlobalFilter('')
		setSearchValue('')
	}

	return (
		<div
			className={cn(
				'flex w-full items-center justify-between space-x-2 overflow-auto p-1',
				className,
			)}
			{...props}
		>
			<div
				className={cn(
					'flex flex-1 items-center space-x-2',
					reverse && 'flex-row-reverse',
				)}
			>
				<GlobalSearch value={searchValue} onChange={setSearchValue} />

				{filterableFields.map((column) => {
					const tableColumn = table.getColumn(String(column.value))
					return tableColumn ? (
						<ColumnFilter
							key={String(column.value)}
							column={tableColumn}
							title={column.label}
							options={column.options ?? []}
						/>
					) : null
				})}

				{shouldShowReset && (
					<Button
						aria-label='Reset filters and sorting'
						variant='ghost'
						className='h-8 px-2 lg:px-3'
						onClick={handleReset}
					>
						<RotateCcw className='ml-2 size-4' aria-hidden='true' />
						Reset
					</Button>
				)}
			</div>
			{children}
		</div>
	)
}
