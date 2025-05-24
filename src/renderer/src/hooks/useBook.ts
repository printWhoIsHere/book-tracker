import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTypedMutation } from '@renderer/lib/react-query'

const BOOKS_KEY = (workspaceId: string) => ['books', workspaceId]

export function useBook(workspaceId: string) {
	const qc = useQueryClient()

	const {
		data: books = [] as Book[],
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: BOOKS_KEY(workspaceId),
		queryFn: () => window.api.book.getAll(workspaceId),
		enabled: !!workspaceId,
	})

	const create = useTypedMutation(
		(book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) =>
			window.api.book.create(workspaceId, book),
		{
			queryKey: BOOKS_KEY(workspaceId),
			successMessage: 'Книга создана',
			errorMessage: 'Не удалось создать книгу',
			onSuccess: () => {
				qc.invalidateQueries({ queryKey: BOOKS_KEY(workspaceId) })
			},
		},
	)

	const update = useTypedMutation(
		({ id, updates }: { id: number; updates: Partial<Book> }) =>
			window.api.book.update(workspaceId, id, updates),
		{
			queryKey: BOOKS_KEY(workspaceId),
			successMessage: 'Книга обновлена',
			errorMessage: 'Не удалось обновить книгу',
			onSuccess: () => {
				qc.invalidateQueries({ queryKey: BOOKS_KEY(workspaceId) })
			},
		},
	)

	const remove = useTypedMutation(
		(id: number) => window.api.book.delete(workspaceId, id),
		{
			queryKey: BOOKS_KEY(workspaceId),
			successMessage: 'Книга удалена',
			errorMessage: 'Не удалось удалить книгу',
			onSuccess: () => {
				qc.invalidateQueries({ queryKey: BOOKS_KEY(workspaceId) })
			},
		},
	)

	// 5) Пакетное удаление
	const deleteMany = useTypedMutation(
		(ids: number[]) => window.api.book.deleteMany(workspaceId, ids),
		{
			queryKey: BOOKS_KEY(workspaceId),
			successMessage: 'Книги удалены',
			errorMessage: 'Не удалось удалить книги',
			onSuccess: () => {
				qc.invalidateQueries({ queryKey: BOOKS_KEY(workspaceId) })
			},
		},
	)

	return {
		books,
		isLoading,
		error,
		refetch,

		create: create.mutate,
		isCreating: create.isPending,

		update: update.mutate,
		isUpdating: update.isPending,

		delete: remove.mutate,
		isDeleting: remove.isPending,

		deleteMany: deleteMany.mutate,
		isDeletingMany: deleteMany.isPending,
	}
}
