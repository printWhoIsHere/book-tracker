import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ThemeProvider } from '@renderer/providers/theme-provider'
import { SidebarProvider } from '@renderer/providers/sidebar-provider'
import { TableProvider } from '@renderer/providers/table-provider'
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
			<ThemeProvider>
				<TableProvider>
					<SidebarProvider>
						<div className='w-screen h-screen flex justify-center items-center bg-background text-foreground'>
							<ModalProvider />
							{children}
						</div>
					</SidebarProvider>

					<Toaster />
				</TableProvider>
			</ThemeProvider>
		</QueryClientProvider>
	)
}

export default RootLayout
