import { HeaderContext } from '@tanstack/react-table'
import {
	ContextMenu,
	ContextMenuCheckboxItem,
	ContextMenuContent,
	ContextMenuTrigger,
} from '@renderer/components/ui/context-menu'
import { MoveDown, MoveUp } from 'lucide-react'
import { cn } from '@renderer/lib/utils'

interface DefaultHeaderProps<T> {
	info: HeaderContext<Book, T>
	name: string
}

export function SortableHeader<TValue>({
	info,
	name,
}: DefaultHeaderProps<TValue>) {
	const { column, table } = info
	const sorted = column.getIsSorted()

	return (
		<ContextMenu>
			<ContextMenuTrigger
				title={`Sort by ${name}`}
				onPointerDown={(e) => {
					e.preventDefault()
					column.toggleSorting(sorted === 'asc')
				}}
				className='group w-full h-full flex flex-row rounded-md items-center justify-start gap-1 cursor-default hover:text-accent-foreground'
			>
				{name}
				<span className='flex items-center'>
					<MoveUp
						className={cn(
							'w-4 h-4 transition-all duration-300',
							'transform-gpu',
							sorted !== 'desc'
								? 'opacity-0 translate-x-2 group-hover:opacity-70 group-hover:translate-x-0'
								: 'opacity-100 text-foreground translate-x-0',
						)}
					/>

					<MoveDown
						className={cn(
							'w-4 h-4 -ml-2 transition-all duration-300',
							'transform-gpu',
							sorted !== 'asc'
								? 'opacity-0 -translate-x-2 group-hover:opacity-70 group-hover:translate-x-0'
								: 'opacity-100 text-foreground translate-x-0',
						)}
					/>
				</span>
			</ContextMenuTrigger>

			<ContextMenuContent
				onCloseAutoFocus={(e) => e.preventDefault()}
				onContextMenu={(e) => e.preventDefault()}
			>
				{table
					.getAllColumns()
					.filter((col) => col.getCanHide())
					.map((col) => (
						<ContextMenuCheckboxItem
							key={col.id}
							className='capitalize'
							checked={col.getIsVisible()}
							onCheckedChange={(value) => col.toggleVisibility(!!value)}
						>
							{col.columnDef.header && typeof col.columnDef.header === 'string'
								? col.columnDef.header
								: col.id}
						</ContextMenuCheckboxItem>
					))}
			</ContextMenuContent>
		</ContextMenu>
	)
}
