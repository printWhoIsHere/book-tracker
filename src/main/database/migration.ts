import { Database } from 'better-sqlite3'
import { buildCreateTable } from './schema.builder'
import { ColumnSpec } from './database.schema'

/**
 * Создает таблицу с указанной схемой.
 * @param db - экземпляр better-sqlite3 Database
 * @param tableName - имя таблицы
 * @param columns - спецификация столбцов
 */
export function createTable(
	db: Database,
	tableName: string,
	columns: ColumnSpec[],
): void {
	db.exec(buildCreateTable(tableName, columns))
}
