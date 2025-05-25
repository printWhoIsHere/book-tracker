import { HeaderContext } from '@tanstack/react-table'
import { MoveDown, MoveUp } from 'lucide-react'

import { cn } from '@renderer/lib/cn'
import type { BookRecord } from '@renderer/types/book'

import { ColumnContextMenu } from '@renderer/components/data-table/headers'

interface HeaderSortableProps<T> {
	info: HeaderContext<BookRecord, T>
	label: string
}

export function HeaderSortable<TValue>({
	info,
	label,
}: HeaderSortableProps<TValue>) {
	const { column } = info
	const sorted = column.getIsSorted()

	const handleSort = (e: React.PointerEvent) => {
		e.preventDefault()
		column.toggleSorting(sorted === 'asc')
	}

	return (
		<ColumnContextMenu info={info}>
			<div className='flex flex-1'>
				<button
					type='button'
					title={`Sort by ${label}`}
					onPointerDown={handleSort}
					className='group w-full h-full flex flex-row rounded-md items-center justify-start gap-1 cursor-default hover:text-accent-foreground'
				>
					{label}
				</button>
				<span className='flex items-center'>
					<MoveUp
						className={cn(
							'w-4 h-4 transition-all duration-300 transform-gpu',
							sorted !== 'desc'
								? 'opacity-0 translate-x-2 group-hover:opacity-70 group-hover:translate-x-0'
								: 'opacity-100 text-foreground translate-x-0',
						)}
					/>
					<MoveDown
						className={cn(
							'w-4 h-4 -ml-2 transition-all duration-300 transform-gpu',
							sorted !== 'asc'
								? 'opacity-0 -translate-x-2 group-hover:opacity-70 group-hover:translate-x-0'
								: 'opacity-100 text-foreground translate-x-0',
						)}
					/>
				</span>
			</div>
		</ColumnContextMenu>
	)
}
