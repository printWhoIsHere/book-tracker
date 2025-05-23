import { z } from 'zod'

// =============================================================================
// Database Column Types
// =============================================================================

export const DatabaseColumnTypeSchema = z.enum([
	'TEXT',
	'INTEGER',
	'REAL',
	'BOOLEAN',
	'BLOB',
	'DATE', // для будущего использования
	'JSON', // для будущего использования
])
export type DatabaseColumnType = z.infer<typeof DatabaseColumnTypeSchema>

// =============================================================================
// Column Specification Schema
// =============================================================================

export const ColumnSpecSchema = z.object({
	key: z
		.string()
		.min(1, 'Column name required')
		.max(50, 'Column name too long')
		.regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Invalid column name format'),
	label: z.string().min(1),
	type: DatabaseColumnTypeSchema,
	required: z.boolean().default(false),
	default: z.union([z.string(), z.number(), z.boolean()]).optional(),
})
export type ColumnSpec = z.infer<typeof ColumnSpecSchema>

// =============================================================================
// Table Schema
// =============================================================================

export const RawTableColumnSchema = z.object({
	cid: z.number(),
	name: z.string(),
	type: z.string(),
	notnull: z.number(),
	dflt_value: z.string().nullable(),
	pk: z.number(),
})
export type RawTableColumn = z.infer<typeof RawTableColumnSchema>

/**
 * Упрощённый тип колонок для отдачи в UI.
 */
export interface TableColumnInfo {
	name: string
	type: string
	notnull: boolean
	defaultValue: string | null
	primaryKey: boolean
}

// =============================================================================
// Type Guards
// =============================================================================

export function isValidColumnName(name: string): boolean {
	return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name) && name.length <= 50
}

export function isValidTableName(name: string): boolean {
	return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name) && name.length <= 50
}
