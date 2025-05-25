import { useMemo } from 'react'
import type { Table } from '@tanstack/react-table'
import { Cross } from 'lucide-react'

import { cn } from '@renderer/lib/cn'

import {
	ColumnFilter,
	ColumnSearch,
} from '@renderer/components/data-table/filters'
import { Button } from '@renderer/components/ui/button'

interface DataTableToolbarProps<TData>
	extends React.HTMLAttributes<HTMLDivElement> {
	table: Table<TData>
	filterFields?: DataTableFilterField<TData>[]
}

export function DataTableToolbar<TData>({
	table,
	filterFields = [],
	children,
	className,
	...props
}: DataTableToolbarProps<TData>) {
	const isFiltered = table.getState().columnFilters.length > 0

	const { searchableColumns, filterableColumns } = useMemo(() => {
		return {
			searchableColumns: filterFields.filter((field) => !field.options),
			filterableColumns: filterFields.filter((field) => field.options),
		}
	}, [filterFields])

	return (
		<div
			className={cn(
				'flex w-full items-center justify-between space-x-2 overflow-auto p-1',
				className,
			)}
			{...props}
		>
			<div className='flex flex-1 items-center space-x-2'>
				{searchableColumns.length > 0 &&
					searchableColumns.map(
						(column) =>
							table.getColumn(column.value ? String(column.value) : '') && (
								<ColumnSearch
									key={String(column.value)}
									column={table.getColumn(
										column.value ? String(column.value) : '',
									)}
									placeholder={column.placeholder}
								/>
							),
					)}

				{filterableColumns.length > 0 &&
					filterableColumns.map(
						(column) =>
							table.getColumn(column.value ? String(column.value) : '') && (
								<ColumnFilter
									key={String(column.value)}
									column={table.getColumn(
										column.value ? String(column.value) : '',
									)}
									title={column.label}
									options={column.options ?? []}
								/>
							),
					)}
				{isFiltered && (
					<Button
						aria-label='Reset filters'
						variant='ghost'
						className='h-8 px-2 lg:px-3'
						onClick={() => table.resetColumnFilters()}
					>
						Reset
						<Cross className='ml-2 size-4' aria-hidden='true' />
					</Button>
				)}
			</div>
		</div>
	)
}
