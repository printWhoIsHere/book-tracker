import { z } from 'zod'
import { handleIpc } from '@main/utils/ipc'
import { createLogger } from '@main/core/logger'
import { BookService } from './book.service'

const logger = createLogger('BookController')
const bookService = new BookService()

handleIpc(
	'book:create',
	z.object({
		workspaceId: z.string().uuid(),
		book: BookRecordSchema,
	}),
	async (_, data) => {
		logger.info('Creating book', {
			workspaceId: data.workspaceId,
			title: data.book.title,
		})
		return await bookService.createBook(data.workspaceId, data.book)
	},
)

handleIpc('book:get-by-id', BookIdSchema, (_, data) => {
	logger.debug('Getting book by id', {
		workspaceId: data.workspaceId,
		id: data.id,
	})
	return bookService.getBookById(data.workspaceId, data.id)
})

handleIpc(
	'book:update',
	z.object({
		workspaceId: z.string().uuid(),
		id: z.number().int().positive(),
		updates: UpdateBookSchema,
	}),
	async (_, data) => {
		logger.info('Updating book', { workspaceId: data.workspaceId, id: data.id })
		return await bookService.updateBook(data.workspaceId, data.id, data.updates)
	},
)

handleIpc('book:delete', BookIdSchema, async (_, data) => {
	logger.info('Deleting book', { workspaceId: data.workspaceId, id: data.id })
	await bookService.deleteBook(data.workspaceId, data.id)
	return { success: true }
})

// Поиск и фильтрация
handleIpc('book:search', SearchBooksSchema, async (_, data) => {
	logger.debug('Searching books', {
		workspaceId: data.workspaceId,
		filters: data.filters,
		pagination: data.pagination,
	})
	return await bookService.searchBooks(
		data.workspaceId,
		data.filters,
		data.pagination,
	)
})

handleIpc('book:get-all', WorkspaceIdSchema, async (_, data) => {
	logger.debug('Getting all books', { workspaceId: data.workspaceId })
	return await bookService.getAllBooks(data.workspaceId)
})

handleIpc(
	'book:get-by-genre',
	z.object({
		workspaceId: z.string().uuid(),
		genre: z.string().min(1),
	}),
	async (_, data) => {
		logger.debug('Getting books by genre', {
			workspaceId: data.workspaceId,
			genre: data.genre,
		})
		return await bookService.getBooksByGenre(data.workspaceId, data.genre)
	},
)

handleIpc('book:get-by-author', AuthorSchema, async (_, data) => {
	logger.debug('Getting books by author', {
		workspaceId: data.workspaceId,
		author: `${data.lastName}${data.firstName ? ', ' + data.firstName : ''}`,
	})
	return await bookService.getBooksByAuthor(
		data.workspaceId,
		data.lastName,
		data.firstName,
	)
})

// Метаданные
handleIpc('book:get-genres', WorkspaceIdSchema, async (_, data) => {
	logger.debug('Getting unique genres', { workspaceId: data.workspaceId })
	return await bookService.getUniqueGenres(data.workspaceId)
})

handleIpc('book:get-authors', WorkspaceIdSchema, async (_, data) => {
	logger.debug('Getting unique authors', { workspaceId: data.workspaceId })
	return await bookService.getUniqueAuthors(data.workspaceId)
})

handleIpc('book:get-statistics', WorkspaceIdSchema, async (_, data) => {
	logger.debug('Getting workspace statistics', {
		workspaceId: data.workspaceId,
	})
	return await bookService.getWorkspaceStatistics(data.workspaceId)
})

// Batch операции
handleIpc(
	'book:create-many',
	z.object({
		workspaceId: z.string().uuid(),
		books: z.array(BookRecordSchema).min(1).max(100),
	}),
	async (_, data) => {
		logger.info('Creating multiple books', {
			workspaceId: data.workspaceId,
			count: data.books.length,
		})

		const results = []
		for (const book of data.books) {
			try {
				const created = await bookService.createBook(data.workspaceId, book)
				results.push({ success: true, book: created })
			} catch (error) {
				results.push({
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error',
					title: book.title,
				})
			}
		}

		const successful = results.filter((r) => r.success).length
		logger.info(
			`Batch create completed: ${successful}/${data.books.length} successful`,
		)

		return {
			results,
			total: data.books.length,
			successful,
			failed: data.books.length - successful,
		}
	},
)

handleIpc(
	'book:update-many',
	z.object({
		workspaceId: z.string().uuid(),
		updates: z
			.array(
				z.object({
					id: z.number().int().positive(),
					data: UpdateBookSchema,
				}),
			)
			.min(1)
			.max(100),
	}),
	async (_, data) => {
		logger.info('Updating multiple books', {
			workspaceId: data.workspaceId,
			count: data.updates.length,
		})

		const results = []
		for (const update of data.updates) {
			try {
				const updated = await bookService.updateBook(
					data.workspaceId,
					update.id,
					update.data,
				)
				results.push({ success: true, book: updated })
			} catch (error) {
				results.push({
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error',
					id: update.id,
				})
			}
		}

		const successful = results.filter((r) => r.success).length
		logger.info(
			`Batch update completed: ${successful}/${data.updates.length} successful`,
		)

		return {
			results,
			total: data.updates.length,
			successful,
			failed: data.updates.length - successful,
		}
	},
)

handleIpc(
	'book:delete-many',
	z.object({
		workspaceId: z.string().uuid(),
		ids: z.array(z.number().int().positive()).min(1).max(100),
	}),
	async (_, data) => {
		logger.info('Deleting multiple books', {
			workspaceId: data.workspaceId,
			count: data.ids.length,
		})

		const results = []
		for (const id of data.ids) {
			try {
				await bookService.deleteBook(data.workspaceId, id)
				results.push({ success: true, id })
			} catch (error) {
				results.push({
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error',
					id,
				})
			}
		}

		const successful = results.filter((r) => r.success).length
		logger.info(
			`Batch delete completed: ${successful}/${data.ids.length} successful`,
		)

		return {
			results,
			total: data.ids.length,
			successful,
			failed: data.ids.length - successful,
		}
	},
)
