import CreateWorkspaceForm from '@renderer/components/CreateWorkspaceForm'
import { DataTable } from '@renderer/components/data-table'
import { Header } from '@renderer/components/header/Header'
import { Sidebar } from '@renderer/components/sidebar/Sidebar'

import { useWorkspace } from '@renderer/hooks/useWorkspace'

function App(): JSX.Element {
	const { workspaces, isLoading } = useWorkspace()

	if (isLoading) {
		return (
			<div className='min-h-screen w-full flex justify-center items-center bg-wavy-lines text-foreground'>
				<div className='text-lg'>Loading...</div>
			</div>
		)
	}

	if (!workspaces.data.length) {
		return (
			<div className='min-h-screen w-full flex justify-center items-center bg-wavy-lines'>
				<div className='w-full max-w-sm md:max-w-3xl px-4'>
					<CreateWorkspaceForm />
				</div>
			</div>
		)
	}

	return (
		<div className='w-full h-screen flex bg-background text-foreground overflow-hidden'>
			<Sidebar />
			<div className='flex flex-col flex-1 overflow-hidden min-h-0'>
				<Header />
				<main className='flex flex-col gap-4 flex-1 p-1 md:p-4 overflow-hidden min-h-0'>
					<DataTable />
				</main>
			</div>
		</div>
	)
}
export default App
