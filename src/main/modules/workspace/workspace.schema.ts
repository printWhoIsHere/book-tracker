import { z } from 'zod'

// =============================================================================
// UI Column Types and Schemas
// =============================================================================

export const UIColumnTypeSchema = z.enum([
	'InputText',
	'InputTextarea',
	'InputNumber',
	'Select',
	'MultiSelect',
	'Date',
	'Checkbox',
])
export type UIColumnType = z.infer<typeof UIColumnTypeSchema>

export const UIColumnSchema = z.object({
	key: z
		.string()
		.min(1, 'Column key is required')
		.max(50, 'Column key too long')
		.regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Invalid column key format'),
	label: z
		.string()
		.min(1, 'Column label is required')
		.max(100, 'Column label too long'),
	type: UIColumnTypeSchema,
	required: z.boolean().default(false),
	// Дополнительные опции для разных типов полей
	options: z.array(z.string()).optional(), // Для Select/MultiSelect
	placeholder: z.string().optional(),
	defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
})
export type UIColumn = z.infer<typeof UIColumnSchema>

// =============================================================================
// Workspace Record Schema
// =============================================================================

export const WorkspaceRecordSchema = z.object({
	id: z.string().uuid('Invalid workspace ID format'),
	name: z
		.string()
		.min(1, 'Workspace name is required')
		.max(100, 'Workspace name too long')
		.trim(),
	description: z.string().max(500, 'Description too long').optional(),
	createdAt: z.string().datetime('Invalid creation date'),
	updatedAt: z.string().datetime('Invalid update date').optional(),
	// Метаданные
	version: z.number().int().min(1).default(1),
	tags: z.array(z.string()).default([]),
})
export type WorkspaceRecord = z.infer<typeof WorkspaceRecordSchema>

// =============================================================================
// Settings Schemas
// =============================================================================

export const TableSettingsSchema = z.object({
	pageSize: z
		.number()
		.int()
		.min(5, 'Page size too small')
		.max(100, 'Page size too large')
		.default(20),
	rowHeight: z.enum(['compact', 'default', 'comfortable']).default('default'),
	schemaVersion: z.number().int().min(1).default(1),
	schema: z.array(UIColumnSchema).default([]),
	// // Настройки сортировки и фильтрации
	// defaultSort: z
	// 	.object({
	// 		column: z.string().optional(),
	// 		direction: z.enum(['asc', 'desc']).default('asc'),
	// 	})
	// 	.optional(),
	// // Скрытые колонки
	// hiddenColumns: z.array(z.string()).default([]),
})
export type TableSettings = z.infer<typeof TableSettingsSchema>

export const TagSchema = z.object({
	name: z
		.string()
		.min(1, 'Tag name required')
		.max(50, 'Tag name too long')
		.trim(),
	color: z
		.string()
		.regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format'),
})
export type Tag = z.infer<typeof TagSchema>

export const WorkspaceSettingsSchema = z.object({
	// UI настройки
	theme: z.enum(['light', 'dark', 'system']).default('system'),
	accentColor: z.string().default('zinc'),
	language: z.enum(['en', 'ru']).default('ru'),

	// Настройки таблицы
	table: TableSettingsSchema,

	// Пользовательские данные
	genres: z
		.array(z.string().min(1).max(50))
		.max(100, 'Too many genres')
		.default([]),
	tags: z.array(TagSchema).max(50, 'Too many tags').default([]),

	// Настройки экспорта/импорта
	export: z
		.object({
			format: z.enum(['json', 'csv', 'xlsx']).default('json'),
			includeSettings: z.boolean().default(false),
		})
		.default({}),
})
export type WorkspaceSettings = z.infer<typeof WorkspaceSettingsSchema>

// =============================================================================
// Default Values
// =============================================================================

export const defaultTableSchema: UIColumn[] = [
	{
		key: 'title',
		label: 'Название',
		type: 'InputText',
		required: true,
	},
	{
		key: 'totalVolumes',
		label: 'Т',
		type: 'InputNumber',
		required: false,
	},
	{
		key: 'currentVolume',
		label: '№',
		type: 'InputNumber',
		required: false,
	},
	{
		key: 'author',
		label: 'Автор',
		type: 'InputText',
		required: false,
		// TODO: Сделать присоединённые поля!
	},
	{
		key: 'content',
		label: 'Содержание',
		type: 'InputTextarea',
		required: false,
	},
	{
		key: 'annotation',
		label: 'Аннотация',
		type: 'InputTextarea',
		required: false,
	},
	{
		key: 'genre',
		label: 'Жанр',
		type: 'Select',
		required: false,
	},
	{
		key: 'year',
		label: 'Год издания',
		type: 'InputNumber',
		required: false,
	},
	{
		key: 'tags',
		label: 'Теги',
		type: 'MultiSelect',
		required: false,
	},
]

export const defaultSettings: WorkspaceSettings = {
	theme: 'system',
	accentColor: 'zinc',
	language: 'ru',
	table: {
		pageSize: 20,
		rowHeight: 'default',
		schemaVersion: 1,
		schema: defaultTableSchema,
	},
	genres: [
		'Фантастика',
		'Фэнтези',
		'Детектив',
		'Роман',
		'Биография',
		'История',
		'Техническая литература',
		'Поэзия',
	],
	tags: [
		{ name: 'Избранное', color: '#FFD700' },
		{ name: 'В наличии', color: '#50C878' },
		{ name: 'Планируется', color: '#6495ED' },
		{ name: 'Прочитано', color: '#49c143' },
		{ name: 'Отложено', color: '#FFA500' },
		{ name: 'Нет в наличии', color: '#ff3600' },
		{ name: 'Повреждено', color: '#8B0000' },
	],
	export: {
		format: 'json',
		includeSettings: false,
	},
}

// =============================================================================
// Utility Functions
// =============================================================================

export function createWorkspaceRecord(
	name: string,
	description?: string,
): Omit<WorkspaceRecord, 'id'> {
	return {
		name: name.trim(),
		description: description?.trim(),
		createdAt: new Date().toISOString(),
		version: 1,
		tags: [],
	}
}

export function validateUIColumn(column: unknown): UIColumn {
	return UIColumnSchema.parse(column)
}

export function validateWorkspaceSettings(
	settings: unknown,
): WorkspaceSettings {
	return WorkspaceSettingsSchema.parse(settings)
}
