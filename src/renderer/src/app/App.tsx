import CreateWorkspaceForm from '@renderer/components/CreateWorkspaceForm'
import { Header } from '@renderer/components/layout/header'
import { Sidebar } from '@renderer/components/layout/sidebar'
import { DataTable } from '@renderer/components/data-table'

import {
	useWorkspace,
	useWorkspaceSettings,
} from '@renderer/hooks/data/useWorkspace'
import { useBook } from '@renderer/hooks/data/useBook'

function App(): JSX.Element {
	const { workspaces, isLoading: isLoadingWorkspace } = useWorkspace()
	const { settings, isLoading: isLoadingSettings } = useWorkspaceSettings()
	const { books, isLoading: isLoadingBooks } = useBook()

	if (isLoadingWorkspace || isLoadingSettings || isLoadingBooks) {
		return (
			<div className='min-h-screen w-full flex justify-center items-center'>
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
			<Sidebar />
			<div className='flex flex-col flex-1 bg-background overflow-hidden min-h-0 ms-0 m-2 rounded-xl'>
				<Header />
				<main className='flex flex-col gap-4 flex-1 p-1 md:p-4 overflow-hidden min-h-0'>
					<DataTable data={books} />
				</main>
			</div>
		</div>
	)
}
export default App
