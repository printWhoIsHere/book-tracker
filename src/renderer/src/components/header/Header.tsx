import { SidebarTrigger } from '@renderer/components/sidebar/SidebarTrigger'
import { Separator } from '@renderer/components/ui/separator'

export function Header() {
	return (
		<header className='flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
			<div className='flex items-center gap-2 px-4'>
				<SidebarTrigger className='-mx-2 md:mx-0' />
				<Separator orientation='vertical' className='mx-2 h-4' />
				<h1 className='text-base font-medium'>Book Management</h1>
			</div>
			<div className='flex gap-2 px-4'></div>
		</header>
	)
}
