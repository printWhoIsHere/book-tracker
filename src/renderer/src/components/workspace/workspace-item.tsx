import { cn } from '@renderer/lib/cn'

import {
	DropdownMenuItem,
	DropdownMenuShortcut,
} from '@renderer/components/ui/dropdown-menu'
import { WorkspaceAvatar } from '@renderer/components/workspace/workspace-avatar'

interface WorkspaceDropdownItemProps {
	workspace: WorkspaceRecord
	isActive: boolean
	hotkeyLabel: string
	onClick: () => void
}

export function WorkspaceDropdownItem({
	workspace,
	isActive,
	hotkeyLabel,
	onClick,
}: WorkspaceDropdownItemProps) {
	return (
		<DropdownMenuItem
			key={workspace.id}
			onClick={onClick}
			className={cn(
				'flex items-center gap-2 cursor-pointer my-0.5',
				isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
			)}
		>
			<div className='flex items-center gap-2'>
				<WorkspaceAvatar name={workspace.name} />

				<div className='flex-1'>
					<div className='text-sm font-medium'>{workspace.name}</div>
				</div>
			</div>

			<DropdownMenuShortcut>⌘{hotkeyLabel}</DropdownMenuShortcut>
		</DropdownMenuItem>
	)
}
