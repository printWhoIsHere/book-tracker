import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

import { ConfirmModal } from '@renderer/components/modals/ConfirmModal'
import { AlertModal } from '@renderer/components/modals/AlertModal'

interface ModalState {
	modals: Array<{
		id: string
		isOpen: boolean
		Component: ModalComponent<any>
		options: ModalOptions<any>
	}>
}

interface ModalActions {
	openModal: <T extends BaseModalProps>(
		Component: ModalComponent<T>,
		options: ModalOptions<T>,
	) => string
	closeModal: (id?: string) => void
	closeAllModals: () => void
	updateModal: <T extends BaseModalProps>(
		id: string,
		options: Partial<ModalOptions<T>>,
	) => void
}

export const useModalStore = create<ModalState & ModalActions>()(
	subscribeWithSelector((set, get) => ({
		modals: [],

		openModal: (Component, options) => {
			const id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

			set((state) => ({
				modals: [
					...state.modals,
					{
						id,
						isOpen: true,
						Component,
						options: {
							size: 'md',
							closeOnEscape: true,
							closeOnOverlayClick: true,
							preventClose: false,
							...options,
						},
					},
				],
			}))

			return id
		},

		closeModal: (id) => {
			const { modals } = get()

			if (!id) {
				// Закрываем последний открытый модал
				const lastModal = modals[modals.length - 1]
				if (lastModal && !lastModal.options.preventClose) {
					set((state) => ({
						modals: state.modals.slice(0, -1),
					}))
				}
				return
			}

			// Закрываем конкретный модал
			const modalIndex = modals.findIndex((modal) => modal.id === id)
			if (modalIndex !== -1 && !modals[modalIndex].options.preventClose) {
				set((state) => ({
					modals: state.modals.filter((modal) => modal.id !== id),
				}))
			}
		},

		closeAllModals: () => {
			set({ modals: [] })
		},

		updateModal: (id, newOptions) => {
			set((state) => ({
				modals: state.modals.map((modal) =>
					modal.id === id
						? { ...modal, options: { ...modal.options, ...newOptions } }
						: modal,
				),
			}))
		},
	})),
)

// Хук для удобного использования
export const useModal = () => {
	const { openModal, closeModal, closeAllModals, updateModal } = useModalStore()

	return {
		openModal,
		closeModal,
		closeAllModals,
		updateModal,
		// Утилиты для частых случаев
		confirm: (options: {
			title: string
			message: string
			onConfirm: () => void | Promise<void>
			onCancel?: () => void
			confirmText?: string
			cancelText?: string
			variant?: 'default' | 'destructive'
		}) => {
			return openModal(ConfirmModal, {
				title: options.title,
				props: {
					message: options.message,
					onConfirm: options.onConfirm,
					onCancel: options.onCancel,
					confirmText: options.confirmText || 'Подтвердить',
					cancelText: options.cancelText || 'Отмена',
					variant: options.variant || 'default',
				},
			})
		},
		alert: (options: { title: string; message: string; onOk?: () => void }) => {
			return openModal(AlertModal, {
				title: options.title,
				props: {
					message: options.message,
					onOk: options.onOk,
				},
			})
		},
	}
}
