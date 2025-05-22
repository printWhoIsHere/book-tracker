import { Sheet, SheetContent } from '@renderer/components/ui/sheet'

import { useSidebar } from '@renderer/providers/sidebar-provider'
import { cn } from '@renderer/lib/utils'

import { SidebarHeader } from './SidebarHeader'
import { SidebarContent } from './SidebarContent'
import { SidebarFooter } from './SidebarFooter'

export function Sidebar() {
	const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

	if (isMobile) {
		return (
			<Sheet open={openMobile} onOpenChange={setOpenMobile}>
				<SheetContent
					side='left'
					className='w-80 border-r bg-sidebar text-sidebar-foreground p-0 [&>button]:hidden'
				>
					<div className='flex h-full flex-col'>
						<SidebarHeader />
						<SidebarContent />
						<SidebarFooter />
					</div>
				</SheetContent>
			</Sheet>
		)
	}

	return (
		<div
			data-state={state}
			className='group/sidebar hidden text-sidebar-foreground md:block'
		>
			{/* Пустышка для push layout-а */}
			<div
				className={cn(
					'relative transition-[width] duration-200 ease-linear',
					state === 'expanded'
						? 'w-[--sidebar-width]'
						: 'w-[--sidebar-width-icon]',
				)}
			/>

			{/* Настоящий Sidebar */}
			<div
				className={cn(
					'fixed inset-y-0 left-0 z-10 border-r transition-[width] duration-200 ease-linear md:flex',
					state === 'expanded'
						? 'w-[--sidebar-width]'
						: 'w-[--sidebar-width-icon]',
				)}
			>
				<div
					data-sidebar='sidebar'
					data-state={state}
					className='group flex h-full w-full flex-col bg-sidebar'
				>
					<SidebarHeader />
					<SidebarContent />
					<SidebarFooter />
				</div>
			</div>
		</div>
	)
}
