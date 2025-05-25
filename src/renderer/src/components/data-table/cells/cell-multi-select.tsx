// import { useRef } from 'react'

// import { getTagColor } from '@renderer/utils'
// import { useWorkspaceSettings } from '@renderer/hooks/data/useWorkspace'
// import { useVisibleTags } from '@renderer/hooks/useVisibleTags'

import { Badge } from '@renderer/components/ui/badge'
// import { BadgeMore } from '@renderer/components/badge-more'

interface CellMultiSelectProps {
	array: string[]
}

export function CellMultiSelect({ array }: CellMultiSelectProps) {
	// 	const { settings } = useWorkspaceSettings()
	// 	// console.log(settings) -> TODO: Выдаёт undefined
	// 	const rowHeight = 'compact'
	// 	const containerRef = useRef<HTMLDivElement>(null)
	// 	const { visible, hidden } = useVisibleTags(array, containerRef, rowHeight)
	// 	if (rowHeight === 'compact') {
	// 		return array.length === 0 ? null : <BadgeMore array={array} />
	// 	}
	// 	const maxHeight = rowHeight === 'comfortable' ? 64 : 24
	// 	return     <div
	// 	ref={containerRef}
	// 	className="flex flex-wrap items-center gap-1 overflow-hidden w-full"
	// 	style={{ maxHeight }}
	// >
	// 	{visible.map((tag) => (
	// 		<Badge
	// 			key={tag}
	// 			className="opacity-70 hover:opacity-100 transition-opacity duration-300 cursor-default flex-shrink-0"
	// 			style={{ backgroundColor: getTagColor(tag, settings) }}
	// 		>
	// 			{tag}
	// 		</Badge>
	// 	))}
	// 	{hidden.length > 0 && <BadgeMore tags={hidden} />}
	// </div>
	// )
	// }

	return (
		<>
			{array.map((item) => (
				<Badge key={item} variant='outline'>
					{item}
				</Badge>
			))}
		</>
	)
}
