import fs from 'fs'
import path from 'path'
import Database, { type Database as DatabaseType } from 'better-sqlite3'

import { rootDir } from '@main/core/config'
import { createLogger } from '@main/core/logger'

import {
	RawTableColumn,
	RawTableColumnSchema,
	TableColumnInfo,
	type ColumnSpec,
} from './database.schema'
import { createTable } from './migration'

const logger = createLogger('DatabaseManager')

export class DatabaseManager {
	private cache = new Map<string, DatabaseType>()
	private static instance: DatabaseManager

	static getInstance(): DatabaseManager {
		if (!DatabaseManager.instance) {
			DatabaseManager.instance = new DatabaseManager()
		}
		return DatabaseManager.instance
	}

	/* Открывает базу. */
	open(relPath: string): DatabaseType {
		const dbPath = path.join(rootDir, relPath)
		const dir = path.dirname(dbPath)
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

		let db = this.cache.get(dbPath)
		if (!db) {
			logger.info(`Open DB: ${dbPath}`)
			db = new Database(dbPath)
			db.pragma('journal_mode = WAL')
			this.cache.set(dbPath, db)
		}
		return db
	}

	/* Создаёт новую БД и таблицу с указанной схемой. */
	create(
		relPath: string,
		tableName: string,
		columns: ColumnSpec[],
	): DatabaseType {
		const db = this.open(relPath)
		logger.info(`Applying schema for table "${tableName}"`)
		createTable(db, tableName, columns)

		return db
	}

	/* Возвращает открытое подключение из кэша или бросает ошибку. */
	get(relPath: string): DatabaseType {
		const dbPath = path.join(rootDir, relPath)
		const db = this.cache.get(dbPath)
		if (!db) throw new Error(`DB not opened: ${dbPath}`)
		return db
	}

	/* Закрывает подключение и удаляет из кэша. */
	close(relPath: string): void {
		const dbPath = path.join(rootDir, relPath)
		const db = this.cache.get(dbPath)
		if (db) {
			db.close()
			this.cache.delete(dbPath)
			logger.info(`DB closed: ${dbPath}`)
		}
	}

	getColumns(relPath: string, tableName: string): TableColumnInfo[] {
		const db = this.get(relPath)
		const stmt = db.prepare(`PRAGMA table_info(\`${tableName}\`)`)
		const rawRows = stmt.all() as unknown[]
		const cols = RawTableColumnSchema.array().parse(rawRows) as RawTableColumn[]

		return cols.map((r) => ({
			name: r.name,
			type: r.type,
			notnull: Boolean(r.notnull),
			defaultValue: r.dflt_value,
			primaryKey: Boolean(r.pk),
		}))
	}
}
