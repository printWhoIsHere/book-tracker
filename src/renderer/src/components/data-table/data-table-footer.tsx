import { Table, RowSelectionState } from '@tanstack/react-table'
import { Button } from '@renderer/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@renderer/components/ui/select'
import { DataTablePagination } from '@renderer/components/data-table/data-table-pagination'

interface DataTableFooterProps<TData> {
	table: Table<TData>
	selectedRows: RowSelectionState
}

export function DataTableFooter<TData>({
	table,
	selectedRows,
}: DataTableFooterProps<TData>) {
	const selectedCount = Object.keys(selectedRows).length

	return (
		<div className='flex items-center justify-between mt-4'>
			<div className='flex-1'>
				{selectedCount > 0 && (
					<Button
						variant='destructive'
						size='sm'
						onClick={() => {
							// TODO: implement delete action
							console.log('Delete selected rows:', selectedRows)
						}}
					>
						Delete ({selectedCount})
					</Button>
				)}
			</div>

			<div className='flex items-center space-x-2'>
				<Select
					value={String(table.getState().pagination.pageSize)}
					onValueChange={(value) => table.setPageSize(Number(value))}
				>
					<span className='text-muted-foreground'>Rows per page</span>
					<SelectTrigger className='w-[120px]'>
						<SelectValue placeholder='Size' />
					</SelectTrigger>
					<SelectContent>
						{[10, 20, 50, 100, 250, 500].map((size) => (
							<SelectItem key={size} value={String(size)}>
								{size}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<DataTablePagination table={table} />
			</div>
		</div>
	)
}
