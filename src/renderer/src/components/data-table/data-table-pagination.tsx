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
	const currentPage = table.getState().pagination.pageIndex + 1

	useEffect(() => {
		setInputPage(String(currentPage))
	}, [currentPage])

	const handlePageInputChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		setInputPage(event.target.value)
	}

	const handlePageInput = () => {
		const page = Number(inputPage)
		if (isValidPage(page, totalPages)) {
			table.setPageIndex(page - 1)
		} else {
			setInputPage(String(currentPage))
		}
	}

	const isDisabled = totalPages <= 1

	return (
		<Pagination>
			<PaginationContent className='w-full justify-between'>
				<PaginationItem>
					<PaginationPrevious
						className='border-none'
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
						aria-label='Go to previous page'
					/>
				</PaginationItem>

				<PaginationItem className='flex gap-2 items-center text-sm text-muted-foreground'>
					<span>Page</span>
					<Input
						className={cn(
							'w-12 text-foreground text-center border-none bg-background hover:bg-accent hover:text-accent-foreground focus:bg-background focus-visible:ring-0 focus-visible:ring-offset-0',
							isDisabled && 'pointer-events-none text-muted-foreground',
						)}
						type='number'
						min='1'
						max={totalPages}
						value={inputPage}
						onChange={handlePageInputChange}
						onBlur={() => handlePageInput()}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								handlePageInput()
							}
						}}
						aria-label={`Current page, page ${currentPage} of ${totalPages}`}
					/>
					<span>of {totalPages}</span>
				</PaginationItem>

				<PaginationItem>
					<PaginationNext
						className='border-none'
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
						aria-label='Go to next page'
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	)
}

function isValidPage(page: number, totalPages: number): boolean {
	return (
		!isNaN(page) && Number.isInteger(page) && page >= 1 && page <= totalPages
	)
}
