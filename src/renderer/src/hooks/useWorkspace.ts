import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTypedMutation } from '@renderer/lib/react-query'

const WORKSPACES_KEY = ['workspaces']
const ACTIVE_KEY = ['workspace', 'active']

export function useWorkspace() {
	const qc = useQueryClient()

	const {
		data: workspaces = [],
		isLoading: isLoadingList,
		error: listError,
		refetch: refetchList,
	} = useQuery({
		queryKey: WORKSPACES_KEY,
		queryFn: () => window.api.workspace.list() as Promise<string[]>,
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
		({ name }: { name: string }) => window.api.workspace.create(name),
		{
			queryKey: WORKSPACES_KEY,
			successMessage: 'Workspace created',
			errorMessage: 'Failed to create workspace',
			onSuccess: () => {
				qc.invalidateQueries({ queryKey: WORKSPACES_KEY })
			},
		},
	)

	const setActive = useTypedMutation(
		(id: string) => window.api.workspace.setActive(id),
		{
			queryKey: WORKSPACES_KEY,
			successMessage: 'Active workspace updated',
			errorMessage: 'Failed to set active workspace',
			onSuccess: () => {
				qc.invalidateQueries({ queryKey: ACTIVE_KEY })
			},
		},
	)

	const update = useTypedMutation(
		({ id, updates }: { id: string; updates: any }) =>
			window.api.workspace.update(id, updates),
		{
			queryKey: WORKSPACES_KEY,
			successMessage: 'Workspace updated',
			errorMessage: 'Failed to update workspace',
			onSuccess: () => {
				qc.invalidateQueries({ queryKey: WORKSPACES_KEY })
			},
		},
	)

	const remove = useTypedMutation(
		(id: string) => window.api.workspace.remove(id),
		{
			queryKey: WORKSPACES_KEY,
			successMessage: 'Workspace deleted',
			errorMessage: 'Failed to delete workspace',
			onSuccess: () => {
				qc.invalidateQueries({ queryKey: WORKSPACES_KEY })
			},
		},
	)

	const updateSettings = useTypedMutation(
		({ id, settings }: { id: string; settings: any }) =>
			window.api.workspace.updateSettings(id, settings),
		{
			queryKey: WORKSPACES_KEY,
			successMessage: 'Settings updated',
			errorMessage: 'Failed to update settings',
			onSuccess: () => {
				qc.invalidateQueries({ queryKey: WORKSPACES_KEY })
			},
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
		delete: remove.mutate,
		updateSettings: updateSettings.mutate,

		isCreating: create.isPending,
		isSettingActive: setActive.isPending,
		isUpdating: update.isPending,
		isDeleting: remove.isPending,
		isUpdatingSettings: updateSettings.isPending,
	}
}
