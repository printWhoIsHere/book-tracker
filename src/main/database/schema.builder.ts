import { ColumnSpec } from './database.schema'

/**
 * Генерирует SQL для создания таблицы с заданными столбцами.
 * @param tableName - имя таблицы
 * @param columns - спецификация столбцов
 * @returns SQL-строка CREATE TABLE
 */
export function buildCreateTable(
	tableName: string,
	columns: ColumnSpec[],
): string {
	if (!columns.length) {
		throw new Error(`Cannot create table '${tableName}': no columns provided`)
	}

	const defs = columns.map((col) => {
		let def = `\`${col.label}\` ${col.type}`
		if (col.required) def += ' NOT NULL'
		if (col.default !== undefined && col.default !== null) {
			const d =
				typeof col.default === 'string' ? `'${col.default}'` : col.default
			def += ` DEFAULT ${d}`
		}
		return def
	})

	return `CREATE TABLE IF NOT EXISTS \`${tableName}\` (
    ${defs.join(',\n    ')}
  )`
}
