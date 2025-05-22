import { useCallback } from 'react'
import { useModal } from '@renderer/hooks/useModal'
import { ConfirmModal } from '@renderer/components/modals'
import { useTableContext } from '@renderer/providers/table-provider'

export const useSidebarActions = () => {
	const { openModal } = useModal()
	const { selectedRows } = useTableContext()

	const handleDeleteSelected = useCallback(async () => {
		if (!selectedRows.length) return

		openModal(ConfirmModal, {
			title: 'Подтвердите действие',
			props: {
				message: `Удалить выбранные книги (${selectedRows.length})?`,
				onConfirm: async () => {
					console.log('Deleting books:', selectedRows)
				},
			},
		})
	}, [selectedRows, openModal])

	const actions = {
		deleteSelected: handleDeleteSelected,
	}

	return { actions }
}
