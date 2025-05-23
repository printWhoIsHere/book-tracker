import { useEffect, useState } from 'react'
import { Table } from '@tanstack/react-table'

import { Input } from '@renderer/components/ui/input'
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from '@renderer/components/ui/pagination'
import { cn } from '@renderer/lib/utils'

export function TablePagination<TData>({ table }: { table: Table<TData> }) {
	const [inputPage, setInputPage] = useState<string>(
		String(table.getState().pagination.pageIndex + 1),
	)
	const totalPages = table.getPageCount()

	useEffect(() => {
		setInputPage(String(table.getState().pagination.pageIndex + 1))
	}, [table.getState().pagination.pageIndex])

	return (
		<Pagination>
			<PaginationContent className='w-full justify-between'>
				<PaginationItem>
					<PaginationPrevious
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					/>
				</PaginationItem>

				<PaginationItem className='flex gap-2 items-center text-sm text-muted-foreground'>
					<span>Page</span>
					<Input
						className={cn(
							'w-9 text-foreground text-center border-none bg-background hover:bg-accent hover:text-accent-foreground',
							totalPages === 1 && 'pointer-events-none text-muted-foreground',
						)}
						type='number'
						value={inputPage}
						onChange={(event) => setInputPage(event.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								const page = Number(inputPage)
								if (
									!isNaN(page) &&
									Number.isInteger(page) &&
									page >= 1 &&
									page <= totalPages
								) {
									table.setPageIndex(page - 1)
								} else {
									setInputPage(
										String(table.getState().pagination.pageIndex + 1),
									)
								}
							}
						}}
					/>
					<span>of {totalPages}</span>
				</PaginationItem>

				<PaginationItem>
					<PaginationNext
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	)
}
