import { useState } from 'react'

import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { DialogBody, DialogFooter } from '@renderer/components/ui/dialog'

interface BookFormModalProps extends BaseModalProps {
	book?: {
		id?: string
		title: string
		author: string
		genre: string
	}
	onSave: (book: any) => Promise<void>
}

export function BookFormModal({ book, onSave, onClose }: BookFormModalProps) {
	const [formData, setFormData] = useState({
		title: book?.title || '',
		author: book?.author || '',
		genre: book?.genre || '',
	})
	const [isLoading, setIsLoading] = useState(false)
	const [errors, setErrors] = useState<Record<string, string>>({})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		// Простая валидация
		const newErrors: Record<string, string> = {}
		if (!formData.title.trim()) newErrors.title = 'Название обязательно'
		if (!formData.author.trim()) newErrors.author = 'Автор обязателен'

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors)
			return
		}

		try {
			setIsLoading(true)
			await onSave({ ...book, ...formData })
			onClose()
		} catch (error) {
			console.error('Save failed:', error)
			// Здесь можно показать уведомление об ошибке
		} finally {
			setIsLoading(false)
		}
	}

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }))
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: '' }))
		}
	}

	return (
		<form onSubmit={handleSubmit}>
			<DialogBody className='space-y-4'>
				<div className='space-y-2'>
					<Label htmlFor='title'>Название книги</Label>
					<Input
						id='title'
						value={formData.title}
						onChange={(e) => handleChange('title', e.target.value)}
						placeholder='Введите название книги'
					/>
				</div>

				<div className='space-y-2'>
					<Label htmlFor='author'>Автор</Label>
					<Input
						id='author'
						value={formData.author}
						onChange={(e) => handleChange('author', e.target.value)}
						placeholder='Введите имя автора'
					/>
				</div>

				<div className='space-y-2'>
					<Label htmlFor='genre'>Жанр</Label>
					<Input
						id='genre'
						value={formData.genre}
						onChange={(e) => handleChange('genre', e.target.value)}
						placeholder='Введите жанр'
					/>
				</div>
			</DialogBody>

			<DialogFooter>
				<Button
					type='button'
					variant='outline'
					onClick={onClose}
					disabled={isLoading}
				>
					Отмена
				</Button>
				<Button type='submit' disabled={isLoading}>
					{book?.id ? 'Обновить' : 'Создать'}
				</Button>
			</DialogFooter>
		</form>
	)
}
