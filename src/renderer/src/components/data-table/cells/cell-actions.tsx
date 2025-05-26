import { Row } from '@tanstack/react-table'
import { BookOpenText, MoreHorizontal, PenSquare, Trash } from 'lucide-react'

import { useBook } from '@renderer/hooks/data/useBook'
import { useModal } from '@renderer/hooks/useModal'
import type { BookRecord } from '@renderer/types/book'

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '@renderer/components/ui/dropdown-menu'
import { Button } from '@renderer/components/ui/button'

interface CellActionsProps<TData> {
	row: Row<TData>
}

export function CellActions<TData>({ row }: CellActionsProps<TData>) {
	const { deleteBook } = useBook()
	const { openModal } = useModal()

	const bookData = row.original as BookRecord

	const handleEdit = () => {
		// TODO: implement edit action
		console.log('click edit')
	}

	const handleViewDetails = () => {
		// TODO: implement view details action
		console.log('click details')
	}

	const handleDelete = async () => {
		if (window.confirm('Вы уверены, что хотите удалить эту книгу?')) {
			try {
				await deleteBook(bookData.id)
			} catch (error) {
				console.error('Ошибка при удалении книги:', error)
			}
		}
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='ghost' aria-label='Open actions menu' title='Actions'>
					<MoreHorizontal className='w-4 h-4' />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align='end'
				onCloseAutoFocus={(e) => e.preventDefault()}
			>
				<DropdownMenuLabel className='font-normal text-xs text-foreground/70 cursor-default select-none'>
					Actions
				</DropdownMenuLabel>

				<DropdownMenuItem onClick={handleEdit}>
					<PenSquare className='mr-2 h-4 w-4' />
					Edit
				</DropdownMenuItem>

				<DropdownMenuItem onClick={handleViewDetails}>
					<BookOpenText className='mr-2 h-4 w-4' />
					Details
				</DropdownMenuItem>

				<DropdownMenuItem className='text-destructive' onClick={handleDelete}>
					<Trash className='mr-2 h-4 w-4' />
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
