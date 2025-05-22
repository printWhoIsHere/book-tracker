import { z } from 'zod'

export const ColumnTypeSchema = z.enum(['TEXT', 'INTEGER', 'REAL', 'BOOLEAN'])
export type ColumnType = z.infer<typeof ColumnTypeSchema>

export const ColumnSpecSchema = z.object({
	key: z
		.string()
		.min(1)
		.regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Invalid column name'),
	label: z.string().min(1),
	type: ColumnTypeSchema,
	required: z.boolean().default(false),
	default: z.union([z.string(), z.number(), z.boolean()]).optional(),
})
export type ColumnSpec = z.infer<typeof ColumnSpecSchema>

/**
 * Модель, описывающая строку результата PRAGMA table_info
 */
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
