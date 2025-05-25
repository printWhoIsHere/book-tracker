import { HeaderContext } from '@tanstack/react-table'

import { cn } from '@renderer/lib/cn'
import type { BookRecord } from '@renderer/types/book'

import { ColumnContextMenu } from '@renderer/components/data-table/headers'

interface HeaderMenuProps<T> {
	info: HeaderContext<BookRecord, T>
	label: string
	className?: string
}

export function HeaderMenu<TValue>({
	info,
	label,
	className,
}: HeaderMenuProps<TValue>) {
	return (
		<ColumnContextMenu info={info}>
			<div
				className={cn(
					'w-full h-full flex items-center justify-start cursor-default',
					className,
				)}
			>
				{label}
			</div>
		</ColumnContextMenu>
	)
}
