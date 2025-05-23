import { flexRender, Header } from '@tanstack/react-table'
import { cn } from '@renderer/lib/utils'
import { TableHead } from '@renderer/components/ui/table'
import { Separator } from '@renderer/components/ui/separator'

interface DefaultHeaderProps<TData> {
	header: Header<TData, unknown>
}

export function DefaultHeader<TData>({ header }: DefaultHeaderProps<TData>) {
	const resizeHandler = header.getResizeHandler()

	return (
		<TableHead
			key={header.column.id}
			colSpan={header.colSpan}
			className={cn('px-0 relative font-semibold flex bg-background')}
			style={{
				width: header.column.getSize(),
				minWidth: header.column.columnDef.minSize ?? 60,
				flex: `0 0 ${header.column.getSize()}px`,
			}}
		>
			<span className='w-full px-3 radius-md whitespace-nowrap overflow-hidden text-ellipsis max-w-full'>
				{flexRender(header.column.columnDef.header, header.getContext())}
			</span>

			{/* Ресайзер */}
			{!header.column.getIsLastColumn?.() && (
				<div
					className={cn(
						'group absolute top-0 right-0 h-full w-[10px] z-10 flex items-center justify-center',
					)}
					style={{ cursor: 'col-resize', touchAction: 'none' }}
					onMouseDown={resizeHandler}
					onTouchStart={resizeHandler}
					onDoubleClick={() => header.column.resetSize()}
				>
					<Separator
						orientation='vertical'
						className={cn(
							'h-1/2  m-auto rounded-sm transition-colors duration-150',
							'group-hover:bg-foreground',
							header.column.getIsResizing() && 'bg-secondary',
						)}
					/>
				</div>
			)}
		</TableHead>
	)
}
