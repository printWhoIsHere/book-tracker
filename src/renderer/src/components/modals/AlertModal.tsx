import { Info } from 'lucide-react'

import { Button } from '@renderer/components/ui/button'
import { DialogBody, DialogFooter } from '@renderer/components/ui/dialog'

interface AlertModalProps extends BaseModalProps {
	message: string
	onOk?: () => void
}

export function AlertModal({ message, onOk, onClose }: AlertModalProps) {
	const handleOk = () => {
		onOk?.()
		onClose()
	}

	return (
		<>
			<DialogBody>
				<div className='flex items-center gap-4'>
					<div className='rounded-full bg-primary/10 p-3 text-primary'>
						<Info className='h-6 w-6' />
					</div>
					<p className='text-sm text-foreground leading-relaxed flex-1'>
						{message}
					</p>
				</div>
			</DialogBody>

			<DialogFooter>
				<Button onClick={handleOk}>OK</Button>
			</DialogFooter>
		</>
	)
}
