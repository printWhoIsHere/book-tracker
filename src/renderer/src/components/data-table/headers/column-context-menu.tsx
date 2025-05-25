import { HeaderContext } from '@tanstack/react-table'

import type { BookRecord } from '@renderer/types/book'

import {
	ContextMenu,
	ContextMenuCheckboxItem,
	ContextMenuContent,
	ContextMenuTrigger,
} from '@renderer/components/ui/context-menu'

interface ColumnContextMenuProps<T> {
	info: HeaderContext<BookRecord, T>
	children: React.ReactNode
}

export function ColumnContextMenu<TValue>({
	info,
	children,
}: ColumnContextMenuProps<TValue>) {
	const { table } = info

	const visibleColumns = table
		.getAllColumns()
		.filter((column) => column.getCanHide())

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

			<ContextMenuContent
				onCloseAutoFocus={(e) => e.preventDefault()}
				onContextMenu={(e) => e.preventDefault()}
			>
				{visibleColumns.map((column) => {
					const columnName = getColumnDisplayName(column)

					return (
						<ContextMenuCheckboxItem
							key={column.id}
							className='capitalize'
							checked={column.getIsVisible()}
							onCheckedChange={(value) => column.toggleVisibility(!!value)}
						>
							{columnName}
						</ContextMenuCheckboxItem>
					)
				})}
			</ContextMenuContent>
		</ContextMenu>
	)
}

function getColumnDisplayName(column: any): string {
	if (column.columnDef.header && typeof column.columnDef.header === 'string') {
		return column.columnDef.header
	}
	return column.id
}
