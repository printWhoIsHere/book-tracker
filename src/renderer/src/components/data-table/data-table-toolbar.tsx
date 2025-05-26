import { useMemo, useState, useEffect } from 'react'
import { RotateCcw } from 'lucide-react'

import { cn } from '@renderer/lib/cn'
import { useDebounce } from '@renderer/hooks/useDebounce'
import { useDataTable } from '@renderer/providers/data-table-provider'

import { ColumnFilter } from '@renderer/components/data-table/filters'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'

interface DataTableToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
	reverse?: boolean
}

export function DataTableToolbar({
	children,
	className,
	reverse,
	...props
}: DataTableToolbarProps) {
	const { table, globalFilter, setGlobalFilter, filterFields } = useDataTable()

	const [searchValue, setSearchValue] = useState(globalFilter)
	const debouncedSearchValue = useDebounce(searchValue, 300)

	useEffect(() => {
		setGlobalFilter(debouncedSearchValue)
	}, [debouncedSearchValue, setGlobalFilter])

	const isFiltered = table.getState().columnFilters.length > 0
	const isSorted = table.getState().sorting.length > 0

	const { globalField, filterableFields } = useMemo(() => {
		const gf = filterFields.find((f) => f.value === 'search')
		return {
			globalField: gf,
			filterableFields: filterFields.filter(
				(f) => f.options && f.value !== 'search',
			),
		}
	}, [filterFields])

	const shouldShowReset = isFiltered || isSorted || globalFilter

	const handleReset = () => {
		table.resetColumnFilters()
		table.resetSorting()
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
				{globalField && (
					// TODO: Вынести в GlobalSearch.tsx (переписать)
					<Input
						type='text'
						value={searchValue}
						onChange={(e) => setSearchValue(e.target.value)}
						placeholder={globalField.placeholder}
					/>
				)}

				{filterableFields.map(
					// TODO: Типизировапть
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
