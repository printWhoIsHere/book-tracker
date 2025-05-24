import { z } from 'zod'
import { handleIpc } from '@main/utils/ipc'
import { createLogger } from '@main/core/logger'

import { BookService } from './book.service'
import {
	BookIdSchema,
	BookRecordSchema,
	BookUpdateSchema,
	DeleteManyResult,
} from './book.schema'

const logger = createLogger('BookController')
const svc = new BookService()

handleIpc(
	'book:create',
	z.object({
		workspaceId: z.string().uuid(),
		book: BookRecordSchema.omit({
			id: true,
			createdAt: true,
			updatedAt: true,
		}),
	}),
	async (_, data) => {
		logger.info('Creating book', {
			workspaceId: data.workspaceId,
			title: data.book.title,
		})
		return await svc.create(data.workspaceId, data.book)
	},
)

handleIpc('book:get', BookIdSchema, (_, data) => {
	logger.debug('Getting book by id', {
		workspaceId: data.workspaceId,
		id: data.id,
	})
	return svc.getById(data.workspaceId, data.id)
})

handleIpc(
	'book:update',
	z.object({
		workspaceId: z.string().uuid(),
		id: z.number().int().positive(),
		updates: BookUpdateSchema,
	}),
	async (_, data) => {
		logger.info('Updating book', { workspaceId: data.workspaceId, id: data.id })
		return await svc.update(data.workspaceId, data.id, data.updates)
	},
)

handleIpc('book:delete', BookIdSchema, async (_, data) => {
	logger.info('Deleting book', { workspaceId: data.workspaceId, id: data.id })
	await svc.delete(data.workspaceId, data.id)
	return { success: true }
})

handleIpc(
	'book:get-all',
	z.object({ workspaceId: z.string().uuid() }),
	async (_, data) => {
		logger.debug('Getting all books', { workspaceId: data.workspaceId })
		return await svc.getAllBooks(data.workspaceId)
	},
)

handleIpc(
	'book:delete-many',
	z.object({
		workspaceId: z.string().uuid(),
		ids: z.array(z.number().int().positive()).min(1),
	}),
	async (_, data) => {
		logger.info('Deleting multiple books', {
			workspaceId: data.workspaceId,
			count: data.ids.length,
		})

		// TODO: Проверить права доступа: может быть перезапущен несколько раз,
		//       или ids может содержать чужие записи — валидировать, что все id действительно
		//       принадлежат данному workspace перед удалением.

		const results: DeleteManyResult[] = []
		for (const id of data.ids) {
			try {
				await svc.delete(data.workspaceId, id)
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
