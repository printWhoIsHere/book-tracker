import CreateWorkspaceForm from '@renderer/components/CreateWorkspaceForm'
import { Header } from '@renderer/components/layout/header'
import { Sidebar } from '@renderer/components/layout/sidebar'
import { DataTable } from '@renderer/components/data-table'

import { useWorkspace } from '@renderer/hooks/data/useWorkspace'
import { useBook } from '@renderer/hooks/data/useBook'
import { DataTableProvider } from '@renderer/providers/data-table-provider'

function App(): JSX.Element {
	const { workspaces, isLoading: isLoadingWorkspace } = useWorkspace()
	const { books, isLoading: isLoadingBooks } = useBook()

	if (isLoadingWorkspace || isLoadingBooks) {
		return (
			<div className='min-h-screen w-full flex justify-center items-center text-foreground'>
				<div className='text-lg'>Loading...</div>
			</div>
		)
	}

	if (!workspaces.length) {
		return (
			<div className='min-h-screen w-full flex justify-center items-center bg-wavy-lines'>
				<div className='w-full max-w-sm md:max-w-3xl px-4'>
					<CreateWorkspaceForm />
				</div>
			</div>
		)
	}

	return (
		<div className='w-full h-screen flex bg-primary-foreground text-foreground overflow-hidden'>
			<DataTableProvider data={books}>
				<Sidebar />
				<div className='flex flex-col flex-1 bg-background overflow-hidden min-h-0 ms-0 m-2 rounded-xl'>
					<Header />
					<main className='flex flex-col gap-4 flex-1 p-1 md:p-4 overflow-hidden min-h-0'>
						<DataTable />
					</main>
				</div>
			</DataTableProvider>
		</div>
	)
}
export default App
