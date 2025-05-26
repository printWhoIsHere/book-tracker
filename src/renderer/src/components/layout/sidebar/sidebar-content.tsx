import { useSidebar } from '@renderer/providers/sidebar-provider'
import { sidebarConfig } from './config'
import { SidebarGroup } from './sidebar-group'
import { useModal } from '@renderer/hooks/useModal'

export function SidebarContent() {
	const { state } = useSidebar()
	const { openModal } = useModal()

	const isCollapsed = state === 'collapsed'

	// В collapsed режиме показываем только первую группу или важные действия
	const visibleGroups = isCollapsed
		? sidebarConfig.filter((group) => group.id === 'actions')
		: sidebarConfig

	const handleItemClick = async (item: SidebarMenuItem) => {
		switch (item.type) {
			case 'modal':
				if (item.modal) {
					openModal(item.modal.component, {
						title: item.modal.title,
						description: item.modal.description,
						...item.modal.props,
					})
				}
				break

			case 'action':
				if (item.action) {
					if (item.action.handler) {
						await item.action.handler()
					}
				}
				break

			case 'link':
				if (item.href) {
					// Обработка навигации
					window.location.href = item.href
				}
				break
		}
	}

	return (
		<nav
			className='flex-1 overflow-y-auto px-2 py-4 space-y-4'
			data-sidebar='content'
		>
			{visibleGroups.map((group) => (
				<SidebarGroup
					key={group.id}
					group={group}
					onItemClick={handleItemClick}
				/>
			))}
		</nav>
	)
}
