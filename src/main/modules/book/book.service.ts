import { createLogger } from '@main/core/logger'
import { NotFoundError, DatabaseError } from '@main/core/errors'
import { DatabaseManager } from '@main/database/database.manager'
import type { BookRecord } from '@main/modules/book/book.schema'
import { getWorkspacePaths } from '@main/utils/workspace'

const logger = createLogger('BookService')

export class BookService {
	private readonly dbManager: DatabaseManager

	constructor() {
		this.dbManager = DatabaseManager.getInstance()
	}

	async create(
		workspaceId: string,
		book: Partial<Omit<BookRecord, 'id' | 'createdAt' | 'updatedAt'>>,
	): Promise<BookRecord> {
		const dbPath = getWorkspacePaths(workspaceId).database

		try {
			const db = this.dbManager.get(dbPath)
			const insert = db.prepare(`
				INSERT INTO books (
					title, totalVolumes, currentVolume, 
					lastName, firstName, middleName,
					genre, content, annotation, year, tags
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				`)

			const result = insert.run(
				book.title ?? null,
				book.totalVolumes ?? null,
				book.currentVolume ?? null,
				book.lastName ?? null,
				book.firstName ?? null,
				book.middleName ?? null,
				book.genre ?? null,
				book.content ?? null,
				book.annotation ?? null,
				book.year ?? null,
				JSON.stringify(book.tags || []),
			)

			const createdBook = this.getById(
				workspaceId,
				result.lastInsertRowid as number,
			)
			logger.info(`Book created in workspace ${workspaceId}:`, {
				id: result.lastInsertRowid,
				title: book.title,
			})

			return createdBook
		} catch (error) {
			logger.error(`Failed to create book in workspace ${workspaceId}`, error)
			throw new DatabaseError('Failed to create book', error)
		}
	}

	getById(workspaceId: string, id: number): BookRecord {
		const dbPath = getWorkspacePaths(workspaceId).database

		try {
			const db = this.dbManager.get(dbPath)
			const book = db
				.prepare('SELECT * FROM books WHERE id = ?')
				.get(id) as BookRecord

			if (!book) {
				throw new NotFoundError('Book', id.toString())
			}

			book.tags = book.tags ? JSON.parse(book.tags as unknown as string) : []
			return book
		} catch (error) {
			if (error instanceof NotFoundError) throw error

			logger.error(
				`Failed to get book ${id} from workspace ${workspaceId}`,
				error,
			)
			throw new DatabaseError('Failed to retrieve book', error)
		}
	}

	async update(
		workspaceId: string,
		id: number,
		updates: Partial<Omit<BookRecord, 'id' | 'createdAt' | 'updatedAt'>>,
	): Promise<BookRecord> {
		const dbPath = getWorkspacePaths(workspaceId).database

		try {
			// Проверяем что книга существует
			this.getById(workspaceId, id)

			const db = this.dbManager.get(dbPath)

			// Строим динамический запрос обновления
			const fields = Object.keys(updates).filter((key) => key !== 'id')
			if (fields.length === 0) {
				return this.getById(workspaceId, id)
			}

			const setClause = fields.map((field) => `${field} = ?`).join(', ')
			const values = fields.map((field) => updates[field as keyof BookRecord])

			const update = db.prepare(`UPDATE books SET ${setClause} WHERE id = ?`)
			update.run(...values, id)

			logger.info(`Book updated in workspace ${workspaceId}:`, { id, fields })
			return this.getById(workspaceId, id)
		} catch (error) {
			if (error instanceof NotFoundError) throw error

			logger.error(
				`Failed to update book ${id} in workspace ${workspaceId}`,
				error,
			)
			throw new DatabaseError('Failed to update book', error)
		}
	}

	async delete(workspaceId: string, id: number): Promise<void> {
		const dbPath = getWorkspacePaths(workspaceId).database

		try {
			// Проверяем что книга существует
			const book = this.getById(workspaceId, id)

			const db = this.dbManager.get(dbPath)
			const result = db.prepare('DELETE FROM books WHERE id = ?').run(id)

			if (result.changes === 0) {
				throw new NotFoundError('Book', id.toString())
			}

			logger.info(`Book deleted from workspace ${workspaceId}:`, {
				id,
				title: book.title,
			})
		} catch (error) {
			if (error instanceof NotFoundError) throw error
			// TODO: Дифференцировать ошибки доступа к ФС (DB locked, permissions) от логических ошибок
			//       и возвращать разные коды ошибок для фронтенда.
			logger.error(
				`Failed to delete book ${id} from workspace ${workspaceId}`,
				error,
			)
			throw new DatabaseError('Failed to delete book', error)
		}
	}

	async getAllBooks(workspaceId: string): Promise<BookRecord[]> {
		const dbPath = getWorkspacePaths(workspaceId).database

		try {
			const db = this.dbManager.get(dbPath)
			const books = db
				.prepare('SELECT * FROM books ORDER BY createdAt DESC')
				.all() as BookRecord[]

			logger.debug(`Retrieved all books from workspace ${workspaceId}:`, {
				count: books.length,
			})
			return books
		} catch (error) {
			logger.error(
				`Failed to get all books from workspace ${workspaceId}`,
				error,
			)
			throw new DatabaseError('Failed to retrieve books', error)
		}
	}

	// async getStatistics(workspaceId: string): Promise<{
	// 	totalBooks: number
	// 	totalVolumes: number
	// 	genreDistribution: { genre: string; count: number }[]
	// 	yearDistribution: { year: number; count: number }[]
	// 	topAuthors: { author: string; count: number }[]
	// }> {
	// 	const dbPath = this.getDbPath(workspaceId)

	// 	try {
	// 		const db = this.dbManager.get(dbPath)

	// 		// Общее количество книг
	// 		const totalBooks = (
	// 			db.prepare('SELECT COUNT(*) as count FROM books').get() as {
	// 				count: number
	// 			}
	// 		).count

	// 		// Общее количество томов
	// 		const totalVolumes =
	// 			(
	// 				db.prepare('SELECT SUM(totalVolumes) as sum FROM books').get() as {
	// 					sum: number
	// 				}
	// 			).sum || 0

	// 		// Распределение по жанрам
	// 		const genreDistribution = db
	// 			.prepare(
	// 				`
	// 			SELECT genre, COUNT(*) as count
	// 			FROM books
	// 			WHERE genre IS NOT NULL
	// 			GROUP BY genre
	// 			ORDER BY count DESC
	// 		`,
	// 			)
	// 			.all() as { genre: string; count: number }[]

	// 		// Распределение по годам
	// 		const yearDistribution = db
	// 			.prepare(
	// 				`
	// 			SELECT year, COUNT(*) as count
	// 			FROM books
	// 			WHERE year IS NOT NULL
	// 			GROUP BY year
	// 			ORDER BY year DESC
	// 		`,
	// 			)
	// 			.all() as { year: number; count: number }[]

	// 		// Топ авторы
	// 		const topAuthors = db
	// 			.prepare(
	// 				`
	// 			SELECT (lastName || ', ' || firstName) as author, COUNT(*) as count
	// 			FROM books
	// 			WHERE lastName IS NOT NULL AND firstName IS NOT NULL
	// 			GROUP BY lastName, firstName
	// 			ORDER BY count DESC
	// 			LIMIT 10
	// 		`,
	// 			)
	// 			.all() as { author: string; count: number }[]

	// 		return {
	// 			totalBooks,
	// 			totalVolumes,
	// 			genreDistribution,
	// 			yearDistribution,
	// 			topAuthors,
	// 		}
	// 	} catch (error) {
	// 		logger.error(
	// 			`Failed to get workspace statistics for ${workspaceId}`,
	// 			error,
	// 		)
	// 		throw new DatabaseError('Failed to retrieve statistics', error)
	// 	}
	// }
}
