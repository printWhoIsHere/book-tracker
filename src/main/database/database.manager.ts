import fs from 'fs'
import path from 'path'
import Database, { type Database as DatabaseType } from 'better-sqlite3'

import { config } from '@main/core/config'
import { createLogger } from '@main/core/logger'
import { DatabaseError } from '@main/core/errors'

import type { BookRecord } from '@main/modules/book/book.schema'

const logger = createLogger('DatabaseManager')

export class DatabaseManager {
	private cache = new Map<string, DatabaseType>()
	private static instance: DatabaseManager

	private constructor() {}

	static getInstance(): DatabaseManager {
		if (!DatabaseManager.instance) {
			DatabaseManager.instance = new DatabaseManager()
		}
		return DatabaseManager.instance
	}

	async open(relPath: string): Promise<DatabaseType> {
		const dbPath = path.join(config.rootDir, relPath)

		// Проверка кеша
		let db = this.cache.get(dbPath)
		if (db) {
			return db
		}

		try {
			// Создать директорию, если её нет
			const dir = path.dirname(dbPath)
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, { recursive: true })
			}

			logger.info(`Opening DB: ${dbPath}`)
			db = new Database(dbPath)

			// Настройка DB
			db.pragma(`journal_mode = ${config.database.journalMode}`)
			db.pragma(`synchronous = ${config.database.synchronous}`)
			db.pragma(`cache_size = ${config.database.cache_size}`)
			db.pragma(`temp_store = ${config.database.temp_store}`)

			this.cache.set(dbPath, db)
			return db
		} catch (error) {
			throw new DatabaseError(`Failed to open database: ${dbPath}`, error)
		}
	}

	async create(relPath: string, tableName: string): Promise<DatabaseType> {
		try {
			const db = await this.open(relPath)
			logger.info(`Creating table "${tableName}" in ${relPath}`)

			this.createTable(db, tableName)

			// Вставляем моковые данные в dev режиме
			if (config.isDev) {
				await this.insertMockData(db, tableName)
			}

			return db
		} catch (error) {
			throw new DatabaseError(
				`Failed to create table "${tableName}" in ${relPath}`,
				error,
			)
		}
	}

	get(relPath: string): DatabaseType {
		const dbPath = path.join(config.rootDir, relPath)
		const db = this.cache.get(dbPath)

		if (!db) {
			throw new DatabaseError(`Database not opened: ${dbPath}`)
		}

		return db
	}

	close(relPath: string): void {
		const dbPath = path.join(config.rootDir, relPath)
		const db = this.cache.get(dbPath)

		if (db) {
			try {
				db.close()
				this.cache.delete(dbPath)
				logger.info(`DB closed: ${dbPath}`)
			} catch (error) {
				logger.error(`Error closing DB: ${dbPath}`, error)
			}
		}
	}

	closeAll(): void {
		for (const [path, db] of this.cache.entries()) {
			try {
				db.close()
				logger.info(`Closed DB: ${path}`)
			} catch (error) {
				logger.error(`Error closing DB: ${path}`, error)
			}
		}
		this.cache.clear()
	}

	async exportData(relPath: string): Promise<any> {
		try {
			const db = this.get(relPath)
			const books = db.prepare('SELECT * FROM books').all()

			return {
				books,
				exportedAt: new Date().toISOString(),
				totalRecords: books.length,
			}
		} catch (error) {
			throw new DatabaseError(`Failed to export data from ${relPath}`, error)
		}
	}

	async vacuum(relPath: string): Promise<void> {
		try {
			const db = this.get(relPath)
			db.exec('VACUUM')
			logger.info(`Database vacuumed: ${relPath}`)
		} catch (error) {
			throw new DatabaseError(`Failed to vacuum database ${relPath}`, error)
		}
	}

	async getStats(relPath: string): Promise<{ size: number; records: number }> {
		try {
			const dbPath = path.join(config.rootDir, relPath)
			const stats = fs.statSync(dbPath)

			const db = this.get(relPath)
			const result = db
				.prepare('SELECT COUNT(*) as count FROM books')
				.get() as { count: number }

			return {
				size: stats.size,
				records: result.count,
			}
		} catch (error) {
			throw new DatabaseError(
				`Failed to get database stats for ${relPath}`,
				error,
			)
		}
	}

	private createTable(db: DatabaseType, tableName: string): void {
		db.exec(`
			CREATE TABLE IF NOT EXISTS ${tableName} (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				title TEXT,
				totalVolumes INTEGER,
				currentVolume INTEGER,
				lastName TEXT,
				firstName TEXT,
				middleName TEXT,
				genre TEXT,
				content TEXT,
				annotation TEXT,
				year INTEGER,
				tags TEXT
			)	
		`)

		// Создаем индексы для улучшения производительности
		db.exec(`
			CREATE INDEX IF NOT EXISTS idx_books_title ON ${tableName}(title);
			CREATE INDEX IF NOT EXISTS idx_books_author ON ${tableName}(lastName, firstName);
			CREATE INDEX IF NOT EXISTS idx_books_genre ON ${tableName}(genre);
			CREATE INDEX IF NOT EXISTS idx_books_year ON ${tableName}(year);
		`)

		// Создаем триггер для автоматического обновления updatedAt
		db.exec(`
			CREATE TRIGGER IF NOT EXISTS update_${tableName}_timestamp 
			AFTER UPDATE ON ${tableName}
			BEGIN
				UPDATE ${tableName} SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
			END;
		`)

		logger.info(`Table "${tableName}" created with indexes and triggers`)
	}

	private async insertMockData(
		db: DatabaseType,
		tableName: string,
	): Promise<void> {
		try {
			const count = db
				.prepare(`SELECT COUNT(*) as count FROM ${tableName}`)
				.get() as { count: number }
			if (count.count > 0) {
				logger.info('Mock data already exists, skipping insertion')
				return
			}

			const mockFilePath = path.join(config.rootDir, 'mock.json')
			const jsonData = fs.readFileSync(mockFilePath, 'utf-8')
			const mockBooks: Omit<BookRecord, 'id'>[] = JSON.parse(jsonData)

			const insert = db.prepare(`
				INSERT INTO ${tableName} (
					title, totalVolumes, currentVolume, lastName, firstName, middleName,
					genre, content, annotation, year, tags
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`)

			const insertMany = db.transaction((books: typeof mockBooks) => {
				for (const book of books) {
					insert.run(
						book.title,
						book.totalVolumes,
						book.currentVolume,
						book.lastName,
						book.firstName,
						book.middleName,
						book.genre,
						book.content,
						book.annotation,
						book.year,
						book.tags,
					)
				}
			})

			insertMany(mockBooks)
			logger.info(`Inserted ${mockBooks.length} mock books into ${tableName}`)
		} catch (error) {
			logger.error('Failed to insert mock data', error)
			throw new DatabaseError('Failed to insert mock data', error)
		}
	}
}
