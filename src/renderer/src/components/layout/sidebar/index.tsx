import { Sheet, SheetContent } from '@renderer/components/ui/sheet'

import { useSidebar } from '@renderer/providers/sidebar-provider'

import { SidebarHeader } from './sidebar-header'
import { SidebarContent } from './sidebar-content'
import { SidebarFooter } from './sidebar-footer'

const SIDEBAR_WIDTH_EXPANDED = 280
const SIDEBAR_WIDTH_COLLAPSED = 64

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

	const isExpanded = state === 'expanded'
	const sidebarWidth = isExpanded
		? SIDEBAR_WIDTH_EXPANDED
		: SIDEBAR_WIDTH_COLLAPSED

	return (
		<div
			data-state={state}
			className='group/sidebar hidden text-sidebar-foreground md:block'
		>
			{/* Spacer для push layout-а */}
			<div
				className='relative transition-all duration-200 ease-linear'
				style={{ width: `${sidebarWidth}px` }}
			/>

			{/* Настоящий Sidebar */}
			<div
				className='fixed inset-y-0 left-0 z-10 transition-all duration-200 ease-linear md:flex bg-sidebar'
				style={{ width: `${sidebarWidth}px` }}
			>
				<div
					data-sidebar='sidebar'
					data-state={state}
					className='group flex h-full w-full flex-col overflow-hidden'
				>
					<SidebarHeader />
					<SidebarContent />
					<SidebarFooter />
				</div>
			</div>
		</div>
	)
}
