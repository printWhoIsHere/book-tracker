import fs from 'fs'
import path from 'path'
import Database, { type Database as DatabaseType } from 'better-sqlite3'

import { config } from '@main/core/config'
import { createLogger } from '@main/core/logger'
import { DatabaseError } from '@main/core/errors'

import { TableColumnInfo, type ColumnSpec } from './database.schema'
import { createTable } from './migration'

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

			logger.info(`Opening DB: {dbPath}`)
			db = new Database(dbPath)

			// Настройка DB
			db.pragma(`journal_mode = ${config.database.journalMode}`)

			this.cache.set(dbPath, db)
			return db
		} catch (error) {
			throw new DatabaseError(`Failed to open database: ${dbPath}`, error)
		}
	}

	async create(
		relPath: string,
		tableName: string,
		columns: ColumnSpec[],
	): Promise<DatabaseType> {
		try {
			const db = await this.open(relPath)
			logger.info(`Creating table "${tableName}" in ${relPath}`)

			// TODO:
			await createTable(db, tableName, columns)
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

	getColumns(relPath: string, tableName: string): TableColumnInfo[] {
		try {
			const db = this.get(relPath),
				stmt = db.prepare(`PRAGMA table_info(\`${tableName}\`)`),
				rawRows = stmt.all()

			return rawRows.map((row: any) => ({
				name: row.name,
				type: row.type,
				notnull: Boolean(row.notnull),
				defaultValue: row.dflt_value,
				primaryKey: Boolean(row.pk),
			}))
		} catch (error) {
			throw new DatabaseError(
				`Failed to get columns for table "${tableName}"`,
				error,
			)
		}
	}

	closeAll(): void {
		for (const [path, db] of this.cache.entries()) {
			try {
				db.close
				logger.info(`Closed DB: ${path}`)
			} catch (error) {
				logger.error(`Error closing DB: ${path}`, error)
			}
		}
		this.cache.clear()
	}
}
