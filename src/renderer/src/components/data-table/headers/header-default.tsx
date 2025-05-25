import { flexRender, Header } from '@tanstack/react-table'

import { HeaderResizer } from '@renderer/components/data-table/headers'
import { TableHead } from '@renderer/components/ui/table'

interface HeaderDefaultProps<TData> {
	header: Header<TData, unknown>
}

export function HeaderDefault<TData>({ header }: HeaderDefaultProps<TData>) {
	return (
		<TableHead
			key={header.column.id}
			colSpan={header.colSpan}
			className='px-0 relative font-semibold flex bg-background'
			style={{
				width: header.column.getSize(),
				minWidth: header.column.columnDef.minSize ?? 60,
				flex: `0 0 ${header.column.getSize()}px`,
			}}
		>
			<span className='w-full flex justify-center items-center px-3 radius-md whitespace-nowrap overflow-hidden text-ellipsis max-w-full'>
				{flexRender(header.column.columnDef.header, header.getContext())}
			</span>

			{!header.column.getIsLastColumn?.() && <HeaderResizer header={header} />}
		</TableHead>
	)
}
