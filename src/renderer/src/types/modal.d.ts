interface BaseModalProps {
	onClose: () => void
}

interface ModalOptions<T extends BaseModalProps = BaseModalProps> {
	title: string
	description?: string
	size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
	closeOnEscape?: boolean
	closeOnOverlayClick?: boolean
	preventClose?: boolean
	className?: string
	props?: Omit<T, 'onClose'>
}

type ModalComponent<P extends BaseModalProps = BaseModalProps> =
	React.ComponentType<P>
