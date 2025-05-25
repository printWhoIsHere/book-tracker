import { Avatar, AvatarFallback } from '@renderer/components/ui/avatar'

export function WorkspaceAvatar({ name }: { name: string }) {
	const getWorkspaceInitials = (name: string) => {
		return name
			.split(' ')
			.map((word) => word.charAt(0))
			.join('')
			.toUpperCase()
			.slice(0, 2)
	}

	return (
		<Avatar className='h-6 w-6'>
			<AvatarFallback className='bg-muted text-xs'>
				{getWorkspaceInitials(name)}
			</AvatarFallback>
		</Avatar>
	)
}
