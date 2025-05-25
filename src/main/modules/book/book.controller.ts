import { z } from 'zod'
import { handleIpc } from '@main/utils/ipc'
import { createLogger } from '@main/core/logger'

import { BookService } from './book.service'
import {
	BookIdSchema,
	BookIdsSchema,
	BookAddSchema,
	BookUpdateSchema,
} from './book.schema'

const logger = createLogger('BookController')
const svc = new BookService()

handleIpc(
	'book:get',
	z.object({
		id: BookIdSchema,
	}),
	async (_, data) => {
		logger.debug(`Getting book via IPC: ${data.id}`)
		return await svc.get(data.id)
	},
)

handleIpc('book:get-all', null, async () => {
	logger.debug('Getting all books via IPC')
	return await svc.getAll()
})

handleIpc('book:create', BookAddSchema, async (_, data) => {
	logger.info('Creating book via IPC')
	return await svc.create(data)
})

handleIpc(
	'book:update',
	z.object({
		id: BookIdSchema,
		data: BookUpdateSchema,
	}),
	async (_, { id, data }) => {
		logger.info(`Updating book via IPC: ${id}`)
		return await svc.update(id, data)
	},
)

handleIpc(
	'book:delete',
	z.object({
		id: BookIdSchema,
	}),
	async (_, data) => {
		logger.info(`Deleting book via IPC: ${data.id}`)
		await svc.delete(data.id)
		return { success: true }
	},
)

handleIpc('book:delete-many', BookIdsSchema, async (_, data) => {
	logger.info(`Deleting multiple books via IPC: [${data.ids.join(', ')}]`)
	const result = await svc.deleteMany(data)
	return {
		success: true,
		deletedCount: result.deletedCount,
	}
})
