import { ChevronsUpDown, Plus } from 'lucide-react'
import { cn } from '@renderer/lib/cn'
import { useSidebar } from '@renderer/providers/sidebar-provider'
import { useWorkspace } from '@renderer/hooks/data/useWorkspace'

import { useBook } from '@renderer/hooks/data/useBook'

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@renderer/components/ui/dropdown-menu'
import { Button } from '@renderer/components/ui/button'
import { Skeleton } from '@renderer/components/ui/skeleton'
import { WorkspaceAvatar } from '@renderer/components/workspace/workspace-avatar'
import { WorkspaceDropdownItem } from '@renderer/components/workspace/workspace-item'

export default function WorkspaceSwitcher() {
	const { state } = useSidebar()
	const { workspaces, activeWorkspace, setActiveWorkspace, isLoading } =
		useWorkspace()
	const { books } = useBook()

	const isCollapsed = state === 'collapsed'

	const handleWorkspaceChange = (workspaceId: string) => {
		setActiveWorkspace({ id: workspaceId })
	}

	if (isLoading) {
		return (
			<Skeleton className='flex items-center h-12 w-full'>
				<ChevronsUpDown className='ml-auto mr-2 h-4 w-4 shrink-0 opacity-50' />
			</Skeleton>
		)
	}

	if (!activeWorkspace) return null

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant='ghost'
					className={cn(
						'w-full h-auto p-2 justify-start gap-2 hover:bg-accent/50',
						isCollapsed && 'justify-center p-2',
					)}
				>
					<WorkspaceAvatar name={activeWorkspace.name} />

					{!isCollapsed && (
						<div className='flex-1 text-left'>
							<div className='text-sm font-medium truncate'>
								{activeWorkspace?.name || 'No Workspace'}
							</div>
							<div className='text-xs text-muted-foreground'>
								{books.length} books
							</div>
						</div>
					)}

					{!isCollapsed && (
						<ChevronsUpDown className='h-4 w-4 shrink-0 opacity-50' />
					)}
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				className='w-64'
				align={isCollapsed ? 'center' : 'start'}
				side={isCollapsed ? 'right' : 'top'}
				sideOffset={isCollapsed ? 8 : 4}
			>
				<DropdownMenuLabel className='font-normal'>
					<div className='flex flex-col space-y-1'>
						<p className='text-sm font-medium leading-none'>Workspaces</p>
						<p className='text-xs leading-none text-muted-foreground'>
							Switch between your workspaces
						</p>
					</div>
				</DropdownMenuLabel>

				<DropdownMenuSeparator />

				{workspaces.map((workspace, index) => (
					<WorkspaceDropdownItem
						key={workspace.id}
						workspace={workspace}
						isActive={workspace.id === activeWorkspace?.id}
						hotkeyLabel={String(index + 1)}
						onClick={() =>
							workspace.id !== activeWorkspace?.id &&
							handleWorkspaceChange(workspace.id)
						}
					/>
				))}

				<DropdownMenuSeparator />

				<DropdownMenuItem
					onClick={() => {}}
					className='flex items-center gap-2 cursor-pointer'
				>
					<Plus className='h-4 w-4' />
					<span>Create workspace</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
