import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

import { cn } from '@renderer/lib/cn'
import { useSidebar } from '@renderer/providers/sidebar-provider'

import { SidebarMenuItem } from './sidebar-menu-item'

interface SidebarGroupProps {
	group: SidebarGroup
	onItemClick: (item: SidebarMenuItem) => void
}

export function SidebarGroup({ group, onItemClick }: SidebarGroupProps) {
	const { state } = useSidebar()
	const isCollapsed = state === 'collapsed'
	const [isGroupCollapsed, setIsGroupCollapsed] = useState(
		group.defaultCollapsed || false,
	)

	const toggleGroup = () => {
		if (group.collapsible && !isCollapsed) {
			setIsGroupCollapsed(!isGroupCollapsed)
		}
	}

	const visibleItems = group.items.filter((item) =>
		item.visible ? item.visible() : true,
	)

	if (visibleItems.length === 0) return null

	return (
		<div className='space-y-1'>
			{!isCollapsed && (
				<div
					className={cn(
						'px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider',
						group.collapsible &&
							'cursor-pointer hover:text-foreground transition-colors flex items-center justify-between',
					)}
					onClick={toggleGroup}
				>
					<span>{group.label}</span>
					{group.collapsible && (
						<div className='h-4 w-4'>
							{isGroupCollapsed ? (
								<ChevronRight className='h-3 w-3' />
							) : (
								<ChevronDown className='h-3 w-3' />
							)}
						</div>
					)}
				</div>
			)}

			<div
				className={cn(
					'space-y-1',
					!isCollapsed && isGroupCollapsed && 'hidden',
				)}
			>
				<ul className='space-y-1'>
					{visibleItems.map((item) => (
						<SidebarMenuItem
							key={item.id}
							item={item}
							onItemClick={onItemClick}
						/>
					))}
				</ul>
			</div>
		</div>
	)
}
