import { HeaderContext } from '@tanstack/react-table'

import type { BookRecord } from '@renderer/types/book'

import { ColumnContextMenu } from '@renderer/components/data-table/headers'

interface HeaderMenuProps<T> {
	info: HeaderContext<BookRecord, T>
	label: string
}

export function HeaderMenu<TValue>({ info, label }: HeaderMenuProps<TValue>) {
	return (
		<ColumnContextMenu info={info}>
			<div className='w-full h-full flex items-center justify-start cursor-default'>
				{label}
			</div>
		</ColumnContextMenu>
	)
}
