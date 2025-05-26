import { SidebarTrigger } from '@renderer/components/layout/sidebar/sidebar-trigger'
import { Separator } from '@renderer/components/ui/separator'

export function Header() {
	return (
		<header className='flex h-12 mt-2 shrink-0 items-center justify-between gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
			<div className='flex items-center gap-2 px-4'>
				<SidebarTrigger className='h-8 w-8' />
				<Separator orientation='vertical' className='mx-2 h-4' />
				<h1 className='text-base font-medium text-foreground'>Data Table</h1>
			</div>
		</header>
	)
}
