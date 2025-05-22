import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ThemeProvider } from '@renderer/providers/theme-provider'
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
				<div className='w-screen h-screen flex justify-center items-center bg-background text-foreground'>
					{children}
				</div>

				<Toaster />
			</ThemeProvider>
		</QueryClientProvider>
	)
}

export default RootLayout
