import { useRef } from 'react'

import { cn } from '@renderer/lib/cn'
import { getTagColor, useVisibleTags } from '@renderer/utils/tag'
import { getMultiSelectMaxHeight } from '@renderer/utils/table'
import { useWorkspaceSettings } from '@renderer/hooks/data/useWorkspace'

import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from '@renderer/components/ui/popover'
import { Badge } from '@renderer/components/ui/badge'

interface CellMultiSelectProps {
	array: string[]
}

export function CellMultiSelect({ array }: CellMultiSelectProps) {
	const { settings } = useWorkspaceSettings()
	const rowHeight = settings?.table.rowHeight || 'compact'
	const containerRef = useRef<HTMLDivElement>(null)

	const { visible, hidden } = useVisibleTags(array, containerRef, rowHeight)

	if (rowHeight === 'compact') {
		return array.length === 0 ? null : <BadgeMore array={array} />
	}

	const maxHeight = getMultiSelectMaxHeight(rowHeight)

	return (
		<div
			ref={containerRef}
			className='flex flex-wrap items-center gap-1 overflow-hidden w-full'
			style={{ maxHeight }}
		>
			{visible.map((item) => (
				<Badge
					key={item}
					className='opacity-70 hover:opacity-100 transition-opacity duration-300 cursor-default flex-shrink-0'
					style={{ backgroundColor: getTagColor(item, settings?.tags || []) }}
				>
					{item}
				</Badge>
			))}
			{hidden.length > 0 && <BadgeMore array={hidden} />}
		</div>
	)
}

function BadgeMore({
	array,
	className,
}: {
	array: string[]
	className?: string
}) {
	const { settings } = useWorkspaceSettings()

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button>
					<Badge variant='outline' className={cn('cursor-pointer', className)}>
						+{array.length}
					</Badge>
				</button>
			</PopoverTrigger>
			<PopoverContent
				side='left'
				sideOffset={4}
				className='p-2 bg-popover w-auto shadow-lg border rounded-sm z-50'
			>
				<div className='flex flex-col gap-1 justify-start'>
					{array.map((item) => (
						<Badge
							key={item}
							style={{
								backgroundColor: getTagColor(item, settings?.tags || []),
							}}
						>
							{item}
						</Badge>
					))}
				</div>
			</PopoverContent>
		</Popover>
	)
}
