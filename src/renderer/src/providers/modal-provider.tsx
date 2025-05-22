import { useEffect } from 'react'

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@renderer/components/ui/dialog'

import { useModalStore } from '@renderer/hooks/useModal'

export function ModalProvider() {
	const { modals, closeModal } = useModalStore()

	// Обработка Escape для закрытия модалов
	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				const lastModal = modals[modals.length - 1]
				if (lastModal?.options.closeOnEscape !== false) {
					closeModal()
				}
			}
		}

		if (modals.length > 0) {
			document.addEventListener('keydown', handleEscape)
			return () => document.removeEventListener('keydown', handleEscape)
		}
	}, [modals, closeModal])

	// Блокировка скролла body когда открыт модал
	useEffect(() => {
		if (modals.length > 0) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = 'unset'
		}

		return () => {
			document.body.style.overflow = 'unset'
		}
	}, [modals.length])

	return (
		<>
			{modals.map((modal) => {
				const { id, Component, options } = modal
				const handleClose = () => {
					if (options.closeOnOverlayClick !== false) {
						closeModal(id)
					}
				}

				return (
					<Dialog key={id} open={true} onOpenChange={handleClose}>
						<DialogContent
							size={options.size}
							className={options.className}
							showCloseButton={!options.preventClose}
							onPointerDownOutside={(e) => {
								if (options.closeOnOverlayClick === false) {
									e.preventDefault()
								}
							}}
							onEscapeKeyDown={(e) => {
								if (options.closeOnEscape === false) {
									e.preventDefault()
								}
							}}
						>
							<DialogHeader>
								<DialogTitle>{options.title}</DialogTitle>
								{options.description && (
									<DialogDescription>{options.description}</DialogDescription>
								)}
							</DialogHeader>

							<Component {...options.props} onClose={() => closeModal(id)} />
						</DialogContent>
					</Dialog>
				)
			})}
		</>
	)
}
