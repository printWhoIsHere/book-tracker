import { useQuery } from '@tanstack/react-query'
import { useTypedMutation } from '@renderer/lib/react-query'

const QUERY_KEY = ['workspaces']

export function useWorkspace() {
	const {
		data: workspaces = [],
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: QUERY_KEY,
		queryFn: () => window.api.workspace.list(),
	})

	const create = useTypedMutation(
		({ name, schema }: { name: string; schema?: any[] }) =>
			window.api.workspace.create(name, schema),
		{
			queryKey: QUERY_KEY,
			successMessage: 'Workspace created',
			errorMessage: 'Failed to create workspace',
		},
	)

	return {
		workspaces,
		refetch,

		isLoading,

		error,

		create: create.mutate,

		isCreating: create.isPending,
	}
}
