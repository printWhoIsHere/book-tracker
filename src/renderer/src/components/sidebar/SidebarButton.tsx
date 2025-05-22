import React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps } from 'class-variance-authority'
import { buttonVariants } from '@renderer/components/ui/button'

import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@renderer/components/ui/tooltip'

import { cn } from '@renderer/lib/utils'
import { useSidebar } from '@renderer/providers/sidebar-provider'

export interface SidebarButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean
	tooltip?: string
}

export const SidebarButton = React.forwardRef<
	HTMLButtonElement,
	SidebarButtonProps
>(
	(
		{ className, variant, size, asChild = false, tooltip, children, ...props },
		ref,
	) => {
		const { state, isMobile } = useSidebar()
		const Comp = asChild ? Slot : 'button'

		const button = (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			>
				{children}
			</Comp>
		)

		// Показываем tooltip только в collapsed режиме на desktop
		const shouldShowTooltip = tooltip && state === 'collapsed' && !isMobile

		if (!shouldShowTooltip) {
			return button
		}

		return (
			<Tooltip>
				<TooltipTrigger asChild>{button}</TooltipTrigger>
				<TooltipContent side='right' sideOffset={4}>
					{tooltip}
				</TooltipContent>
			</Tooltip>
		)
	},
)

SidebarButton.displayName = 'SidebarButton'
