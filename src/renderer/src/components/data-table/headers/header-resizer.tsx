import { Header } from '@tanstack/react-table'

import { cn } from '@renderer/lib/cn'

import { Separator } from '@renderer/components/ui/separator'

interface HeaderResizerProps<TData> {
	header: Header<TData, unknown>
}

export function HeaderResizer<TData>({ header }: HeaderResizerProps<TData>) {
	const resizeHandler = header.getResizeHandler()

	const handleDoubleClick = () => {
		header.column.resetSize()
	}

	return (
		<div
			className={cn(
				'group absolute top-0 right-0 h-full w-[10px] z-10 flex items-center justify-center',
			)}
			style={{ cursor: 'col-resize', touchAction: 'none' }}
			onMouseDown={resizeHandler}
			onTouchStart={resizeHandler}
			onDoubleClick={handleDoubleClick}
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
	)
}
