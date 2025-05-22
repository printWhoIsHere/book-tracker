import { useState } from 'react'
import { AlertTriangle, Info } from 'lucide-react'

import { Button } from '@renderer/components/ui/button'
import { DialogBody, DialogFooter } from '@renderer/components/ui/dialog'

interface ConfirmModalProps extends BaseModalProps {
	message: string
	onConfirm: () => void | Promise<void>
	onCancel?: () => void
	confirmText?: string
	cancelText?: string
	variant?: 'default' | 'destructive'
}

export function ConfirmModal({
	message,
	onConfirm,
	onCancel,
	confirmText = 'Подтвердить',
	cancelText = 'Отмена',
	variant = 'default',
	onClose,
}: ConfirmModalProps) {
	const [isLoading, setIsLoading] = useState(false)

	const handleConfirm = async () => {
		try {
			setIsLoading(true)
			await onConfirm()
			onClose()
		} catch (error) {
			console.error('Confirm action failed:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleCancel = () => {
		onCancel?.()
		onClose()
	}

	const Icon = variant === 'destructive' ? AlertTriangle : Info

	return (
		<>
			<DialogBody>
				<div className='flex items-center gap-4'>
					<div
						className={`rounded-full p-3 ${
							variant === 'destructive'
								? 'bg-destructive/10 text-destructive'
								: 'bg-primary/10 text-primary'
						}`}
					>
						<Icon className='h-6 w-6' />
					</div>
					<p className='text-sm text-foreground leading-relaxed flex-1'>
						{message}
					</p>
				</div>
			</DialogBody>

			<DialogFooter>
				<Button variant='outline' onClick={handleCancel} disabled={isLoading}>
					{cancelText}
				</Button>
				<Button
					variant={variant === 'destructive' ? 'destructive' : 'default'}
					onClick={handleConfirm}
					disabled={isLoading}
				>
					{confirmText}
				</Button>
			</DialogFooter>
		</>
	)
}
