import {
	createContext,
	useContext,
	useState,
	useCallback,
	useMemo,
} from 'react'

import { TooltipProvider } from '@renderer/components/ui/tooltip'

import { useMobile } from '@renderer/hooks/useMobile'
import { cn } from '@renderer/lib/cn'

interface SidebarContextProps {
	state: 'expanded' | 'collapsed'
	open: boolean
	setOpen: (open: boolean) => void
	openMobile: boolean
	setOpenMobile: (open: boolean) => void
	isMobile: boolean
	toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextProps | null>(null)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
	const isMobile = useMobile()

	const [open, setOpen] = useState(false)
	const [openMobile, setOpenMobile] = useState(false)

	const toggleSidebar = useCallback(() => {
		return isMobile ? setOpenMobile((prev) => !prev) : setOpen((prev) => !prev)
	}, [isMobile])

	const state = open ? 'expanded' : 'collapsed'

	const contextValue = useMemo<SidebarContextProps>(
		() => ({
			state,
			open,
			setOpen,
			isMobile,
			openMobile,
			setOpenMobile,
			toggleSidebar,
		}),
		[state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
	)

	return (
		<SidebarContext.Provider value={contextValue}>
			<TooltipProvider delayDuration={0}>
				<div
					style={
						{
							'--sidebar-width': '16rem',
							'--sidebar-width-icon': '4rem',
						} as React.CSSProperties
					}
					className={cn(
						'group/sidebar-wrapper flex min-h-svh w-full bg-sidebar overflow-auto',
					)}
				>
					{children}
				</div>
			</TooltipProvider>
		</SidebarContext.Provider>
	)
}

export const useSidebar = () => {
	const context = useContext(SidebarContext)
	if (!context) {
		throw new Error('useSidebar must be used within a SidebarProvider.')
	}

	return context
}
