import { useCallback } from 'react'
import { useModal } from '@renderer/hooks/useModal'
import { useDataTable } from '@renderer/providers/data-table-provider'
import { ConfirmModal } from '@renderer/components/modals'

export const useSidebarActions = () => {
	const { openModal } = useModal()
	const { table } = useDataTable()

	const handleDeleteSelected = useCallback(async () => {
		if (!table.selectedRows.length) return

		openModal(ConfirmModal, {
			title: 'Подтвердите действие',
			props: {
				message: `Удалить выбранные книги (${table.selectedRows.length})?`,
				onConfirm: async () => {
					console.log('Deleting books:', table.selectedRows)
				},
			},
		})
	}, [table.selectedRows, openModal])

	const actions = {
		deleteSelected: handleDeleteSelected,
	}

	return { actions }
}
