import { cn } from '@renderer/lib/cn'
import { SidebarButton } from './sidebar-button'
import { useSidebar } from '@renderer/providers/sidebar-provider'

interface SidebarMenuItemProps {
	item: SidebarMenuItem
	onItemClick: (item: SidebarMenuItem) => void
}

export function SidebarMenuItem({ item, onItemClick }: SidebarMenuItemProps) {
	const { state } = useSidebar()
	const isCollapsed = state === 'collapsed'

	const isVisible = item.visible ? item.visible() : true
	const isDisabled = item.disabled ? item.disabled() : false

	if (!isVisible) return null

	const handleClick = () => {
		if (isDisabled) return
		onItemClick(item)
	}

	return (
		<li>
			<SidebarButton
				onClick={handleClick}
				tooltip={isCollapsed ? item.title : undefined}
				variant={item.variant || 'ghost'}
				disabled={isDisabled}
				className={cn(
					'w-full justify-start',
					isCollapsed && 'justify-center px-2',
					isDisabled && 'opacity-50 cursor-not-allowed',
				)}
			>
				<item.icon className='h-2 w-2 shrink-0' />
				{!isCollapsed && <span className='ml-2 truncate'>{item.title}</span>}
			</SidebarButton>
		</li>
	)
}
