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
		queryFn: () => window.api.workspace.getActive(),
		enabled: Boolean(workspaces.length),
	})

	const create = useTypedMutation(
		({ name }: { name: string }) => window.api.workspace.create(name),
		{
			queryKey: WORKSPACES_KEY,
			successMessage: 'Workspace created',
			errorMessage: 'Failed to create workspace',
		},
	)

	const setActive = useTypedMutation(
		(id: string) => window.api.workspace.setActive(id),
		{
			queryKey: WORKSPACES_KEY,
			successMessage: 'Active workspace updated',
			errorMessage: 'Failed to set active workspace',
		},
	)

	const update = useTypedMutation(
		({ id, updates }: { id: string; updates: any }) =>
			window.api.workspace.update(id, updates),
		{
			queryKey: WORKSPACES_KEY,
			successMessage: 'Workspace updated',
			errorMessage: 'Failed to update workspace',
		},
	)

	const deleteWorkspace = useTypedMutation(
		(id: string) => window.api.workspace.delete(id),
		{
			queryKey: WORKSPACES_KEY,
			successMessage: 'Workspace deleted',
			errorMessage: 'Failed to delete workspace',
		},
	)

	const updateSettings = useTypedMutation(
		({ id, settings }: { id: string; settings: any }) =>
			window.api.workspace.updateSettings(id, settings),
		{
			queryKey: WORKSPACES_KEY,
			successMessage: 'Settings updated',
			errorMessage: 'Failed to update settings',
		},
	)

	return {
		workspaces,
		activeWorkspace,

		isLoadingList,
		isLoadingActive,
		isLoading: isLoadingList || isLoadingActive,

		listError,
		activeError,

		refetchList,
		refetchActive,

		create: create.mutate,
		setActive: setActive.mutate,
		update: update.mutate,
		delete: deleteWorkspace.mutate,
		updateSettings: updateSettings.mutate,

		isCreating: create.isPending,
		isSettingActive: setActive.isPending,
		isUpdating: update.isPending,
		isDeleting: deleteWorkspace.isPending,
		isUpdatingSettings: updateSettings.isPending,
	}
}
