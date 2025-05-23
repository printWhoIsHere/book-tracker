import { useQuery } from '@tanstack/react-query'
import { useTypedMutation } from '@renderer/lib/react-query'

const WORKSPACES_KEY = ['workspaces']
const ACTIVE_KEY = ['workspace', 'active']

export function useWorkspace() {
	const {
		data: workspaces = [],
		isLoading: isLoadingList,
		error: listError,
		refetch: refetchList,
	} = useQuery({
		queryKey: WORKSPACES_KEY,
		queryFn: () => window.api.workspace.list(),
	})

	const {
		data: activeWorkspace = null,
		isLoading: isLoadingActive,
		error: activeError,
		refetch: refetchActive,
	} = useQuery({
		queryKey: ACTIVE_KEY,
		queryFn: () => window.api.workspace.getActive() as Promise<string | null>,
		enabled: Boolean(workspaces.length),
	})

	const create = useTypedMutation(
		({ name, schema }: { name: string; schema?: any[] }) =>
			window.api.workspace.create(name, schema),
		{
			queryKey: WORKSPACES_KEY,
			successMessage: 'Workspace created',
			errorMessage: 'Failed to create workspace',
		},
	)

	const setActive = useTypedMutation(
		(id: string) => window.api.workspace.setActive(id),
		{
			queryKey: ACTIVE_KEY,
			successMessage: 'Активный Workspace обновлён',
			errorMessage: 'Ошибка при смене активного Workspace',
		},
	)

	return {
		// данные
		workspaces,
		activeWorkspace,

		// состояния загрузки
		isLoadingList,
		isLoadingActive,
		isLoading: isLoadingList || isLoadingActive,

		// ошибки
		listError,
		activeError,

		// перезапрос
		refetchList,
		refetchActive,

		// операции
		create: create.mutate,
		setActive: setActive.mutate,
		isCreating: create.isPending,
		isSettingActive: setActive.isPending,
	}
}
