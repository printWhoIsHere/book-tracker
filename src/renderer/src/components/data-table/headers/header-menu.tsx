import { HeaderContext } from '@tanstack/react-table'
import {
	ContextMenu,
	ContextMenuCheckboxItem,
	ContextMenuContent,
	ContextMenuTrigger,
} from '@renderer/components/ui/context-menu'
import { cn } from '@renderer/lib/utils'

interface DefaultHeaderProps<T> {
	info: HeaderContext<Book, T>
	name: string
}

export function MenuHeader<TValue>({ info, name }: DefaultHeaderProps<TValue>) {
	const { table } = info

	return (
		<ContextMenu>
			<ContextMenuTrigger
				className={cn(
					'w-full h-full flex items-center justify-start cursor-default',
				)}
			>
				{name}
			</ContextMenuTrigger>
			<ContextMenuContent
				onCloseAutoFocus={(e) => e.preventDefault()}
				onContextMenu={(e) => e.preventDefault()}
			>
				{table
					.getAllColumns()
					.filter((column) => column.getCanHide())
					.map((column) => (
						<ContextMenuCheckboxItem
							key={column.id}
							className='capitalize'
							checked={column.getIsVisible()}
							onCheckedChange={(value) => column.toggleVisibility(!!value)}
						>
							{column.id}
						</ContextMenuCheckboxItem>
					))}
			</ContextMenuContent>
		</ContextMenu>
	)
}
