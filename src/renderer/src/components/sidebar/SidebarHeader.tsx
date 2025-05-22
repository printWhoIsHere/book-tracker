import logo from '@renderer/assets/logo.svg'

export function SidebarHeader() {
	return (
		<div data-sidebar='header' className='flex items-center gap-2 p-4'>
			<img src={logo} alt='Logo' className='h-8 w-8' />
			<h1 className='text-lg font-bold group-data-[state=collapsed]:hidden'>
				Book Tracking
			</h1>
		</div>
	)
}
