import React from 'react'
import { cn } from '@/renderer/lib/utils'
import { useSidebar } from '@/renderer/providers/sidebar-provider'
import { Sheet, SheetContent } from '@/renderer/components/ui/sheet'
import SidebarHeader from './partials/Header'
import SidebarContent from './partials/Content'
import SidebarFooter from './partials/Footer'

export default function Sidebar() {
	const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

	if (isMobile) {
		return (
			<Sheet open={openMobile} onOpenChange={setOpenMobile}>
				<SheetContent
					side='left'
					className='w-72 border-r bg-sidebar text-sidebar-foreground p-0 [&>button]:hidden'
				>
					<SidebarHeader />
					<SidebarContent />
					<SidebarFooter />
				</SheetContent>
			</Sheet>
		)
	}

	return (
		<aside
			data-state={state}
			className={cn(
				'group/sidebar fixed inset-y-0 left-0 z-10 flex flex-col border-r bg-sidebar transition-all duration-200',
				state === 'expanded' ? 'w-64' : 'w-16',
			)}
			aria-label='Sidebar navigation'
		>
			<SidebarHeader />
			<SidebarContent />
			<SidebarFooter />
		</aside>
	)
}
