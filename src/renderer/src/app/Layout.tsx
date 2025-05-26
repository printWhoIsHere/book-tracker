import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ThemeProvider } from '@renderer/providers/theme-provider'
import { SidebarProvider } from '@renderer/providers/sidebar-provider'
import { ModalProvider } from '@renderer/providers/modal-provider'
import { Toaster } from '@renderer/components/ui/toaster'

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			staleTime: 1000 * 60 * 5, // 5 минут
		},
	},
})

function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider defaultTheme='dark' storageKey='ui-theme'>
				<SidebarProvider>
					<ModalProvider />
					{children}
					<Toaster />
				</SidebarProvider>
			</ThemeProvider>
		</QueryClientProvider>
	)
}

export default RootLayout
