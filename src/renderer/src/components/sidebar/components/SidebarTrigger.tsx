import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

import { Button } from '@renderer/components/ui/button'
import { useSidebar } from '@renderer/providers/sidebar-provider'

export function SidebarTrigger({
	className,
	...props
}: React.ComponentProps<typeof Button>) {
	const { open, toggleSidebar } = useSidebar()

	return (
		<Button
			data-sidebar='trigger'
			variant='ghost'
			size='icon'
			className={className}
			onClick={toggleSidebar}
			{...props}
		>
			{open ? <PanelLeftClose /> : <PanelLeftOpen />}
			<span className='sr-only'>Toggle Sidebar</span>
		</Button>
	)
}
