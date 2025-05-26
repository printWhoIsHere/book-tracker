import { useMemo } from 'react'
import type { Table } from '@tanstack/react-table'
import { RotateCcw } from 'lucide-react'

import { cn } from '@renderer/lib/cn'

import {
	ColumnFilter,
	ColumnSearch,
} from '@renderer/components/data-table/filters'
import { Button } from '@renderer/components/ui/button'
import { Input } from '../ui/input'

interface DataTableToolbarProps<TData>
	extends React.HTMLAttributes<HTMLDivElement> {
	table: Table<TData>
	filterFields?: DataTableFilterField<TData>[]
	onGlobalSearch?: (value: string) => void
}

export function DataTableToolbar<TData>({
	table,
	filterFields = [],
	onGlobalSearch,
	children,
	className,
	...props
}: DataTableToolbarProps<TData>) {
	const isFiltered = table.getState().columnFilters.length > 0
	const isSorted = table.getState().sorting.length > 0

	const { globalField, searchableFields, filterableFields } = useMemo(() => {
		const gf = filterFields.find((f) => f.value === 'search')
		return {
			globalField: gf,
			searchableFields: [],
			filterableFields: filterFields.filter(
				(f) => f.options && f.value !== 'search',
			),
		}
	}, [filterFields])

	const shouldShowReset =
		isFiltered || isSorted || table.getState().globalFilter

	const handleReset = () => {
		table.resetColumnFilters()
		table.resetSorting()
		table.resetGlobalFilter()
	}

	return (
		<div
			className={cn(
				'flex w-full items-center justify-between space-x-2 overflow-auto p-1',
				className,
			)}
			{...props}
		>
			<div className='flex flex-1 items-center space-x-2'>
				{globalField && onGlobalSearch && (
					<Input
						type='text'
						value={table.getState().globalFilter ?? ''}
						onChange={(e) => onGlobalSearch(e.target.value)}
						placeholder={globalField.placeholder}
						className='input input-sm'
					/>
				)}

				{filterableFields.map(
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
