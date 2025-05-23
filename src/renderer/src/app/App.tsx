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
		<div className='min-h-screen w-full flex bg-background text-foreground'>
			<Sidebar />

			<div className='flex flex-col flex-1 min-h-screen overflow-hidden'>
				<Header />

				<main className='flex flex-col gap-4 flex-1 w-full p-1 md:p-4 overflow-hidden'>
					{/* Main content area */}
					<div className='w-full flex-1 border rounded-lg overflow-auto bg-card'>
						{/* Здесь будет ваш основной контент */}
						{/* <DataTable /> */}
					</div>

					{/* Footer */}
					<div className='w-full h-12 border rounded-lg bg-card flex items-center px-4'>
						{/* Здесь будет footer контент */}
					</div>
				</main>
			</div>
		</div>
	)
}
export default App
