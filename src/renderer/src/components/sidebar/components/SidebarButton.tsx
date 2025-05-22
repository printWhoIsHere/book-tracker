import React from 'react'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@renderer/components/ui/tooltip'
import { buttonVariants } from '@renderer/components/ui/button'
import { cn } from '@renderer/lib/utils'
import { useSidebar } from '@renderer/providers/sidebar-provider'

export type SidebarButtonProps =
	React.ButtonHTMLAttributes<HTMLButtonElement> & {
		tooltip?: string
	}

export function SidebarButton({
	tooltip,
	className,
	children,
	...props
}: SidebarButtonProps) {
	const { state, isMobile } = useSidebar()
	const btn = (
		<button
			data-sidebar='menu-button'
			className={cn(
				buttonVariants({ variant: 'ghost' }),
				'flex items-center gap-2 p-2 rounded-md transition-all',
				state === 'collapsed' && 'justify-center',
				className,
			)}
			{...props}
		>
			{children}
		</button>
	)

	if (!tooltip) return btn
	return (
		<Tooltip>
			<TooltipTrigger asChild>{btn}</TooltipTrigger>
			<TooltipContent side='right' hidden={state !== 'collapsed' || isMobile}>
				{tooltip}
			</TooltipContent>
		</Tooltip>
	)
}
