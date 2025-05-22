import { NavItems } from '@renderer/components/sidebar/blocks/SidebarMenu'
import { navigation } from '@renderer/navigation'
import { useSidebar } from '@renderer/providers/sidebar-provider'

export default function SidebarContent() {
	const { state } = useSidebar()
	const groups = state === 'collapsed' ? [navigation[0]] : navigation

	return (
		<nav
			data-sidebar='content'
			className='flex-1 overflow-y-auto px-2 py-4 space-y-4'
		>
			{groups.map((g) => (
				<NavItems key={g.group} label={g.group} items={g.items} />
			))}
		</nav>
	)
}
