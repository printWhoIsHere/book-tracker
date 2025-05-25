import { createLogger } from '@main/core/logger'
import { NotFoundError, ValidationError } from '@main/core/errors'
import { DatabaseManager } from '@main/database/database.manager'
import { WorkspaceService } from '@main/modules/workspace/workspace.service'

import type {
	BookRecord,
	BookId,
	BookIds,
	BookAdd,
	BookUpdate,
} from './book.schema'
import { BookAddSchema, BookUpdateSchema, BookIdsSchema } from './book.schema'

const logger = createLogger('BookService')

export class BookService {
	private dbManager: DatabaseManager
	private workspaceService: WorkspaceService

	constructor() {
		this.dbManager = DatabaseManager.getInstance()
		this.workspaceService = new WorkspaceService()
	}

	async get(id: BookId): Promise<BookRecord> {
		logger.debug(`Getting book by id: ${id}`)

		const db = await this.getActiveDatabase()
		const stmt = db.prepare('SELECT * FROM books WHERE id = ?')
		const result = stmt.get(id)

		if (!result) {
			throw new NotFoundError('Book', id.toString())
		}

		logger.debug(`Book found: ${id}`)
		return this.parseTags(result)
	}

	async getAll(): Promise<BookRecord[]> {
		logger.debug('Getting all books')

		const db = await this.getActiveDatabase()
		const stmt = db.prepare('SELECT * FROM books ORDER BY createdAt DESC')
		const results = stmt.all()

		logger.debug(`Found ${results.length} books`)
		return this.parseTagsInArray(results)
	}

	async create(data: BookAdd): Promise<BookRecord> {
		const validated = BookAddSchema.parse(data)
		logger.debug('Creatin new book', validated)

		const db = await this.getActiveDatabase()

		const fields = [
			'title',
			'totalVolumes',
			'currentVolume',
			'lastName',
			'firstName',
			'middleName',
			'genre',
			'content',
			'annotation',
			'year',
			'tags',
		]

		const values = fields.map((field) => {
			const value = (validated as any)[field]
			return field === 'tags' ? JSON.stringify(value || []) : value
		})

		const placeholders = fields.map(() => '?').join(', ')
		const fieldsList = fields.join(', ')

		const stmt = db.prepare(`
			INSERT INTO books (${fieldsList})
			VALUES (${placeholders})	
		`)

		const result = stmt.run(...values)
		const newId = Number(result.lastInsertRowid)

		logger.debug(`Book created with id: ${newId}`)

		return await this.get(newId)
	}

	async update(id: BookId, data: BookUpdate): Promise<BookRecord> {
		const validated = BookUpdateSchema.parse(data)
		logger.debug(`Updating book ${id}`, validated)

		await this.get(id)

		const db = await this.getActiveDatabase()

		const fields = Object.keys(validated).filter(
			(key) => validated[key as keyof BookUpdate] !== undefined,
		)

		if (fields.length === 0) {
			logger.debug('No fields to update')
			return await this.get(id)
		}

		const setClause = fields.map((field) => `${field} = ?`).join(', ')
		const values = fields.map((field) => {
			const value = (validated as any)[field]
			return field === 'tags' ? JSON.stringify(value) : value
		})

		const stmt = db.prepare(`
					UPDATE books 
					SET ${setClause}
					WHERE id = ?
				`)

		const result = stmt.run(...values, id)

		if (result.changes === 0) {
			throw new NotFoundError('Book', id.toString())
		}

		logger.debug(`Book ${id} updated, changes: ${result.changes}`)

		return await this.get(id)
	}

	async delete(id: BookId): Promise<void> {
		logger.debug(`Deleting book ${id}`)

		await this.get(id)

		const db = await this.getActiveDatabase()
		const stmt = db.prepare('DELETE FROM books WHERE id = ?')
		const result = stmt.run(id)

		if (result.changes === 0) {
			throw new NotFoundError('Book', id.toString())
		}

		logger.debug(`Book ${id} deleted`)
	}

	async deleteMany(data: BookIds): Promise<{ deletedCount: number }> {
		const validated = BookIdsSchema.parse(data)
		logger.debug(`Deleting multiple books: [${validated.ids.join(', ')}]`)

		const db = await this.getActiveDatabase()

		// Проверяем существование всех книг
		for (const id of validated.ids) {
			await this.get(id)
		}

		const placeholders = validated.ids.map(() => '?').join(', ')
		const stmt = db.prepare(`DELETE FROM books WHERE id IN (${placeholders})`)
		const result = stmt.run(...validated.ids)

		logger.debug(`Deleted ${result.changes} books`)

		return { deletedCount: result.changes }
	}

	// Private methods

	/**
	 * Получает активную базу данных
	 */
	private async getActiveDatabase() {
		const activeWorkspace = await this.workspaceService.getActive()
		if (!activeWorkspace) {
			throw new ValidationError('No active workspace found')
		}

		const paths = this.workspaceService.getPaths(activeWorkspace.id)
		return await this.dbManager.open(paths.relDatabasePath)
	}

	/**
	 * Парсит теги из JSON строки
	 */
	private parseTags(book: any): BookRecord {
		if (book.tags && typeof book.tags === 'string') {
			try {
				book.tags = JSON.parse(book.tags)
			} catch {
				book.tags = []
			}
		}
		return book as BookRecord
	}

	/**
	 * Парсит теги для массива книг
	 */
	private parseTagsInArray(books: any[]): BookRecord[] {
		return books.map((book) => this.parseTags(book))
	}
}
