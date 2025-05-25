import WorkspaceSwitcher from '@renderer/components/workspace/workspace-switcher'

export function SidebarFooter() {
	return (
		<div data-sidebar='footer' className='py-4 px-2'>
			<WorkspaceSwitcher />
		</div>
	)
}
