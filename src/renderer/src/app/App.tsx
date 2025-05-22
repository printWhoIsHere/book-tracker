import CreateWorkspaceForm from '@renderer/components/CreateWorkspaceForm'

import { useWorkspace } from '@renderer/hooks/useWorkspace'

function App(): JSX.Element {
	const { workspaces, isLoading } = useWorkspace()

	console.log(workspaces)

	if (isLoading) {
		return (
			<div className='w-screen h-screen flex justify-center items-center bg-wavy-lines text-foreground'>
				Loading...
			</div>
		)
	}

	if (!workspaces.data.length) {
		return (
			<div className='w-screen h-screen flex justify-center items-center bg-wavy-lines'>
				<div className='w-full max-w-sm md:max-w-3xl'>
					<CreateWorkspaceForm />
				</div>
			</div>
		)
	}

	return (
		<div className='bg-wavy-lines w-screen h-screen flex bg-background text-foreground'>
			{/* <Sidebar /> */}
			<div className='h-full w-16 bg-muted border-r' />

			<div className='flex flex-col flex-1 overflow-hidden'>
				{/* <Header /> */}
				<div className='h-12 w-full bg-muted border-b' />

				<div className='flex flex-col gap-4 flex-1 w-full h-full p-1 md:p-4'>
					{/* <DataTable /> */}
					<div className='w-full h-full border rounded-lg overflow-auto' />

					{/* DataTable Footer */}
					<div className='w-full h-12 border rounded-lg' />
				</div>
			</div>
		</div>
	)
}

export default App
