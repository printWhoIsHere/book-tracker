import { useEffect, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { useWorkspace } from './useWorkspace'
import { generateColumns } from '@renderer/components/data-table/columns'

export const useTableSchema = () => {
	const { activeWorkspace } = useWorkspace()
	const [columns, setColumns] = useState<ColumnDef<Book, any>[]>([])
	const [schema, setSchema] = useState<UIColumn[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const loadSchema = async () => {
			if (!activeWorkspace?.id) {
				setIsLoading(false)
				return
			}

			try {
				setIsLoading(true)
				setError(null)

				// Получаем настройки workspace
				const settings = await window.api.workspace.getSettings({
					id: activeWorkspace.id,
				})
				const tableSchema = settings.table.schema || []

				// Генерируем колонки на основе схемы
				const generatedColumns = generateColumns(tableSchema)

				setSchema(tableSchema)
				setColumns(generatedColumns)
			} catch (err) {
				console.error('Failed to load table schema:', err)
				setError(err instanceof Error ? err.message : 'Failed to load schema')
			} finally {
				setIsLoading(false)
			}
		}

		loadSchema()
	}, [activeWorkspace?.id])

	const updateSchema = async (newSchema: UIColumn[]) => {
		if (!activeWorkspace?.id) return

		try {
			// Обновляем схему в настройках workspace
			await window.api.workspace.updateSettings({
				id: activeWorkspace.id,
				patch: {
					table: {
						schema: newSchema,
					},
				},
			})

			// Генерируем новые колонки
			const generatedColumns = generateColumns(newSchema)

			setSchema(newSchema)
			setColumns(generatedColumns)
		} catch (err) {
			console.error('Failed to update schema:', err)
			throw err
		}
	}

	return {
		columns,
		schema,
		isLoading,
		error,
		updateSchema,
	}
}
